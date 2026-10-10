import type { MoverTab, MoverIndex } from "./MarketSummaryAndMovers";

export interface TopMoversProps {
  indexName?: string;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  onSelectStock?: (symbol: string) => void;
  className?: string;
}
