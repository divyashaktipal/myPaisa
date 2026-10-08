import type {
  DashboardNavItemConfig,
  BrandLogoConfig,
  SearchInputConfig,
  MarketStatusBadgeConfig,
  UserProfileConfig,
} from "@/types/DashboardNavbar";

export const DASHBOARD_NAV_ITEMS: DashboardNavItemConfig[] = [
  { id: "live", label: "Live", hasDot: true, href: "/dashboard/live" },
  { id: "chart", label: "Chart", href: "/dashboard/chart" },
  { id: "news", label: "News", href: "/dashboard/news" },
  { id: "screener", label: "Screener", href: "/dashboard/screener" },
  { id: "watchlist", label: "Watchlist", href: "/dashboard/watchlist" },
];

export const BRAND_LOGO_CONFIG: BrandLogoConfig = {
  prefix: "my",
  suffix: "Paisa",
  href: "/dashboard/live",
};

export const SEARCH_INPUT_CONFIG: SearchInputConfig = {
  placeholder: "Search, e.g. TRENT, COA...",
  shortcutKey: "⌘K",
  mobileLabel: "Search stocks (⌘K)",
};

export const MARKET_STATUS_BADGE: MarketStatusBadgeConfig = {
  label: "Closed",
  dotColor: "bg-gray-400",
};

export const USER_PROFILE_CONFIG: UserProfileConfig = {
  defaultName: "Trader",
  defaultEmail: "user@mypaisa.com",
  defaultInitial: "S",
  watchlistText: "My Watchlist",
  signOutText: "Sign out",
  signOutCallbackUrl: "/",
};
