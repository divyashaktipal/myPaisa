import type { QueryClientConfigTokens } from "@/types/QueryProvider";

export const QUERY_CLIENT_CONFIG: QueryClientConfigTokens = {
  // 5 minutes default freshness: cached data is fresh for 5 mins before asking server
  defaultStaleTime: 5 * 60 * 1000,
  // 1 hour garbage collection: keep data in memory across tab navigation
  defaultGcTime: 60 * 60 * 1000,
  // 3 minutes for intraday live 1D data
  liveWindowStaleTime: 3 * 60 * 1000,
  // 15 minutes for multi-day historical windows (5D, 1M, 6M, YTD, 1Y, 5Y, MAX)
  historicalWindowStaleTime: 15 * 60 * 1000,
  // 5 minutes for user watchlist
  watchlistStaleTime: 5 * 60 * 1000,
  // Disable aggressive refetching on window focus/tab change to save SerpApi quota
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  // Retry at most once on transient network errors
  retryCount: 1,
};
