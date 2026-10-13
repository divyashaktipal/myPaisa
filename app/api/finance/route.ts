import { NextResponse } from "next/server";
import {
  getChart,
  getStock,
  normalizeGoogleFinanceSymbol,
  type SerpApiFinanceResponse,
  createErrorResponse,
  batchGenerateGeminiSummaries,
} from "@/lib";
import { auth } from "@/auth";
import { HTTP_STATUS } from "@/constants";
import { env } from "@/config";

export const dynamic = "force-dynamic";

const VALID_WINDOWS = new Set(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"]);

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return createErrorResponse(
      HTTP_STATUS.UNAUTHORIZED,
      "Unauthorized: Authentication is required to access financial data."
    );
  }

  const { searchParams } = new URL(req.url);
  const rawSymbol = searchParams.get("symbol") || "NIFTY 50";
  const window = searchParams.get("window") || "1D";

  // 400 Bad Request: Validate query parameters
  if (!rawSymbol || typeof rawSymbol !== "string" || rawSymbol.trim().length === 0) {
    return createErrorResponse(
      HTTP_STATUS.BAD_REQUEST,
      "Symbol parameter cannot be empty."
    );
  }

  if (rawSymbol.length > 50) {
    return createErrorResponse(
      HTTP_STATUS.BAD_REQUEST,
      "Symbol parameter exceeds maximum allowed length of 50 characters."
    );
  }

  if (!VALID_WINDOWS.has(window.toUpperCase())) {
    return createErrorResponse(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid chart window "${window}". Allowed values: ${Array.from(VALID_WINDOWS).join(", ")}`
    );
  }

  const normalizedSymbol = normalizeGoogleFinanceSymbol(rawSymbol);

  // 503 Service Unavailable: Check API key configuration via centralized env
  if (!env.SERPAPI_KEY) {
    return createErrorResponse(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "SERPAPI_KEY is not configured on the server."
    );
  }

  try {
    const serpData = await getChart<SerpApiFinanceResponse>(normalizedSymbol, window.toUpperCase());

    // 404 Not Found: Empty market result from provider
    if (!serpData || (!serpData?.summary && !serpData?.graph)) {
      return createErrorResponse(
        HTTP_STATUS.NOT_FOUND,
        `No market data returned for symbol "${rawSymbol}".`
      );
    }

    const summary = serpData?.summary;
    let price: number | null = null;
    if (summary?.extracted_price != null) {
      price = Number(summary?.extracted_price);
    } else if (summary?.price != null) {
      const parsed = parseFloat(String(summary?.price).replace(/,/g, ""));
      if (!isNaN(parsed)) price = parsed;
    }

    let changePercent: number | null = null;
    const movement: "Up" | "Down" | null = summary?.price_movement?.movement || null;
    let movementValue: number | null = null;

    if (summary?.price_movement?.percentage != null) {
      const pct = Number(summary?.price_movement?.percentage);
      changePercent = movement === "Down" ? -Math.abs(pct) : Math.abs(pct);
    }

    if (summary?.price_movement?.value != null) {
      const val = Number(summary?.price_movement?.value);
      movementValue = movement === "Down" ? -Math.abs(val) : Math.abs(val);
    }

    const chartPoints = (serpData?.graph || [])?.map?.((pt) => ({
      time: pt?.date,
      price: Number(pt?.price),
      volume: pt?.volume != null ? Number(pt.volume) : undefined,
    })) ?? [];

    let knowledgeGraph = serpData?.knowledge_graph;
    let rawNews = serpData?.news_results || [];
    let related = serpData?.discover_more?.[0]?.items || [];
    let financials = serpData?.financials || [];

    // For multi-day/historical chart windows (5D, 1M, etc.), Google Finance SerpApi omits knowledge_graph & news.
    // Seamlessly fetch or read from cached base stock details so company details and stats never disappear.
    if (!knowledgeGraph && window.toUpperCase() !== "1D") {
      try {
        const baseStockData = await getStock<SerpApiFinanceResponse>(normalizedSymbol);
        if (baseStockData?.knowledge_graph) {
          knowledgeGraph = baseStockData.knowledge_graph;
        }
        if (rawNews.length === 0 && baseStockData?.news_results) {
          rawNews = baseStockData.news_results;
        }
        if (related.length === 0 && baseStockData?.discover_more?.[0]?.items) {
          related = baseStockData.discover_more[0].items;
        }
        if (financials.length === 0 && baseStockData?.financials) {
          financials = baseStockData.financials;
        }
      } catch (fallbackErr) {
        console.warn("Base stock details fallback notice:", fallbackErr);
      }
    }

    const stats = knowledgeGraph?.key_stats?.stats || [];
    const aboutFirst = knowledgeGraph?.about?.[0];
    const aboutSnippet = aboutFirst?.description?.snippet || null;
    const aboutTitle = aboutFirst?.title || summary?.title || rawSymbol;
    const aboutLink = aboutFirst?.description?.link || null;
    const aboutLinkText = aboutFirst?.description?.link_text || null;
    const aboutInfo = aboutFirst?.info || [];
    const currency = summary?.currency || "INR";
    const newsForSummary = rawNews.slice(0, 8).map((item) => ({
      title: item?.title || item?.snippet || "Market update",
      source: item?.source || "Market Wire",
      snippet: item?.snippet && item?.snippet !== item?.title ? item.snippet : "",
    }));

    let generatedSummaries: string[] = [];
    if (newsForSummary.length > 0) {
      try {
        generatedSummaries = await batchGenerateGeminiSummaries(newsForSummary);
      } catch (sumErr) {
        console.warn("Batch summary generation in /api/finance skipped:", sumErr);
      }
    }

    const enrichedNews = rawNews.map((item, idx) => {
      const title = item?.title || item?.snippet || "Market update";
      const snippet = item?.snippet || "";
      const aiSummary = generatedSummaries[idx];
      const summary =
        aiSummary && aiSummary !== title
          ? aiSummary
          : snippet && snippet !== title
          ? snippet
          : "";

      return {
        ...item,
        title,
        snippet,
        summary,
      };
    });

    const aboutDetails = {
      title: aboutTitle,
      snippet: aboutSnippet,
      link: aboutLink,
      linkText: aboutLinkText,
      info: aboutInfo,
      stats,
      exchange: summary?.exchange || null,
      symbol: summary?.stock || rawSymbol,
    };

    return NextResponse.json({
      success: true,
      source: "serpapi_google_finance",
      symbol: rawSymbol,
      normalizedSymbol,
      window,
      price,
      currency,
      changePercent,
      movement,
      movementValue,
      date: summary?.date || null,
      title: summary?.title || rawSymbol,
      exchange: summary?.exchange || null,
      chartPoints,
      stats,
      about: aboutSnippet,
      aboutDetails,
      news: enrichedNews,
      related,
      financials,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "SerpApi request failed";
    console.error(`SerpApi error fetching ${normalizedSymbol}:`, message);

    // Map upstream errors to precise HTTP status codes
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return createErrorResponse(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        "SerpApi rate limit or monthly search quota exceeded.",
        { symbol: rawSymbol }
      );
    }

    if (message.includes("Invalid chart window")) {
      return createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        message
      );
    }

    if (message.toLowerCase().includes("not found")) {
      return createErrorResponse(
        HTTP_STATUS.NOT_FOUND,
        `Symbol "${rawSymbol}" not found by upstream provider.`
      );
    }

    if (message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("enotfound")) {
      return createErrorResponse(
        HTTP_STATUS.BAD_GATEWAY,
        "Upstream SerpApi service is unreachable."
      );
    }

    return createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      `Market request failed: ${message}`,
      { symbol: rawSymbol }
    );
  }
}
