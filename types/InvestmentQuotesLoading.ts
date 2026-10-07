export interface InvestmentQuoteItem {
  id: string;
  quote: string;
  tip: string;
  author: string;
  title: string;
  netWorth?: string;
  category: string;
}

export interface InvestmentQuotesLoadingConfig {
  intervalMs: number;
  badgeText: string;
  tipHeading: string;
  fetchingNotice: string;
  quotePrefix: string;
  quoteSuffix: string;
  prevButtonAria: string;
  nextButtonAria: string;
  pauseAria: string;
  resumeAria: string;
}

export interface InvestmentQuotesLoadingProps {
  intervalMs?: number;
  className?: string;
}
