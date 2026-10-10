import type { ChartPoint, ChartStat } from "./IndexChartCard";

export interface LiveFeedCardProps {
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
  selectedWindow?: string;
  setSelectedWindow?: (window: string) => void;
  price: number | null;
  changePercent: number | null;
  movement?: "Up" | "Down" | null;
  movementValue?: number | null;
  date?: string | null;
  chartPoints?: ChartPoint[];
  stats?: ChartStat[];
  loading?: boolean;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  onSelectStock?: (symbol: string) => void;
  className?: string;
}
