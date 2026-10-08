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
    id: "story-1",
    title: "Indian IT Stocks: Infosys, Wipro ADRs fall up to 3% after US action on H1B visa programme",
    source: "ET Now",
    date: "2 h ago",
    link: "https://www.etnownews.com/markets/indian-it-stocks-infosys-wipro-adrs-fall-article-113948512",
    thumbnail: "https://economictimes.indiatimes.com/favicon.ico",
    tickers: ["INFY", "WIPRO"],
    summary:
      "Indian IT ADRs saw profit taking in pre-market trading following US Department of Labor reviews on skilled worker visa processing. Analysts highlight that tier-1 Indian tech majors now source over 60% of their North American staff locally.",
  },
  {
    id: "story-2",
    title: "Bank of India Mutual Fund buys 0.57% stake in One Mobikwik Systems, Enigma Investment picks up 0.8% shares",
    source: "Moneycontrol",
    date: "2 h ago",
    link: "https://www.moneycontrol.com/news/business/markets/bank-of-india-mf-buys-stake-14051020.html",
    thumbnail: "https://www.moneycontrol.com/favicon.ico",
    tickers: ["BANKINDIA"],
    summary:
      "Block trade data showed domestic mutual funds increasing their fintech portfolio allocations. Bank of India Mutual Fund acquired a 0.57% equity stake in Mobikwik amid robust growth in digital credit distribution.",
  },
  {
    id: "story-3",
    title: "Cognizant, Infosys, Tata, Wipro, HCL among 8 IT firms suspended from US green card programme",
    source: "The Economic Times",
    date: "3 h ago",
    link: "https://economictimes.indiatimes.com/tech/information-tech/eight-it-firms-suspended-us-green-card-perm/articleshow/114092145.cms",
    thumbnail: "https://economictimes.indiatimes.com/favicon.ico",
    tickers: ["INFY", "WIPRO"],
    summary:
      "Administrative pauses on PERM certifications affected eight multinational tech service providers. NASSCOM reiterated that global delivery models remain diversified with robust local offshore hiring.",
  },
  {
    id: "story-4",
    title: "'Fundamental insult to US workers': Vance torches Microsoft over H-1B, suspends Green Card program",
    source: "The Economic Times",
    date: "3 h ago",
    link: "https://economictimes.indiatimes.com/news/international/us/vance-torches-microsoft-h1b-114093210.cms",
    thumbnail: "https://economictimes.indiatimes.com/favicon.ico",
    tickers: ["INFY"],
    summary:
      "US political discourse on tech staffing prompted market participants to model potential onsite cost variations. Large IT exporters continue to accelerate local talent centers across the US and Europe.",
  },
  {
    id: "story-5",
    title: "US immigration crackdown: Infosys hits 52-week low, Wipro ADR falls 3%",
    source: "Financial Express",
    date: "3 h ago",
    link: "https://www.financialexpress.com/market/it-stocks-infosys-52-week-low-wipro-adr-down-3610214/",
    thumbnail: "https://www.financialexpress.com/favicon.ico",
    tickers: ["INFY", "WIPRO"],
    summary:
      "IT index was the top sectoral drag as investors rotated into defensive pharmaceutical and FMCG counters. Trading desks noted strong institutional support near long-term multi-year valuation support lines.",
  },
  {
    id: "story-6",
    title: "Infosys, Wipro ADRs drop 3% as Cognizant, Infosys, TCS, Wipro, HCL among IT firms suspended from US green card programme",
    source: "Mint",
    date: "3 h ago",
    link: "https://www.livemint.com/market/stock-market-news/it-adrs-drop-tcs-infy-wipro-perm-us-11728461029141.html",
    thumbnail: "https://www.livemint.com/favicon.ico",
    tickers: ["INFY", "TCS", "WIPRO"],
    summary:
      "American Depositary Receipts closed in the red tracking headlines out of Washington. Domestic brokerages reiterated Buy ratings on Infosys and TCS citing strong digital banking pipeline and resilient order books.",
  },
];
