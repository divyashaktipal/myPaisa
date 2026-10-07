import type {
  MarketSummaryDefaults,
  MarketSummaryHeaders,
  WatchlistInteraction,
} from "@/types/MarketSummaryAndMovers";

export const MARKET_SUMMARY_DEFAULTS: MarketSummaryDefaults = {
  defaultIndexName: "NIFTY 50",
  defaultSourceName: "Google Finance",
  currencySymbol: "₹",
  locale: "en-IN",
};

export const MOVER_INDICES = ["NIFTY 50", "NIFTY 100", "NIFTY 200"] as const;

export const MARKET_SUMMARY_HEADERS: MarketSummaryHeaders = {
  aboutPrefix: "About ",
  liveNewsFeedPrefix: "Live News Feed · ",
  topMoversPrefix: "TOP MOVERS · ",
  gainers: "Gainers",
  losers: "Losers",
};

export const WATCHLIST_INTERACTION: WatchlistInteraction = {
  activeStar: "★",
  inactiveStar: "☆",
  addToWatchlistTooltip: "Add to Watchlist",
  removeFromWatchlistTooltip: "Remove from Watchlist",
};
