import type {
  SearchPaletteConfig,
  SearchWatchlistIcons,
} from "@/types/SearchCommandPalette";

export const SEARCH_PALETTE_CONFIG: SearchPaletteConfig = {
  placeholder: "Search any stock symbol or name (e.g. Tata, Reliance, Infosys)...",
  escLabel: "ESC",
  initialResultsCount: 15,
  maxQueryResultsCount: 25,
  noResultsMessagePrefix: "No matching stocks found for ",
  footerSource: "Real-time NSE/BSE & Global Markets",
  footerHint: "Click bookmark to save to Watchlist",
  currencySymbol: "₹",
  locale: "en-IN",
};

export const SEARCH_WATCHLIST_ICONS: SearchWatchlistIcons = {
  active: "★",
  inactive: "☆",
};
