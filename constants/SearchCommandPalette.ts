import type {
  SearchPaletteConfig,
  SearchWatchlistIcons,
} from "@/types/SearchCommandPalette";

export const SEARCH_PALETTE_CONFIG: SearchPaletteConfig = {
  placeholder: "Search e.g. TRENT, COALINDIA, RELIANCE...",
  escLabel: "ESC",
  initialResultsCount: 15,
  maxQueryResultsCount: 25,
  noResultsMessagePrefix: "No matching stocks found for ",
  footerSource: "Google Finance & NSE Top 200 Equities",
  footerHint: "Click star to save to Watchlist",
  currencySymbol: "₹",
  locale: "en-IN",
};

export const SEARCH_WATCHLIST_ICONS: SearchWatchlistIcons = {
  active: "★",
  inactive: "☆",
};
