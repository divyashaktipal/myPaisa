export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isBullish: boolean;
  changePercent: number;
  index: number;
}

export interface HoveredCandle {
  candle: CandleData;
  x: number;
  y: number;
}

export interface CandlestickDimensions {
  width: number;
  height: number;
  paddingRight: number;
  paddingBottom: number;
  paddingTop: number;
}

export interface CandlestickColors {
  bullish: string;
  bearish: string;
  bullishGlow: string;
  bearishGlow: string;
  gridLine: string;
  crosshair: string;
  axisText: string;
}

export interface CandlestickMessages {
  noData: string;
  liveBadge: string;
  currencySymbol: string;
  locale: string;
  backToIndices: string;
  candlestickMode: string;
  lineMode: string;
}

export interface CandlestickChartProps {
  symbol: string;
  title?: string | null;
  exchange?: string | null;
  price: number | null;
  changePercent: number | null;
  movement?: "Up" | "Down" | null;
  movementValue?: number | null;
  date?: string | null;
  chartPoints?: Array<{ time: string; price: number }>;
  selectedWindow: string;
  setSelectedWindow: (window: string) => void;
  loading?: boolean;
  onBackToIndices?: () => void;
}
