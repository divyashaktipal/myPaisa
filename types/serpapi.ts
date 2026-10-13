export const CHART_WINDOWS = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"] as const;
export type ChartWindow = (typeof CHART_WINDOWS)[number];
export type SerpParams = Record<string, string | number>;

export interface SerpApiFinanceSummary {
  title?: string;
  stock?: string;
  exchange?: string;
  price?: string | number;
  extracted_price?: number;
  currency?: string;
  price_movement?: {
    percentage?: number;
    value?: number;
    movement?: "Up" | "Down";
  };
  date?: string;
  market?: {
    price?: string | number;
    extracted_price?: number;
    currency?: string;
    price_movement?: {
      percentage?: number;
      value?: number;
      movement?: "Up" | "Down";
    };
  };
  extensions?: string[];
}

export interface SerpApiGraphPoint {
  price: number;
  date: string;
  volume?: number;
  currency?: string;
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
  summary?: string;
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

export interface SerpApiAboutInfo {
  label?: string;
  value?: string;
  link?: string;
}

export interface SerpApiAbout {
  title?: string;
  description?: {
    snippet?: string;
    link?: string;
    link_text?: string;
  };
  info?: SerpApiAboutInfo[];
}

export interface SerpApiFinancialTableItem {
  title: string;
  value: string;
  change?: string;
}

export interface SerpApiFinancialPeriod {
  date: string;
  period_type: "Quarterly" | "Annual" | string;
  table: SerpApiFinancialTableItem[];
}

export interface SerpApiFinancialCategory {
  title: string;
  results: SerpApiFinancialPeriod[];
}

export interface SerpApiFinanceResponse {
  search_metadata?: {
    id?: string;
    status?: string;
    json_endpoint?: string;
    markdown_endpoint?: string;
    created_at?: string;
    processed_at?: string;
    google_finance_url?: string;
    raw_html_file?: string;
    total_time_taken?: number;
  };
  search_parameters?: {
    engine?: string;
    q?: string;
    hl?: string;
  };
  summary?: SerpApiFinanceSummary;
  graph?: SerpApiGraphPoint[];
  knowledge_graph?: {
    key_stats?: {
      stats?: SerpApiKeyStat[];
    };
    about?: SerpApiAbout[];
  };
  news_results?: SerpApiNewsItem[];
  financials?: SerpApiFinancialCategory[];
  discover_more?: Array<{
    items?: SerpApiDiscoverItem[];
  }>;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
