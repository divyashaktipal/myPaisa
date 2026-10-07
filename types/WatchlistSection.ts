export interface FallbackStockValues {
  price: number;
  change: number;
  changePercent: number;
}

export interface WatchlistSectionConfig {
  title: string;
  subtitle: string;
  addStockButtonText: string;
  emptyTitle: string;
  emptyButtonText: string;
  removeTooltip: string;
  starIcon: string;
  currencySymbol: string;
  locale: string;
  fallbackStockValues: FallbackStockValues;
}

export interface WatchlistSectionProps {
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onOpenSearch: () => void;
}
