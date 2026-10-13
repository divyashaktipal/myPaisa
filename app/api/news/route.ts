import { NextResponse } from "next/server";
import { serp, normalizeGoogleFinanceSymbol } from "@/lib/serpapi";
import type { SerpApiFinanceResponse } from "@/lib/serpapi";
import type { NewsStoryItem, MarketNewsResponse } from "@/types/MarketNews";
import { auth } from "@/auth";
import { batchGenerateGeminiSummaries } from "@/lib/gemini";

export const dynamic = "force-dynamic";

// Common financial & English non-ticker terms to ignore when deducing stock symbols
const STOP_WORDS = new Set([
  "THE", "AND", "FOR", "NEW", "ALL", "TOP", "Q1", "Q2", "Q3", "Q4",
  "FY24", "FY25", "FY26", "FY27", "CEO", "CFO", "IPO", "RBI", "SEBI", "USD",
  "INR", "GDP", "AI", "US", "UK", "EU", "LTD", "PLC", "CORP", "INC",
  "NEWS", "TODAY", "ALERT", "STOCK", "STOCKS", "SHARE", "SHARES",
  "MARKET", "GAIN", "LOSS", "BUY", "SELL", "HOLD", "RECORD", "HIGH",
  "LOW", "SURGE", "PLUNGE", "FALL", "RISE", "BEAT", "MISS", "CRASH",
  "JUMP", "DROP", "SOAR", "DIP", "SLUMP", "INDIA", "GLOBAL", "NET",
  "PROFIT", "REVENUE", "DEAL", "TARGET", "PRICE", "CALL", "UPDATE",
  "WHY", "HOW", "WHAT", "WHO", "WITH", "FROM", "OVER", "INTO", "DOWN",
  "AFTER", "BEFORE", "MORE", "LESS", "YEAR", "WEEK", "DAY", "MONTH",
  "REPORT", "POSTS", "SEES", "HITS", "BULL", "BEAR", "RATE", "RATES",
  "BANK", "BANKS", "GROUP", "GROWTH", "FUNDS", "FUND", "TRADE", "TRADING"
]);

