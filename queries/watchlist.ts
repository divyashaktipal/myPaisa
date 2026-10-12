import {
  DASHBOARD_API_ROUTES,
  DEFAULT_DASHBOARD_STATE,
  QUERY_CLIENT_CONFIG,
  WATCHLIST_UPDATE_ERROR,
} from "@/constants";

export interface WatchlistApiResponse {
  success: boolean;
  symbols: string[];
}

/**
 * Generates the query key for the user watchlist.
 */
export function getWatchlistQueryKey() {
  return ["watchlist"] as const;
}

/**
 * Fetches the user's persisted watchlist or falls back to guest initial watchlist on 401.
 */
export async function fetchWatchlist(): Promise<WatchlistApiResponse> {
  const res = await fetch(DASHBOARD_API_ROUTES.watchlist);
  if (!res?.ok) {
    if (res?.status === 401) {
      console.warn("Watchlist: user unauthenticated, running in guest mode.");
    }
    return {
      success: false,
      symbols: [...DEFAULT_DASHBOARD_STATE.initialWatchlist],
    };
  }
  return res.json();
}

/**
 * Standard TanStack Query options for the watchlist query.
 */
export function watchlistQueryOptions() {
  return {
    queryKey: getWatchlistQueryKey(),
    queryFn: fetchWatchlist,
    staleTime: QUERY_CLIENT_CONFIG?.watchlistStaleTime ?? 300000,
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}

/**
 * API mutation function to toggle a symbol in the user watchlist.
 */
export async function toggleWatchlistApi(
  symbol: string
): Promise<WatchlistApiResponse> {
  const res = await fetch(DASHBOARD_API_ROUTES.watchlist, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
  });

  if (!res?.ok) {
    const status = res?.status ?? 500;
    const err = new Error(
      status === 401
        ? "Sign in required to persist watchlist across sessions."
        : WATCHLIST_UPDATE_ERROR
    );
    (err as unknown as { status: number }).status = status;
    throw err;
  }
  return res.json();
}
