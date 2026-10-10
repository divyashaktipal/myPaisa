import { NextResponse } from "next/server";
import { serp, normalizeGoogleFinanceSymbol } from "@/lib/serpapi";
import type { SerpApiFinanceResponse } from "@/lib/serpapi";
import {
  FALLBACK_LEAD_STORY,
  FALLBACK_SHORTS,
  FALLBACK_STORIES,
} from "@/constants/MarketNews";
import type { NewsStoryItem, MarketNewsResponse } from "@/types/MarketNews";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Helper to deduce relevant stock tickers from headline
function extractTickers(text: string): string[] {
  const upper = text.toUpperCase();
  const knownTickers = [
    "INFY", "TCS", "WIPRO", "HCLTECH", "LUPIN", "HDFCBANK", "SBIN",
    "RELIANCE", "TATAMOTORS", "ICICIBANK", "BHARTIARTL", "KOTAKBANK",
    "BANKINDIA", "ADANIENT", "ADANIPORTS", "ITC", "LT", "MARUTI",
    "SUNPHARMA", "AXISBANK", "NTPC", "ONGC", "TITAN", "POWERGRID",
  ];
  const matches = knownTickers.filter(
    (t) => upper.includes(t) || upper.includes(t.replace("BANK", ""))
  );
  if (matches.length > 0) return matches.slice(0, 3);
  if (upper.includes("NIFTY")) return ["NIFTY 50"];
  if (upper.includes("SENSEX")) return ["SENSEX"];
  return ["MARKET"];
}

import { batchGenerateGeminiSummaries } from "@/lib";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Sign in required to access market news feed." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "top_stories";
  const query = searchParams.get("query")?.trim() || "";

  try {
    let targetSymbol = "NIFTY_50:INDEXNSE";
    if (query) {
      targetSymbol = normalizeGoogleFinanceSymbol(query);
    } else if (category === "nifty100") {
      targetSymbol = "NIFTY_100:INDEXNSE";
    } else if (category === "nifty200") {
      targetSymbol = "NIFTY_200:INDEXNSE";
    }

    const liveData = await serp<SerpApiFinanceResponse>(
      { engine: "google_finance", q: targetSymbol },
      120
    ).catch(() => null);

    const rawNews = liveData?.news_results || [];

    if (rawNews.length > 0) {
      // Summarize news stories using Gemini API endpoint from env
      const itemsToSummarize = rawNews.map((item) => ({
        title: item.title || item.snippet || "Market update",
        source: item.source || "Financial Wire",
        snippet: item.snippet || "",
      }));

      const geminiSummaries = await batchGenerateGeminiSummaries(itemsToSummarize);

      const liveStories: NewsStoryItem[] = rawNews.map((item, idx) => {
        const title = item.title || item.snippet || "Market update";
        const source = item.source || "Financial Wire";
        const tickers = query ? [query.toUpperCase()] : extractTickers(title);
        const summary = geminiSummaries[idx] || item.snippet || title;

        return {
          id: `live-${idx}-${Date.now()}`,
          title,
          source,
          date: item.date || "Just now",
          link: item.link || "#",
          thumbnail: item.thumbnail,
          tickers,
          summary,
          category,
        };
      });

      // If user queried a specific stock, set first item as lead
      const leadStory = query ? { ...liveStories[0], isLead: true } : FALLBACK_LEAD_STORY;
      const filteredStories = query ? liveStories.slice(1) : [...liveStories, ...FALLBACK_STORIES].slice(0, 8);

      const response: MarketNewsResponse = {
        success: true,
        leadStory,
        shorts: FALLBACK_SHORTS,
        stories: filteredStories.length > 0 ? filteredStories : FALLBACK_STORIES,
        activeFilter: category,
        asOf: new Date().toISOString(),
        query,
      };

      return NextResponse.json(response);
    }
  } catch (err) {
    console.warn("SerpApi news fetch notice, serving curated fallback feed:", err);
  }

  // Fallback to high quality market newsroom feed
  const response: MarketNewsResponse = {
    success: true,
    leadStory: FALLBACK_LEAD_STORY,
    shorts: FALLBACK_SHORTS,
    stories: FALLBACK_STORIES,
    activeFilter: category,
    asOf: new Date().toISOString(),
    query,
  };

  return NextResponse.json(response);
}
