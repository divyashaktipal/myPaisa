import type React from "react";
import type { DashboardUser } from "./DashboardNavbar";

export interface DashboardShellProps {
  user?: DashboardUser | null;
  children: React.ReactNode;
}

export interface DashboardContextValue {
  user?: DashboardUser | null;
  watchlist: string[];
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleWatchlist: (symbol: string) => void;
  watchlistNotification: string | null;
  dismissWatchlistNotification: () => void;
}
