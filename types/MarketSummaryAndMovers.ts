import type { SerpApiNewsItem, SerpApiDiscoverItem } from "@/types";

export interface MarketSummaryDefaults {
  defaultIndexName: string;
  defaultSourceName: string;
  currencySymbol: string;
  locale: string;
}

export type MoverTab = "gainers" | "losers";
export type MoverIndex = "NIFTY 50" | "NIFTY 100" | "NIFTY 200";

export interface MarketSummaryHeaders {
  aboutPrefix: string;
  liveNewsFeedPrefix: string;
  topMoversPrefix: string;
  gainers: string;
  losers: string;
}

export interface WatchlistInteraction {
  activeStar: string;
  inactiveStar: string;
  addToWatchlistTooltip: string;
  removeFromWatchlistTooltip: string;
}

export interface MarketSummaryAndMoversProps {
  indexName?: string;
  about?: string | null;
  news?: SerpApiNewsItem[];
  related?: SerpApiDiscoverItem[];
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  onSelectStock?: (symbol: string) => void;
}
