export type FeatureTimeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

export interface LiveIndexData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface FeatureNewsItem {
  id: string;
  source: string;
  headline: string;
  minutesAgo: number;
  tickers: string[];
}

export interface FeaturesSectionHeader {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  ctaArrow: string;
}

export interface FeatureCardDetail {
  emoji: string;
  tag: string;
  title: string;
  description: string;
  connectingText?: string;
  quote?: string;
  badge?: string;
  instantFiltersLabel?: string;
  adjustedLabel?: string;
  rsiLabel?: string;
  tapHint?: string;
}

export interface FeatureCardsContent {
  liveCard: FeatureCardDetail;
  signalsCard: FeatureCardDetail;
  screenerCard: FeatureCardDetail;
  chartsCard: FeatureCardDetail;
  watchlistCard: FeatureCardDetail;
  newsCard: FeatureCardDetail;
}

export interface FeaturesSectionProps {}
