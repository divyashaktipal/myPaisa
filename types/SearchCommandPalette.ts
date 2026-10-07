import type { StockItem } from "@/types";

export interface SearchPaletteConfig {
  placeholder: string;
  escLabel: string;
  initialResultsCount: number;
  maxQueryResultsCount: number;
  noResultsMessagePrefix: string;
  footerSource: string;
  footerHint: string;
  currencySymbol: string;
  locale: string;
}

export interface SearchWatchlistIcons {
  active: string;
  inactive: string;
}

export interface SearchCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  onSelectStock?: (stock: StockItem) => void;
}
