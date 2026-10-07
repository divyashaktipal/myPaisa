export interface IndexTabItem {
  id: string;
  label: string;
}

export interface ChartPoint {
  time: string;
  price: number;
}

export interface ChartStat {
  label: string;
  value: string;
}

export interface HoveredChartPoint {
  time: string;
  price: number;
  x: number;
  y: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  paddingRight: number;
  paddingBottom: number;
}

export interface ChartColors {
  positive: string;
  negative: string;
  gridLine: string;
  crosshairDash: string;
  gridDash: string;
}

export interface ChartMessages {
  loading: string;
  noDataPrefix: string;
  sourceBadge: string;
  currencySymbol: string;
  locale: string;
}

export interface IndexChartCardProps {
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
  selectedWindow: string;
  setSelectedWindow: (window: string) => void;
  price: number | null;
  changePercent: number | null;
  movement?: "Up" | "Down" | null;
  movementValue?: number | null;
  date?: string | null;
  chartPoints?: ChartPoint[];
  stats?: ChartStat[];
  loading?: boolean;
}
