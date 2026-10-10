export type NavItemId = "live" | "chart" | "news" | "signals" | "screener" | "watchlist" | string;

export interface NavItemIconProps {
  id: NavItemId;
  className?: string;
}
