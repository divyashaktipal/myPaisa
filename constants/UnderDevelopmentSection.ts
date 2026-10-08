import type { UnderDevelopmentSectionProps } from "@/types/UnderDevelopmentSection";

export const UNDER_DEVELOPMENT_CONFIGS: Record<string, UnderDevelopmentSectionProps> = {
  news: {
    tabName: "news",
    badgeLabel: "Under Active Development",
    title: "Financial Newsroom & Sentiment",
    description:
      "A real-time financial newsroom curated across 20+ leading market publications, featuring AI-powered ticker sentiment analysis and breaking market events.",
    features: [
      {
        icon: "⚡",
        title: "Real-Time Breaking Alerts",
        description: "Instantaneous updates on earnings, policy changes, and market-moving events as they happen.",
      },
      {
        icon: "🧠",
        title: "AI Sentiment Analysis",
        description: "Automated bullish / bearish rating synthesis for every listed Indian stock and index.",
      },
      {
        icon: "📰",
        title: "Multi-Source Aggregation",
        description: "Direct feeds from Reuters, Economic Times, Bloomberg, Mint, and Moneycontrol without noise.",
      },
      {
        icon: "🎯",
        title: "Watchlist-Filtered Feed",
        description: "Zero in on updates specifically affecting your tracked portfolio companies.",
      },
    ],
    estimatedRelease: "Beta Release Coming Soon",
  },
  screener: {
    tabName: "screener",
    badgeLabel: "Under Active Development",
    title: "Institutional Stock Screener",
    description:
      "A fast, flexible multi-factor screening engine to discover high-momentum Indian equities, fundamental value plays, and sector rotation setups.",
    features: [
      {
        icon: "📊",
        title: "Multi-Factor Filters",
        description: "Filter top 200+ Indian stocks by P/E ratio, Market Cap, ROCE, Debt-to-Equity, and Dividend Yield.",
      },
      {
        icon: "📈",
        title: "Technical Scanners",
        description: "Pre-built scans for 52-Week High breakouts, RSI oversold bounces, and 200-EMA trendlines.",
      },
      {
        icon: "🗺️",
        title: "Sector & Heatmap Matrix",
        description: "Interactive visual heatmaps breaking down banking, IT, FMCG, and energy sector weightings.",
      },
      {
        icon: "💾",
        title: "Custom Saved Presets",
        description: "Save bespoke filter criteria and export candidates straight into your personal Watchlist.",
      },
    ],
    estimatedRelease: "Beta Release Coming Soon",
  },
};
