export type SignalType = "52_WEEK_LOW" | "52_WEEK_HIGH" | "BREAKOUT_20D";

export type SignalDirection = "UP" | "DOWN";

export type SignalDirectionFilter = "ALL" | "UP" | "DOWN";

export type SignalCategoryFilter = "ALL" | "52_WEEK" | "BREAKOUT_20D";

export interface SignalStock {
  id: string;
  symbol: string;
  name: string;
  slug: string;
  price: number;
  change: number;
  changePercent: number;
  type: SignalType;
  direction: SignalDirection;
  statusText: string; // e.g. "At a 52-week low", "At a 52-week high", "20-day breakout"
  comparisonText: string; // e.g. "Low ₹36.31 vs 52-week low ₹36.31"
  sector: string;
  rank?: number;
  newsHeadline?: string;
  newsSource?: string;
  newsTime?: string;
  currentLow?: number;
  fiftyTwoWeekLow?: number;
  currentHigh?: number;
  fiftyTwoWeekHigh?: number;
}

export interface SignalsSummary {
  totalSignals: number;
  totalStocks: number;
  upCount: number;
  downCount: number;
  asOf: string;
}

export interface SignalsApiResponse {
  success: boolean;
  summary: SignalsSummary;
  signals: SignalStock[];
  highlights: SignalStock[];
}

export interface SignalsSectionProps {
  onSelectStock?: (stock: SignalStock) => void;
  className?: string;
}
