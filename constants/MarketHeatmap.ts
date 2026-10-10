export interface SectorConfig {
  id: string;
  name: string;
  symbols: string[];
}

export const HEATMAP_SECTORS_CONFIG: SectorConfig[] = [
  {
    id: "financial-services",
    name: "FINANCIAL SERVICES",
    symbols: [
      "PAYTM",
      "HDFCBANK",
      "ICICIBANK",
      "BSE",
      "BAJFINANCE",
      "KOTAKBANK",
      "AXISBANK",
      "SBIN",
      "LICHSGFIN",
      "MCX",
      "SHRIRAMFIN",
      "POLICYBZR",
      "BANKBARODA",
      "SBILIFE",
      "PNB",
      "JIOFIN",
      "HDFCLIFE",
      "CHOLAFIN",
      "ABCAPITAL",
      "FEDERALBNK",
    ],
  },
  {
    id: "capital-goods",
    name: "CAPITAL GOODS",
    symbols: [
      "BHEL",
      "BEL",
      "SUZLON",
      "POLYCAB",
      "HAL",
      "ASHOKLEY",
      "SIEMENS",
      "ABB",
      "CUMMINSIND",
    ],
  },
  {
    id: "metals-mining",
    name: "METALS & MINING",
    symbols: [
      "ADANIENT",
      "TATASTEEL",
      "HINDALCO",
      "VEDL",
      "JSWSTEEL",
      "SAIL",
      "JINDALSTEL",
      "NMDC",
    ],
  },
  {
    id: "healthcare",
    name: "HEALTHCARE",
    symbols: [
      "APOLLOHOSP",
      "DIVISLAB",
      "SUNPHARMA",
      "DRREDDY",
      "LAURUSLABS",
      "CIPLA",
      "MAXHEALTH",
      "LUPIN",
    ],
  },
  {
    id: "consumer-services",
    name: "CONSUMER SERVICES",
    symbols: [
      "ETERNAL",
      "TRENT",
      "NAUKRI",
      "JUBLFOOD",
      "DMART",
      "INDHOTEL",
    ],
  },
  {
    id: "fmcg",
    name: "FMCG",
    symbols: [
      "ITC",
      "HINDUNILVR",
      "VBL",
      "BRITANNIA",
      "TATACONSUM",
      "MARICO",
      "GODREJCP",
    ],
  },
  {
    id: "it",
    name: "IT",
    symbols: [
      "INFY",
      "TCS",
      "COFORGE",
      "HCLTECH",
      "WIPRO",
      "TECHM",
      "LTIM",
      "PERSISTENT",
    ],
  },
  {
    id: "power",
    name: "POWER",
    symbols: [
      "ADANIGREEN",
      "ADANIPOWER",
      "NTPC",
      "POWERGRID",
      "TATAPOWER",
      "TORNTPOWER",
    ],
  },
  {
    id: "auto",
    name: "AUTO",
    symbols: [
      "M&M",
      "MARUTI",
      "TVSMOTOR",
      "EICHERMOT",
      "TATAMOTORS",
      "BAJAJ-AUTO",
      "HEROMOTOCO",
    ],
  },
  {
    id: "oil-gas",
    name: "OIL & GAS",
    symbols: [
      "RELIANCE",
      "COALINDIA",
      "HINDPETRO",
      "ONGC",
      "IOC",
      "BPCL",
      "GAIL",
    ],
  },
  {
    id: "telecom",
    name: "TELECOMMUNICATION",
    symbols: [
      "BHARTIARTL",
      "TATACOMM",
      "RAILTEL",
    ],
  },
  {
    id: "services",
    name: "SERVICES",
    symbols: [
      "ADANIPORTS",
      "INDIGO",
      "DELHIVERY",
    ],
  },
  {
    id: "realty",
    name: "REALTY",
    symbols: [
      "DLF",
      "PHOENIXLTD",
      "PRESTIGE",
      "GODREJPROP",
      "OBEROIRLTY",
    ],
  },
  {
    id: "consumer-durables",
    name: "CONSUMER DURABLES",
    symbols: [
      "TITAN",
      "HAVELLS",
      "VOLTAS",
      "DIXON",
    ],
  },
  {
    id: "chemicals",
    name: "CHEMICALS",
    symbols: [
      "PIDILITIND",
      "SRF",
      "DEEPAKNTR",
      "TATACHEM",
      "FLUOROCHEM",
    ],
  },
  {
    id: "infra-materials",
    name: "INFRA & MATERIALS",
    symbols: [
      "LT",
      "ULTRACEMCO",
      "AMBUJACEM",
    ],
  },
];

export const HEATMAP_TEXT_CONFIG = {
  heading: "Where the money is trading",
  subheading: "Tile size is traded value today, grouped by sector",
  allTabLabel: "All Stocks",
  topSectorTabLabel: "Top in Each Sector",
  filterSectorsPlaceholder: "All Sectors",
  viewChartCta: "Click to view TanStack chart",
  liveBadgeText: "Real-time NSE/BSE",
  currencySymbol: "₹",
  croreSuffix: "Cr",
};

/**
 * Returns background color according to the exact shade scale in the screenshot
 */
export function getTileBackgroundColor(changePercent: number): string {
  if (changePercent >= 3.0) return "#15803d"; // vibrant emerald
  if (changePercent >= 1.0) return "#166534"; // rich emerald
  if (changePercent > 0.0) return "#134e3a";  // subtle forest green
  if (changePercent === 0.0) return "#222d3d"; // neutral dark slate
  if (changePercent >= -1.0) return "#3b1e25"; // subtle wine
  if (changePercent >= -2.5) return "#552029"; // medium burgundy
  if (changePercent >= -4.5) return "#751b27"; // deep crimson/maroon
  return "#991b1b"; // intense red for paytm -5.2%, adanigreen -7.9%
}

export function getTileBorderColor(changePercent: number): string {
  if (changePercent > 0) return "rgba(34, 197, 94, 0.25)";
  return "rgba(244, 63, 94, 0.25)";
}
