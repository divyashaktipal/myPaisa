export type NavItemId = "live" | "chart" | "news" | "screener" | "watchlist" | string;

export interface NavItemIconProps {
  id: NavItemId;
  className?: string;
}
