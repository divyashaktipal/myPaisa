import type { MarketHeatmapResponse } from "@/types/MarketHeatmap";

/**
 * Generates the query key for market heatmap data.
 */
export function getHeatmapQueryKey() {
  return ["market-heatmap"] as const;
}

/**
 * Fetches real-time market heatmap data across NSE sectors.
 */
export async function fetchMarketHeatmap(): Promise<MarketHeatmapResponse> {
  const res = await fetch("/api/market/heatmap");
  if (!res.ok) {
    throw new Error("Failed to load real market heatmap data.");
  }
  return res.json();
}

/**
 * Standard TanStack Query options for the heatmap query.
 */
export function heatmapQueryOptions() {
  return {
    queryKey: getHeatmapQueryKey(),
    queryFn: fetchMarketHeatmap,
    staleTime: 60000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  };
}
