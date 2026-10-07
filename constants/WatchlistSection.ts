import type { WatchlistSectionConfig } from "@/types/WatchlistSection";

export const WATCHLIST_SECTION_CONFIG: WatchlistSectionConfig = {
  title: "My Watchlist",
  subtitle: "Real-time tracked equities in your watchlist",
  addStockButtonText: "+ Add Stock",
  emptyTitle: "Your watchlist is currently empty.",
  emptyButtonText: "Search and add stocks to your watchlist",
  removeTooltip: "Remove from Watchlist",
  starIcon: "★",
  currencySymbol: "₹",
  locale: "en-IN",
  fallbackStockValues: {
    price: 1000.0,
    change: 15.0,
    changePercent: 1.5,
  },
};
