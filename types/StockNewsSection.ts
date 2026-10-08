import type { SerpApiNewsItem, SerpApiDiscoverItem } from "./serpapi";

export type StockNewsTab = "trending" | "sector";

export interface SectorMoveItem {
  id: string;
  name: string;
  changePercent: number;
  upCount: number;
  downCount: number;
  totalCount: number;
  bestStock: string;
}

export interface StockNewsSectionProps {
  symbol: string;
  title?: string | null;
  news?: SerpApiNewsItem[];
  related?: SerpApiDiscoverItem[];
  sector?: string | null;
}
