import type {
  FeatureNewsItem,
  FeatureTimeframe,
  FeaturesSectionHeader,
  FeatureCardsContent,
} from "@/types/FeaturesSection";

export const FEATURES_SECTION_HEADER: FeaturesSectionHeader = {
  badge: "What's inside",
  titleLine1: "Everything a curious investor checks.",
  titleLine2: "Nothing they don't need.",
  description:
    "Live feeds, facts-first signals, split-adjusted charts, and clean newsrooms. Built for clarity, speed, and focus.",
  ctaText: "Start exploring on myPaisa",
  ctaHref: "/login",
  ctaArrow: "→",
};

export const FEATURE_TIMEFRAMES: FeatureTimeframe[] = ["1D", "1W", "1M", "1Y", "5Y"];

export const SCREENER_FILTER_OPTIONS: string[] = [
  "> 200 DMA",
  "Near 52W High",
  "RSI < 40",
  "Volume Spike",
];

export const NEWS_MEDIA_SOURCES: string[] = [
  "ET",
  "Mint",
  "Moneycontrol",
  "CNBC-TV18",
  "The Hindu",
];

export const DEFAULT_FEATURE_WATCHLIST: string[] = ["TRENT", "RELIANCE", "HDFCBANK"];

export const STATIC_FEATURE_NEWS: FeatureNewsItem[] = [
  {
    id: "n1",
    source: "Mint",
    headline:
      "Sensex & Nifty touch session highs as IT and auto majors lead institutional accumulation.",
    minutesAgo: 4,
    tickers: ["TCS", "INFY", "MARUTI"],
  },
  {
    id: "n2",
    source: "Moneycontrol",
    headline:
      "FII flows turn positive for second straight session with heavy block trades in largecaps.",
    minutesAgo: 14,
    tickers: ["RELIANCE", "HDFCBANK"],
  },
  {
    id: "n3",
    source: "Economic Times",
    headline:
      "Retail participation in midcap ETFs surges 35% in Q3 amidst corporate earnings resilience.",
    minutesAgo: 32,
    tickers: ["TRENT", "BSE"],
  },
];

export const FEATURE_CARDS_CONTENT: FeatureCardsContent = {
  liveCard: {
    emoji: "⚡",
    tag: "Live",
    title: "The whole market, one glance",
    description:
      "Nifty 50, 100 and 200 moving live, where the money is trading, and which sectors lead. Refreshed every minute.",
    connectingText: "Connecting to Google Finance feed...",
  },
  signalsCard: {
    emoji: "📡",
    tag: "Signals",
    title: "What happened, in plain words",
    description:
      "52-week highs, breakouts, unusual volume, big gaps. Facts, never calls.",
    quote: "“Facts, never calls.”",
    badge: "✓ 100% verified data",
  },
  screenerCard: {
    emoji: "🧭",
    tag: "Screener",
    title: "40+ filters. Zero spreadsheets.",
    description:
      "Ask “above the 200-day and near a 52-week high” and get answers in a blink.",
    instantFiltersLabel: "40+ instant filters",
  },
  chartsCard: {
    emoji: "📈",
    tag: "Charts",
    title: "Five years, split-adjusted",
    description:
      "Candles, averages, RSI and comparisons, with every split and bonus handled.",
    adjustedLabel: "Split & Bonus Adjusted",
    rsiLabel: "RSI (14): 58.2 · EMA 20/50/200 Active",
  },
  watchlistCard: {
    emoji: "⭐",
    tag: "Watchlists",
    title: "Your stocks, live",
    description: "Build lists in a tap, or start from a ready-made screen.",
    tapHint: "Tap star to toggle",
  },
  newsCard: {
    emoji: "📰",
    tag: "News",
    title: "20+ newsrooms, one feed",
    description:
      "ET, Mint, Moneycontrol, The Hindu, CNBC-TV18 and more, filtered to your stocks.",
  },
};
