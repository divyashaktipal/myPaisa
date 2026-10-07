import type {
  DashboardNavItemConfig,
  BrandLogoConfig,
  SearchInputConfig,
  MarketStatusBadgeConfig,
  UserProfileConfig,
} from "@/types/DashboardNavbar";

export const DASHBOARD_NAV_ITEMS: DashboardNavItemConfig[] = [
  { id: "live", label: "Live", hasDot: true },
  { id: "chart", label: "Chart" },
  { id: "news", label: "News" },
  { id: "screener", label: "Screener" },
  { id: "watchlist", label: "Watchlist" },
];

export const BRAND_LOGO_CONFIG: BrandLogoConfig = {
  prefix: "my",
  suffix: "Paisa",
  href: "/dashboard",
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
