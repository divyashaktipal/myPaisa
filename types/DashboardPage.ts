import type { DashboardUser } from "./DashboardNavbar";
import type { SerpApiNewsItem, SerpApiDiscoverItem } from "./serpapi";
import type { ChartPoint, ChartStat } from "./IndexChartCard";

export interface DashboardPageProps {
  user?: DashboardUser | null;
}

export interface CompanyBasicDetails {
  title?: string | null;
  snippet?: string | null;
  link?: string | null;
  linkText?: string | null;
  info?: Array<{ label?: string; value?: string; link?: string }>;
  stats?: Array<{ label: string; value: string }>;
  exchange?: string | null;
  symbol?: string | null;
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
  aboutDetails?: CompanyBasicDetails | null;
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
