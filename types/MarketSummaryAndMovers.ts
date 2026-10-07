import type { SerpApiNewsItem, SerpApiDiscoverItem } from "@/types";

export interface MarketSummaryDefaults {
  defaultIndexName: string;
  defaultSourceName: string;
  currencySymbol: string;
  locale: string;
}

export interface MarketSummaryHeaders {
  aboutPrefix: string;
  liveNewsFeedPrefix: string;
  relatedMarketsTitle: string;
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
}
