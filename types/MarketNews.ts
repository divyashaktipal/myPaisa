export interface NewsStoryItem {
  id: string;
  title: string;
  source: string;
  date: string;
  link: string;
  thumbnail?: string;
  tickers: string[];
  summary: string;
  category?: string;
  tag?: string;
  isLead?: boolean;
}

export interface NewsShortItem {
  id: string;
  title: string;
  source: string;
  date: string;
  link?: string;
  thumbnail?: string;
  tickers: string[];
  duration?: string;
}

export interface MarketNewsResponse {
  success: boolean;
  leadStory: NewsStoryItem | null;
  shorts: NewsShortItem[];
  stories: NewsStoryItem[];
  activeFilter?: string;
  asOf: string;
  query?: string;
}

export type NewsFilterTab =
  | "top_stories"
  | "movers"
  | "signals"
  | "nifty50"
  | "nifty100"
  | "nifty200";
