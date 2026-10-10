import type { NewsStoryItem, NewsShortItem } from "@/types/MarketNews";

export const NEWS_FILTER_TABS = [
  { id: "top_stories", label: "Top stories" },
  { id: "movers", label: "Today's movers" },
  { id: "signals", label: "Signals" },
  { id: "nifty50", label: "Nifty 50" },
  { id: "nifty100", label: "Nifty 100" },
  { id: "nifty200", label: "Nifty 200" },
] as const;

export const MARKET_NEWS_HEADER = {
  titlePrefix: "today, in ",
  titleHighlight: "markets.",
  subtitle: "Stories, Shorts and videos from India's business newsrooms, about the Nifty 200. Showing: ",
  searchPlaceholder: "Type a stock name or symbol",
  stockFilterButton: "A stock",
  leadStoryTag: "LEAD STORY",
  shortsTag: "SHORTS",
  shortsTitle: "Quick takes, under a minute",
  storiesTag: "READ",
  storiesTitle: "The latest stories",
};

export const FALLBACK_LEAD_STORY: NewsStoryItem = {
  id: "lead-lupin-fda",
  title: "Lupin gets US FDA nod for vitamin K injection with $52 million US market",
  source: "CNBC-TV18",
  date: "2 h ago",
  link: "https://www.cnbctv18.com/market/stocks/lupin-share-price-fda-approval-vitamin-k-injection-19523041.htm",
  thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&auto=format&fit=crop&q=80",
  tickers: ["LUPIN"],
  summary:
    "Pharma major Lupin has received US FDA approval for Phytonadione Injectable Emulsion USP (10 mg/mL), targeting an estimated $52 million US market. The product will be manufactured at Lupin's Nagpur injectable facility, expanding its high-barrier specialty hospital portfolio in North America.",
  category: "top_stories",
  tag: "LEAD STORY",
  isLead: true,
};

export const FALLBACK_SHORTS: NewsShortItem[] = [
  {
    id: "short-1",
    title: "US Green Card Shock: Infosys, TCS, Wipro & Cognizant Suspended from PERM",
    source: "Moneycontrol",
    date: "2 h ago",
    link: "https://www.moneycontrol.com",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    tickers: ["INFY", "TCS", "WIPRO"],
    duration: "0:45",
  },
  {
    id: "short-2",
    title: "BREAKING: US Bans Infosys, TCS, Wipro, HCL From PERM Programme",
    source: "CNBC-TV18",
    date: "2 h ago",
    link: "https://www.cnbctv18.com",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop&q=80",
    tickers: ["INFY", "TCS", "HCLTECH"],
    duration: "0:58",
  },
  {
    id: "short-3",
    title: "Q2 Results Preview: IT Giants & BFSI Sector Growth Estimates",
    source: "Zee Business",
    date: "3 h ago",
    link: "https://www.zeebiz.com",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80",
    tickers: ["TCS", "INFY"],
    duration: "1:10",
  },
  {
    id: "short-4",
    title: "Money Guru: Mutual Fund SIP Strategy and Largecap Valuation",
    source: "Zee Business",
    date: "4 h ago",
    link: "https://www.zeebiz.com",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80",
    tickers: ["HDFCBANK", "SBIN"],
    duration: "0:52",
  },
  {
    id: "short-5",
    title: "Share Market Tomorrow: Nifty & Bank Nifty Trade Setup for Expiry",
    source: "CNBC Awaaz",
    date: "4 h ago",
    link: "https://hindi.cnbctv18.com",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&auto=format&fit=crop&q=80",
    tickers: ["NIFTY 50"],
    duration: "1:05",
  },
];

export const FALLBACK_STORIES: NewsStoryItem[] = [
  {
    id: "story-dmart-q2-et",
    title: "DMart Q2 Results: Cons profit rises nearly 9% YoY to Rs 743 crore, revenue jumps 18%",
    source: "The Economic Times",
    date: "6 h ago",
    link: "https://economictimes.indiatimes.com/markets/stocks/earnings/dmart-q2-results-profit-rises-revenue-up/articleshow/114120145.cms",
    thumbnail: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80",
    tickers: ["DMART"],
    summary:
      "Avenue Supermarts reported an 8.9% YoY rise in consolidated net profit to Rs 743 crore for the second quarter ended September 30, with revenue rising 18% to Rs 14,050 crore driven by robust festive stocking and new superstore footprint.",
  },
  {
    id: "story-dmart-q2-mint",
    title: "Avenue Supermarts Q2 Results: DMart parent net profit jumps 8.5% to ₹742.98 crore, revenue up 18%",
    source: "Mint",
    date: "7 h ago",
    link: "https://www.livemint.com/market/company-results/avenue-supermarts-dmart-q2-results-net-profit-revenue-1172871234.html",
    thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
    tickers: ["DMART"],
    summary:
      "DMart operator Avenue Supermarts reported Q2 FY26 revenue from operations at Rs 14,444 crore versus Rs 12,307 crore in the corresponding quarter last fiscal, maintaining double-digit top-line momentum across suburban clusters.",
  },
  {
    id: "story-dmart-q2-ndtv",
    title: "DMart Q2 results: Avenue Supermarts Net Profit Rises 8% to Rs 804 Crore, Misses Estimates",
    source: "NDTV Profit",
    date: "7 h ago",
    link: "https://www.ndtvprofit.com/earnings/dmart-q2-results-revenue-profit-estimates-q2fy26",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=80",
    tickers: ["DMART"],
    summary:
      "Avenue Supermarts posted an 8% increase in net profit for the quarter ended September 30, trailing consensus street estimates as rising operational expenditures and quick commerce delivery incursions weighed on metro store footfalls.",
  },
  {
    id: "story-dividends-splits-mint",
    title: "Upcoming dividend, stock split, bonus share, right issue next week, 12-17 October: Vedanta, TCS, Ola Electric, and more",
    source: "Mint",
    date: "9 h ago",
    link: "https://www.livemint.com/market/stock-market-news/upcoming-dividend-stock-split-bonus-share-vedanta-tcs-ola-electric-1172872345.html",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
    tickers: ["TCS", "VEDL"],
    summary:
      "Corporate action calendar for the coming trading week highlights Vedanta's high-yield interim dividend, Tata Consultancy Services record date for capital payouts, alongside bonus share distributions from bluechip conglomerates.",
  },
  {
    id: "story-quarterly-results-mint",
    title: "Q2 Quarterly Results 2026 Today|Avenue Supermarts (DMart), Premier Polyfilm, , LCC Infotech, Grand Oak Canyon Distillery",
    source: "Mint",
    date: "10 h ago",
    link: "https://www.livemint.com/market/company-results/q2-quarterly-results-today-dmart-premier-polyfilm-1172873456.html",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=80",
    tickers: ["DMART"],
    summary:
      "Q2 earnings season gathers pace with retail market leader Avenue Supermarts leading the corporate reporting agenda, alongside specialized industrial manufacturers and consumer discretionary businesses reporting earnings today.",
  },
];
