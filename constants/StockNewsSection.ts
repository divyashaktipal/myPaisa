export const STOCK_NEWS_TABS = [
  { id: "trending", label: "Trending" },
  { id: "sector", label: "Sector moves" },
] as const;

export const STOCK_NEWS_LABELS = {
  subtitleTemplate: (symbol: string) =>
    `Latest news about ${symbol}, newest first. Headlines as published by each source.`,
  emptyState: "No recent news found for this ticker. Checking market wire...",
  summaryPrefix: "Summary",
  sectorSubtitle: "Sector-wide performance across Indian equities. Advances, declines, and top relative strength candidates.",
};
