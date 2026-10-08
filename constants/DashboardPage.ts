import type {
  DefaultDashboardState,
  DashboardApiRoutes,
  StatusBannerLabels,
} from "@/types/DashboardPage";

export const LIVE_INDEX_SYMBOLS = ["NIFTY 50", "NIFTY 100", "NIFTY 200"] as const;

export const DEFAULT_CHART_STOCK_SYMBOL = "HDFCBANK";

export const DEFAULT_DASHBOARD_STATE: DefaultDashboardState = {
  activeTab: "live",
  selectedIndex: "NIFTY 50",
  selectedWindow: "1D",
  initialWatchlist: ["TRENT", "BSE", "KOTAKBANK"],
  defaultChartStock: DEFAULT_CHART_STOCK_SYMBOL,
};

export const DASHBOARD_API_ROUTES: DashboardApiRoutes = {
  finance: "/api/finance",
  watchlist: "/api/watchlist",
};

export const STATUS_BANNER_LABELS: StatusBannerLabels = {
  liveFeedPrefix: "Live Feed · ",
  dataAsOfPrefix: "Data as of ",
};

export const DASHBOARD_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid stock ticker or timeframe requested (400 Bad Request).",
  401: "Authentication session expired (401 Unauthorized). Please sign in again.",
  403: "Access denied for this resource (403 Forbidden).",
  404: "Market data not found for the requested symbol (404 Not Found).",
  429: "Market search quota or rate limit exceeded (429 Too Many Requests). Please wait a moment.",
  500: "Internal server error occurred while retrieving data (500 Server Error).",
  502: "Upstream market data provider is currently unavailable (502 Bad Gateway).",
  503: "Market service is temporarily unavailable (503 Service Unavailable).",
};

export const DASHBOARD_FALLBACK_ERROR = "Unable to load market data. Please verify your connection and try again.";
export const WATCHLIST_UPDATE_ERROR = "Failed to update your watchlist. Please try again.";
