import { keepPreviousData } from "@tanstack/react-query";
import type { FinanceApiResponse, DashboardErrorState } from "@/types/DashboardPage";
import {
  DASHBOARD_API_ROUTES,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_FALLBACK_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

/**
 * Generates the query key for finance data.
 */
export function getFinanceQueryKey(symbol: string, window: string = "1D") {
  return ["finance", symbol, window] as const;
}

/**
 * Fetches stock/index finance data from the API endpoint.
 * Handles custom HTTP status errors and fallback messages.
 */
export async function fetchFinanceData(
  symbol: string,
  window: string = "1D"
): Promise<FinanceApiResponse> {
  const res = await fetch(
    `${DASHBOARD_API_ROUTES.finance}?symbol=${encodeURIComponent(symbol)}&window=${encodeURIComponent(window)}`
  );

  if (res?.ok) {
    return (await res.json()) as FinanceApiResponse;
  }

  const status = res?.status ?? 500;
  let errorMessage = DASHBOARD_ERROR_MESSAGES[status] || DASHBOARD_FALLBACK_ERROR;

  try {
    const errorJson = await res.json();
    if (errorJson?.error && typeof errorJson?.error === "string") {
      errorMessage = errorJson.error;
    }
  } catch {
    // Fall back to status message
  }

  const customError: DashboardErrorState = {
    statusCode: status,
    message: errorMessage,
  };
  throw customError;
}

/**
 * Standard TanStack Query options for finance data with keepPreviousData caching.
 */
export function financeQueryOptions(symbol: string, window: string = "1D") {
  return {
    queryKey: getFinanceQueryKey(symbol, window),
    queryFn: () => fetchFinanceData(symbol, window),
    placeholderData: keepPreviousData,
    staleTime:
      window === "1D"
        ? (QUERY_CLIENT_CONFIG?.liveWindowStaleTime ?? 180000)
        : (QUERY_CLIENT_CONFIG?.historicalWindowStaleTime ?? 900000),
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, err: unknown) => {
      const dashboardErr = err as DashboardErrorState | undefined;
      if (
        dashboardErr?.statusCode &&
        (dashboardErr.statusCode === 400 || dashboardErr.statusCode === 404)
      ) {
        return false;
      }
      return failureCount < 1;
    },
  };
}