// Helper to deduce relevant stock tickers dynamically from headline without hardcoded stock names
function extractTickers(text: string): string[] {
  if (!text) return ["MARKET"];

  // 1. Detect explicit exchange-prefixed tickers: e.g. NSE:TCS, BSE:RELIANCE
  const exchangeMatch = text.match(/\b(?:NSE|BSE|INDEXNSE|INDEXBOM):([A-Z0-9_-]+)\b/i);
  if (exchangeMatch?.[1]) {
    return [exchangeMatch[1].toUpperCase()];
  }

  // 2. Detect parenthesized stock tickers: e.g. (TCS), (INFY), (AAPL)
  const parenMatches = Array.from(text.matchAll(/\(([A-Z]{2,10})\)/g))
    .map((m) => m[1]?.toUpperCase())
    .filter((t) => t && !STOP_WORDS.has(t));
  if (parenMatches.length > 0) {
    return Array.from(new Set(parenMatches)).slice(0, 3);
  }

  // 3. Detect dollar-prefixed stock tickers: e.g. $RELIANCE, $NVDA
  const dollarMatches = Array.from(text.matchAll(/\$([A-Z]{2,10})\b/g))
    .map((m) => m[1]?.toUpperCase())
    .filter((t) => t && !STOP_WORDS.has(t));
  if (dollarMatches.length > 0) {
    return Array.from(new Set(dollarMatches)).slice(0, 3);
  }

  // 4. Detect major market index references
  const upper = text.toUpperCase();
  if (upper.includes("BANK NIFTY") || upper.includes("BANKNIFTY")) return ["BANK NIFTY"];
  if (upper.includes("NIFTY 50") || upper.includes("NIFTY50")) return ["NIFTY 50"];
  if (upper.includes("NIFTY 100")) return ["NIFTY 100"];
  if (upper.includes("NIFTY 200")) return ["NIFTY 200"];
  if (upper.includes("NIFTY")) return ["NIFTY"];
  if (upper.includes("SENSEX")) return ["SENSEX"];

  // 5. Extract uppercase acronyms/tickers that are not generic stop words
  const words = text.match(/\b[A-Z]{2,10}\b/g) || [];
  const candidateTickers = words
    .map((w) => w.toUpperCase())
    .filter((w) => !STOP_WORDS.has(w));

  if (candidateTickers.length > 0) {
    return Array.from(new Set(candidateTickers)).slice(0, 3);
  }

  return ["MARKET"];
}

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
    let rawNews: Array<{
      title?: string;
      snippet?: string;
      source?: string;
      date?: string;
      link?: string;
      thumbnail?: string;
    }> = [];

    if (query) {
      // Query specific stock or index from Google Finance via SerpApi
      const targetSymbol = normalizeGoogleFinanceSymbol(query);
      const liveData = await serp<SerpApiFinanceResponse>(
        { engine: "google_finance", q: targetSymbol, hl: "en" },
        120
      ).catch(() => null);

      rawNews = liveData?.news_results || [];
    } else {
      // Top stories & category streams: Fetch live market news results from Google Finance via SerpApi
      let targetIndex = "NIFTY_50:INDEXNSE";
      if (category === "nifty100") targetIndex = "NIFTY_100:INDEXNSE";
      else if (category === "nifty200") targetIndex = "NIFTY_200:INDEXNSE";

      // Fetch index news directly from Google Finance SerpApi
      const [indexData, marketsData] = await Promise.all([
        serp<SerpApiFinanceResponse>({ engine: "google_finance", q: targetIndex, hl: "en" }, 120).catch(() => null),
        serp<{ news_results?: SerpApiFinanceResponse["news_results"] }>(
          { engine: "google_finance_markets", trend: "indexes", hl: "en" },
          120
        ).catch(() => null),
      ]);

      const indexNews = indexData?.news_results || [];
      const marketsNews = marketsData?.news_results || [];

      // Combine and deduplicate by article link or headline
      const seenLinks = new Set<string>();
      for (const item of [...indexNews, ...marketsNews]) {
        const key = item.link || item.snippet || item.title;
        if (key && !seenLinks.has(key)) {
          seenLinks.add(key);
          rawNews.push(item);
        }
      }
    }

    if (rawNews.length > 0) {
      const newsForSummary = rawNews.slice(0, 8).map((item) => ({
        title: item.title || item.snippet || "Market update",
        source: item.source || "Financial Wire",
        snippet: item.snippet && item.snippet !== item.title ? item.snippet : "",
      }));

      let generatedSummaries: string[] = [];
      try {
        generatedSummaries = await batchGenerateGeminiSummaries(newsForSummary);
      } catch (sumErr) {
        console.warn("Batch summary generation in /api/news skipped:", sumErr);
      }

      const liveStories: NewsStoryItem[] = rawNews.map((item, idx) => {
        const title = item.title || item.snippet || "Market update";
        const source = item.source || "Financial Wire";
        const tickers = query ? [query.toUpperCase()] : extractTickers(title);
        const aiSummary = generatedSummaries[idx];
        const summary =
          aiSummary && aiSummary !== title
            ? aiSummary
            : item.snippet && item.snippet !== title
            ? item.snippet
            : "";

        return {
          id: `news-${idx}-${Date.now()}`,
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

      // Split real news into lead story, shorts, and remaining stories
      const leadStory = liveStories.length > 0 ? { ...liveStories[0], isLead: true } : null;
      const shorts = liveStories.slice(1, 5);
      const stories = liveStories.length > 1 ? liveStories.slice(1) : liveStories;

      const response: MarketNewsResponse = {
        success: true,
        leadStory,
        shorts,
        stories,
        activeFilter: category,
        asOf: new Date().toISOString(),
        query,
      };

      return NextResponse.json(response);
    }
  } catch (err) {
    console.warn("SerpApi news fetch notice:", err);
  }

  // Return empty response with no hardcoded mock data
  const response: MarketNewsResponse = {
    success: true,
    leadStory: null,
    shorts: [],
    stories: [],
    activeFilter: category,
    asOf: new Date().toISOString(),
    query,
  };

  return NextResponse.json(response);
}
