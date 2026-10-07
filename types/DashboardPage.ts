import type { DashboardUser } from "./DashboardNavbar";
import type { SerpApiNewsItem, SerpApiDiscoverItem } from "./serpapi";
import type { ChartPoint, ChartStat } from "./IndexChartCard";

export interface DashboardPageProps {
  user?: DashboardUser | null;
}

export interface FinanceApiResponse {
  success?: boolean;
  source: string;
  symbol: string;
  normalizedSymbol: string;
  window: string;
  price: number | null;
  changePercent: number | null;
  movement?: "Up" | "Down" | null;
  movementValue?: number | null;
  date: string | null;
  title?: string | null;
  exchange?: string | null;
  chartPoints: ChartPoint[];
  stats?: ChartStat[];
  about?: string | null;
  news?: SerpApiNewsItem[];
  related?: SerpApiDiscoverItem[];
  error?: string;
  statusCode?: number;
}

export interface DashboardErrorState {
  statusCode: number;
  message: string;
}

export interface DefaultDashboardState {
  activeTab: string;
  selectedIndex: string;
  selectedWindow: string;
  initialWatchlist: string[];
}

export interface DashboardApiRoutes {
  finance: string;
  watchlist: string;
}

export interface StatusBannerLabels {
  liveFeedPrefix: string;
  dataAsOfPrefix: string;
}
