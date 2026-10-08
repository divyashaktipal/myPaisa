import type { ChartStat } from "./IndexChartCard";

export interface CompanyInfoField {
  label?: string;
  value?: string;
  link?: string;
}

export interface CompanyDetailsLabels {
  title: string;
  aboutSection: string;
  profileSection: string;
  statsSection: string;
  noDetails: string;
  readMore: string;
  viewMore?: string;
  viewLess?: string;
  addToWatchlist: string;
  inWatchlist: string;
  website: string;
  exchange: string;
}

export interface CompanyDetailsCardProps {
  symbol: string;
  title?: string | null;
  exchange?: string | null;
  price?: number | null;
  changePercent?: number | null;
  aboutSnippet?: string | null;
  aboutLink?: string | null;
  aboutInfo?: CompanyInfoField[];
  stats?: ChartStat[];
  isInWatchlist?: boolean;
  onToggleWatchlist?: (symbol: string) => void;
  loading?: boolean;
}
