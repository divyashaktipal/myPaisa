import { NextResponse } from "next/server";
import { auth } from "@/auth";
import YahooFinance from "yahoo-finance2";
import type { StockItem } from "@/types/top200Stocks";

export const dynamic = "force-dynamic";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Server-side in-memory cache to ensure low latency and prevent upstream rate limits
interface CacheEntry {
  data: StockItem[];
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

// Benchmark symbols for initial display when search query is empty
const BENCHMARK_SYMBOLS = [
  "RELIANCE.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "BHARTIARTL.NS",
  "ICICIBANK.NS",
  "INFY.NS",
  "SBIN.NS",
  "ITC.NS",
  "LT.NS",
  "HINDUNILVR.NS",
  "TATAMOTORS.NS",
  "BAJFINANCE.NS",
  "MARUTI.NS",
  "SUNPHARMA.NS",
  "TITAN.NS",
];

function prioritizeSymbols(symbols: string[]): string[] {
  return [...symbols].sort((a, b) => {
    const aIsNSE = a.endsWith(".NS") || a.endsWith(".BO");
    const bIsNSE = b.endsWith(".NS") || b.endsWith(".BO");
    if (aIsNSE && !bIsNSE) return -1;
    if (!aIsNSE && bIsNSE) return 1;
    return 0;
  });
}

async function fetchQuotesForSymbols(symbols: string[]): Promise<StockItem[]> {
  const settled = await Promise.allSettled(
    symbols.map((sym) => yahooFinance.quote(sym))
  );

  const items: StockItem[] = [];
  const seenSymbols = new Set<string>();

  for (const res of settled) {
    if (res.status === "fulfilled" && res.value && typeof res.value.regularMarketPrice === "number") {
      const q = res.value;
      const cleanSym = q.symbol.replace(/\.(NS|BO)$/i, "");
      if (seenSymbols.has(cleanSym)) continue;
      seenSymbols.add(cleanSym);

      items.push({
        symbol: cleanSym,
        name: q.shortName || q.longName || cleanSym,
        price: Number(q.regularMarketPrice.toFixed(2)),
        change: Number((q.regularMarketChange ?? 0).toFixed(2)),
        changePercent: Number((q.regularMarketChangePercent ?? 0).toFixed(2)),
        sector: q.sector || q.industry || undefined,
      });
    }
  }

  return items;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Sign in required to search stocks." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q")?.trim() || "";
  const rawSymbolsParam = searchParams.get("symbols")?.trim() || "";

  // 1. If explicit symbols list requested (e.g. for watchlist live quote resolution)
  if (rawSymbolsParam) {
    const symbols = rawSymbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .map((s) => (s.includes(".") || s.includes(":") ? s : `${s}.NS`));

    try {
      const stocks = await fetchQuotesForSymbols(symbols);
      return NextResponse.json({ success: true, stocks });
    } catch (err) {
      console.error("Error fetching quotes for symbols:", err);
      return NextResponse.json(
        { success: false, error: "Failed to fetch quotes for symbols.", stocks: [] },
        { status: 500 }
      );
    }
  }

  const cacheKey = rawQuery.toLowerCase();
  const now = Date.now();
  const cached = queryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, stocks: cached.data, cached: true });
  }

  // 2. Default state: no search query -> serve active benchmark leaders with live quotes
  if (!rawQuery) {
    try {
      const stocks = await fetchQuotesForSymbols(BENCHMARK_SYMBOLS);
      queryCache.set("", { data: stocks, timestamp: now });
      return NextResponse.json({ success: true, stocks });
    } catch (err) {
      console.error("Error loading benchmark stock listing:", err);
      return NextResponse.json(
        { success: false, error: "Failed to load default stock listings.", stocks: [] },
        { status: 500 }
      );
    }
  }

  // 3. Dynamic search: query Yahoo Finance dynamically
  try {
    const searchRes = await yahooFinance.search(rawQuery, { newsCount: 0 });
    const rawQuotes = searchRes?.quotes || [];

    // Extract valid equity symbols
    const equityQuotes = rawQuotes.filter(
      (item) => item?.symbol && (item?.quoteType === "EQUITY" || item?.typeDisp === "Equity")
    );

    let symbolCandidates: string[] = equityQuotes.map((item) => item.symbol as string);

    // If user typed a direct ticker (e.g. "TCS" or "TATAPOWER"), also try direct .NS / .BO candidates
    const upperQuery = rawQuery.toUpperCase().replace(/\s+/g, "");
    if (/^[A-Z0-9_-]{1,12}$/.test(upperQuery)) {
      symbolCandidates.unshift(`${upperQuery}.NS`, `${upperQuery}.BO`, upperQuery);
    }

    // Deduplicate and prioritize Indian exchanges
    const uniqueCandidates = prioritizeSymbols(Array.from(new Set(symbolCandidates))).slice(0, 10);

    const stocks = await fetchQuotesForSymbols(uniqueCandidates);

    queryCache.set(cacheKey, { data: stocks, timestamp: now });
    return NextResponse.json({ success: true, stocks });
  } catch (err) {
    console.error(`Dynamic search error for query "${rawQuery}":`, err);
    return NextResponse.json(
      { success: false, error: "Stock search failed.", stocks: [] },
      { status: 500 }
    );
  }
}
