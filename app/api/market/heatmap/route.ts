import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { HEATMAP_SECTORS_CONFIG } from "@/constants/MarketHeatmap";
import type {
  HeatmapStock,
  HeatmapSector,
  MarketHeatmapResponse,
} from "@/types/MarketHeatmap";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";

export const dynamic = "force-dynamic";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Server-side in-memory cache
interface HeatmapCache {
  data: MarketHeatmapResponse | null;
  timestamp: number;
}

let serverCache: HeatmapCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let isFetchingBackground = false;

// Fallback lookup from known top 200 Indian stocks
const fallbackStockMap = new Map(
  TOP_200_INDIAN_STOCKS.map((stock) => [stock.symbol.toUpperCase(), stock])
);

async function fetchRealMarketHeatmap(): Promise<MarketHeatmapResponse> {
  // Collect all unique symbols to fetch
  const allSymbolsSet = new Set<string>();
  for (const sector of HEATMAP_SECTORS_CONFIG) {
    for (const sym of sector.symbols) {
      allSymbolsSet.add(sym.toUpperCase());
    }
  }

  const allSymbols = Array.from(allSymbolsSet);

  // Fetch quotes concurrently in batches of 15 to avoid network saturation
  const batchSize = 15;
  const quoteMap = new Map<string, any>();

  for (let i = 0; i < allSymbols.length; i += batchSize) {
    const chunk = allSymbols.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      chunk.map((symbol) => {
        const querySymbol = `${symbol}.NS`;
        return yahooFinance.quote(querySymbol);
      })
    );

    results.forEach((res, index) => {
      const sym = chunk[index];
      if (res.status === "fulfilled" && res.value) {
        quoteMap.set(sym, res.value);
      }
    });
  }

  // Construct sector data
  let grandTotalTurnoverCr = 0;
  const sectors: HeatmapSector[] = [];
  const topSectorLeaders: HeatmapStock[] = [];

  for (const sectorConfig of HEATMAP_SECTORS_CONFIG) {
    const sectorStocks: HeatmapStock[] = [];

    for (const rawSym of sectorConfig.symbols) {
      const sym = rawSym.toUpperCase();
      const quote = quoteMap.get(sym);
      const fallback = fallbackStockMap.get(sym);

      let price = 0;
      let change = 0;
      let changePercent = 0;
      let volume = 0;
      let name = fallback?.name || rawSym;
      let dayHigh: number | undefined;
      let dayLow: number | undefined;

      if (quote) {
        price = typeof quote.regularMarketPrice === "number" ? quote.regularMarketPrice : (fallback?.price ?? 0);
        change = typeof quote.regularMarketChange === "number" ? quote.regularMarketChange : (fallback?.change ?? 0);
        changePercent = typeof quote.regularMarketChangePercent === "number" ? quote.regularMarketChangePercent : (fallback?.changePercent ?? 0);
        volume = typeof quote.regularMarketVolume === "number" ? quote.regularMarketVolume : (quote.averageDailyVolume10Day ?? 2500000);
        name = quote.shortName || quote.longName || fallback?.name || rawSym;
        dayHigh = quote.regularMarketDayHigh ?? undefined;
        dayLow = quote.regularMarketDayLow ?? undefined;
      } else if (fallback) {
        price = fallback.price;
        change = fallback.change;
        changePercent = fallback.changePercent;
        volume = 2000000;
      }

      // Traded value today (Turnover in ₹ Crores) = (Price * Volume) / 10,000,000
      let turnoverCr = Math.round((price * volume) / 10000000);
      if (turnoverCr <= 0) turnoverCr = Math.round(price * 15);

      sectorStocks.push({
        symbol: rawSym,
        name,
        slug: rawSym.toLowerCase(),
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume,
        turnoverCr,
        dayHigh: dayHigh ? Number(dayHigh.toFixed(2)) : undefined,
        dayLow: dayLow ? Number(dayLow.toFixed(2)) : undefined,
        sector: sectorConfig.name,
      });
    }

    // Sort sector stocks descending by traded value (turnoverCr)
    sectorStocks.sort((a, b) => b.turnoverCr - a.turnoverCr);

    const sectorTotalTurnoverCr = sectorStocks.reduce((sum, s) => sum + s.turnoverCr, 0);
    grandTotalTurnoverCr += sectorTotalTurnoverCr;

    const topStock = sectorStocks[0] || {
      symbol: sectorConfig.symbols[0],
      name: sectorConfig.symbols[0],
      slug: sectorConfig.symbols[0].toLowerCase(),
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      turnoverCr: 0,
      sector: sectorConfig.name,
    };

    topSectorLeaders.push(topStock);

    sectors.push({
      id: sectorConfig.id,
      name: sectorConfig.name,
      stocks: sectorStocks,
      totalTurnoverCr: sectorTotalTurnoverCr,
      topStock,
    });
  }

  // Sort top sector leaders by turnoverCr descending
  topSectorLeaders.sort((a, b) => b.turnoverCr - a.turnoverCr);

  return {
    success: true,
    asOf: new Date().toISOString(),
    sectors,
    topSectorLeaders,
    totalTurnoverCr: grandTotalTurnoverCr,
  };
}

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (serverCache.data && now - serverCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...serverCache.data,
      cached: true,
    });
  }

  // Stale-while-revalidate: if cache exists but is older, serve stale and update in background
  if (serverCache.data && !isFetchingBackground) {
    isFetchingBackground = true;
    fetchRealMarketHeatmap()
      .then((fresh) => {
        serverCache = {
          data: fresh,
          timestamp: Date.now(),
        };
      })
      .catch((err) => {
        console.error("Heatmap background refresh error:", err);
      })
      .finally(() => {
        isFetchingBackground = false;
      });

    return NextResponse.json({
      ...serverCache.data,
      cached: true,
      stale: true,
    });
  }

  // Cold cache: fetch directly
  try {
    const data = await fetchRealMarketHeatmap();
    serverCache = {
      data,
      timestamp: Date.now(),
    };
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Error fetching live heatmap:", err);
    if (serverCache.data) {
      return NextResponse.json({
        ...serverCache.data,
        cached: true,
        fallbackError: true,
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve real-time market heatmap data.",
      },
      { status: 500 }
    );
  }
}
