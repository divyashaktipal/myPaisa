import type { IndexTabItem, ChartDimensions, ChartColors, ChartMessages } from "@/types/IndexChartCard";

export const INDEX_CHART_TABS: IndexTabItem[] = [
  { id: "NIFTY 50", label: "Nifty 50" },
  { id: "NIFTY 100", label: "Nifty 100" },
  { id: "NIFTY 200", label: "Nifty 200" },
];

export const TIMEFRAME_OPTIONS: string[] = ["1D", "1M", "1Y", "5Y"];

export const CHART_DIMENSIONS: ChartDimensions = {
  width: 860,
  height: 300,
  paddingRight: 95,
  paddingBottom: 35,
};

export const CHART_COLORS: ChartColors = {
  positive: "#10b981",
  negative: "#f43f5e",
  gridLine: "#172233",
  crosshairDash: "3 3",
  gridDash: "4 4",
};

export const CHART_MESSAGES: ChartMessages = {
  loading: "Fetching latest data from SerpApi Google Finance...",
  noDataPrefix: "No market data available for ",
  sourceBadge: "SerpApi · Google Finance",
  currencySymbol: "₹",
  locale: "en-IN",
};
