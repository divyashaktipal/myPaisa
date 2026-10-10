import type { SerpApiNewsItem } from "./serpapi";

export interface LiveNewsFeedSectionProps {
  indexName?: string;
  about?: string | null;
  news?: SerpApiNewsItem[];
  className?: string;
  onSelectStock?: (symbol: string) => void;
}
