export const CHART_WINDOWS = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"] as const;
export type ChartWindow = (typeof CHART_WINDOWS)[number];
export type SerpParams = Record<string, string | number>;

export interface SerpApiFinanceSummary {
  title?: string;
  stock?: string;
  exchange?: string;
  price?: string | number;
  extracted_price?: number;
  price_movement?: {
    percentage?: number;
    value?: number;
    movement?: "Up" | "Down";
  };
  date?: string;
  extensions?: string[];
}

export interface SerpApiGraphPoint {
  price: number;
  date: string;
}

export interface SerpApiKeyStat {
  label: string;
  value: string;
}

export interface SerpApiNewsItem {
  position?: number;
  title?: string;
  source?: string;
  date?: string;
  snippet?: string;
  link?: string;
  thumbnail?: string;
}

export interface SerpApiDiscoverItem {
  stock?: string;
  price?: string;
  extracted_price?: number;
  price_movement?: {
    percentage?: number;
    value?: number;
    movement?: "Up" | "Down";
  };
  link?: string;
}

export interface SerpApiFinanceResponse {
  search_metadata?: { status?: string };
  summary?: SerpApiFinanceSummary;
  graph?: SerpApiGraphPoint[];
  knowledge_graph?: {
    key_stats?: {
      stats?: SerpApiKeyStat[];
    };
    about?: Array<{
      title?: string;
      description?: {
        snippet?: string;
        link?: string;
        link_text?: string;
      };
    }>;
  };
  news_results?: SerpApiNewsItem[];
  discover_more?: Array<{
    items?: SerpApiDiscoverItem[];
  }>;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
