import type { StockItem } from "@/types/top200Stocks";

export interface StocksSearchApiResponse {
  success: boolean;
  stocks: StockItem[];
}

/**
 * Generates the query key for watchlist live quote data.
 */
export function getWatchlistLiveStocksQueryKey(symbolsParam: string) {
  return ["watchlist-live-stocks", symbolsParam] as const;
}

/**
 * Fetches real-time market quotes for a comma-separated list of stock symbols.
 */
export async function fetchWatchlistLiveStocks(
  symbolsParam: string
): Promise<StocksSearchApiResponse> {
  if (!symbolsParam || !symbolsParam.trim()) {
    return { success: true, stocks: [] };
  }

  const res = await fetch(
    `/api/market/search?symbols=${encodeURIComponent(symbolsParam.trim())}`
  );
  if (!res.ok) {
    throw new Error("Failed to load watchlist quotes.");
  }
  return res.json();
}

/**
 * Standard TanStack Query options for watchlist live stock quotes.
 */
export function watchlistLiveStocksQueryOptions(symbolsParam: string) {
  return {
    queryKey: getWatchlistLiveStocksQueryKey(symbolsParam),
    queryFn: () => fetchWatchlistLiveStocks(symbolsParam),
    enabled: Boolean(symbolsParam && symbolsParam.trim().length > 0),
    staleTime: 30000,
    refetchInterval: 60000,
  };
}

/**
 * Searches stocks dynamically via the market search API route.
 */
export async function searchMarketStocks(
  query: string
): Promise<StocksSearchApiResponse> {
  const url = new URL(
    "/api/market/search",
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    return { success: false, stocks: [] };
  }
  return res.json();
}
