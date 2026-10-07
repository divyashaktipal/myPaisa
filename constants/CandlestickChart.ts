import type {
  CandlestickDimensions,
  CandlestickColors,
  CandlestickMessages,
} from "@/types/CandlestickChart";

export const MINIMAL_TIMEFRAMES: string[] = ["1D", "5D", "1M", "6M", "1Y", "MAX"];

export const CANDLESTICK_DIMENSIONS: CandlestickDimensions = {
  width: 780,
  height: 340,
  paddingRight: 85,
  paddingBottom: 35,
  paddingTop: 20,
};

export const CANDLESTICK_COLORS: CandlestickColors = {
  bullish: "#10b981",
  bearish: "#f43f5e",
  bullishGlow: "rgba(16, 185, 129, 0.15)",
  bearishGlow: "rgba(244, 63, 94, 0.15)",
  gridLine: "#172436",
  crosshair: "#475569",
  axisText: "#64748b",
};

export const CANDLESTICK_MESSAGES: CandlestickMessages = {
  noData: "No price history available for this asset.",
  liveBadge: "SerpApi · Google Finance",
  currencySymbol: "₹",
  locale: "en-IN",
  backToIndices: "Live Indices",
  candlestickMode: "Candles",
  lineMode: "Line",
};
