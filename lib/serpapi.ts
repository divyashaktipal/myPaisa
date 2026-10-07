import { env } from "@/config";
import {
  CHART_WINDOWS,
  type ChartWindow,
  type SerpParams,
  type SerpApiFinanceResponse,
  type CacheEntry,
} from "@/types/serpapi";

const SEARCH_URL = "https://serpapi.com/search.json";

export { CHART_WINDOWS };
export type {
  ChartWindow,
  SerpParams,
  SerpApiFinanceSummary,
  SerpApiGraphPoint,
  SerpApiKeyStat,
  SerpApiNewsItem,
  SerpApiDiscoverItem,
  SerpApiAboutInfo,
  SerpApiAbout,
  SerpApiFinanceResponse,
} from "@/types/serpapi";

/**
 * Normalizes user/internal tickers into Google Finance SerpApi syntax (TICKER:EXCHANGE).
 */
export function normalizeGoogleFinanceSymbol(raw: string): string {
  if (!raw) return "NIFTY_50:INDEXNSE";
  const clean = raw.trim().replace(/\s+/g, " ");

  if (
    /^nifty\s*50$/i.test(clean) ||
    clean === "NIFTY_50" ||
    clean === "INDEXNSE:NIFTY_50" ||
    clean === "NIFTY_50:INDEXNSE"
  ) {
    return "NIFTY_50:INDEXNSE";
  }

  if (
    /^nifty\s*100$/i.test(clean) ||
    clean === "NIFTY_100" ||
    clean === "INDEXNSE:NIFTY_100" ||
    clean === "NIFTY_100:INDEXNSE"
  ) {
    return "NIFTY_100:INDEXNSE";
  }

  if (
    /^nifty\s*200$/i.test(clean) ||
    clean === "NIFTY_200" ||
    clean === "INDEXNSE:NIFTY_200" ||
    clean === "NIFTY_200:INDEXNSE"
  ) {
    return "NIFTY_200:INDEXNSE";
  }

  if (
    /^nifty\s*500$/i.test(clean) ||
    clean === "NIFTY_500" ||
    clean === "INDEXNSE:NIFTY_500" ||
    clean === "NIFTY_500:INDEXNSE"
  ) {
    return "NIFTY_500:INDEXNSE";
  }

  if (/^sensex$/i.test(clean) || clean === "INDEXBOM:SENSEX" || clean === "SENSEX:INDEXBOM") {
    return "SENSEX:INDEXBOM";
  }

  // Handle prefix format: INDEXNSE:SYMBOL -> SYMBOL:INDEXNSE
  if (clean.startsWith("INDEXNSE:")) {
    return `${clean.replace("INDEXNSE:", "")}:INDEXNSE`;
  }
  if (clean.startsWith("NSE:")) {
    return `${clean.replace("NSE:", "")}:NSE`;
  }
  if (clean.startsWith("BSE:")) {
    return `${clean.replace("BSE:", "")}:BSE`;
  }

  // Already TICKER:EXCHANGE
  if (clean.includes(":")) {
    return clean;
  }

  // Default to NSE exchange
  return `${clean.toUpperCase()}:NSE`;
}

// In-memory cache to prevent quota exhaustion
const cache = new Map<string, CacheEntry<unknown>>();

export async function serp<T = Record<string, unknown>>(params: SerpParams, ttlSeconds = 120): Promise<T> {
  const apiKey = env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY is not configured on the server.");

  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: ttlSeconds },
  });

  if (!response?.ok) {
    throw new Error(`SerpApi request failed with status ${response?.status}.`);
  }

  const result = (await response?.json?.()) as T & {
    error?: string;
    search_metadata?: { status?: string };
  };

  if (result?.error) {
    throw new Error(result.error);
  }

  if (result?.search_metadata?.status?.toLowerCase?.() === "error") {
    throw new Error("SerpApi reported that the search failed.");
  }

  cache.set(cacheKey, {
    data: result,
    expiresAt: now + ttlSeconds * 1000,
  });

  return result;
}

export function getStock<T = SerpApiFinanceResponse>(symbol: string, ttl = 120): Promise<T> {
  const normalized = normalizeGoogleFinanceSymbol(symbol);
  return serp<T>({ engine: "google_finance", q: normalized }, ttl);
}

export function getChart<T = SerpApiFinanceResponse>(symbol: string, window: string): Promise<T> {
  if (!CHART_WINDOWS.includes(window as ChartWindow)) {
    throw new Error(`Invalid chart window: ${window}.`);
  }
  const normalized = normalizeGoogleFinanceSymbol(symbol);
  const ttl = window === "1D" ? 120 : 1800; // 2 min for 1D, 30 min for multi-day
  const params: SerpParams = { engine: "google_finance", q: normalized };
  if (window !== "1D") {
    params.window = window;
  }
  return serp<T>(params, ttl);
}
