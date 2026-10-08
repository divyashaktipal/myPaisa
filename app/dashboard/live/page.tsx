"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  StatusBanner,
  IndexChartCard,
  MarketSummaryAndMovers,
  useDashboard,
} from "@/components/dashboard";
import type { FinanceApiResponse, DashboardErrorState } from "@/types/DashboardPage";
import {
  DEFAULT_DASHBOARD_STATE,
  DASHBOARD_API_ROUTES,
  STATUS_BANNER_LABELS,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_FALLBACK_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

export const dynamic = "force-dynamic";

const LivePage = () => {
  const router = useRouter();
  const { watchlist, toggleWatchlist } = useDashboard();
  const [selectedIndex, setSelectedIndex] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedIndex);
  const [selectedWindow, setSelectedWindow] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedWindow);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  const currentErrorKey = `${selectedIndex}-${selectedWindow}`;

  // TanStack React Query: Dynamic caching with window-dependent staleTime for Live Indices
  const {
    data: financeData,
    isLoading: isFinanceLoading,
    error: financeQueryError,
    refetch: refetchFinance,
  } = useQuery<FinanceApiResponse, DashboardErrorState>({
    queryKey: ["finance", selectedIndex, selectedWindow],
    queryFn: async () => {
      const res = await fetch(
        `${DASHBOARD_API_ROUTES.finance}?symbol=${encodeURIComponent(selectedIndex)}&window=${encodeURIComponent(selectedWindow)}`
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
    },
    staleTime:
      selectedWindow === "1D"
        ? (QUERY_CLIENT_CONFIG?.liveWindowStaleTime ?? 180000)
        : (QUERY_CLIENT_CONFIG?.historicalWindowStaleTime ?? 900000),
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, err) => {
      if (err?.statusCode && (err.statusCode === 400 || err.statusCode === 404)) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const loading = isFinanceLoading;
  const errorState = dismissedErrorKey === currentErrorKey ? null : (financeQueryError ?? null);

  return (
    <div className="w-full space-y-6">
      {/* Error Notification Alert Banner */}
      {errorState && (
        <div
          role="alert"
          className="w-full rounded-2xl bg-rose-950/50 border border-rose-800/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg text-rose-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                {errorState?.statusCode > 0 ? `HTTP ${errorState?.statusCode} Error` : "Network Error"}
              </p>
              <p className="text-sm font-medium text-rose-100 mt-0.5">
                {errorState?.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDismissedErrorKey(null);
                refetchFinance();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 text-xs font-semibold transition cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setDismissedErrorKey(currentErrorKey)}
              className="p-1 rounded-lg text-rose-400 hover:text-rose-200 transition text-sm cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real Live Timestamp Banner */}
      {financeData?.date && (
        <StatusBanner
          statusText={`${STATUS_BANNER_LABELS.liveFeedPrefix}${financeData?.title || selectedIndex}`}
          timestamp={`${STATUS_BANNER_LABELS.dataAsOfPrefix}${financeData?.date}`}
        />
      )}

      {/* Live Indices Terminal: Show Nifty 50, 100, 200 Index Tabs & Area Chart */}
      <IndexChartCard
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        selectedWindow={selectedWindow}
        setSelectedWindow={setSelectedWindow}
        price={financeData?.price ?? null}
        changePercent={financeData?.changePercent ?? null}
        movement={financeData?.movement ?? null}
        movementValue={financeData?.movementValue ?? null}
        date={financeData?.date ?? null}
        chartPoints={financeData?.chartPoints ?? []}
        stats={financeData?.stats ?? []}
        loading={loading}
      />

      {/* Live Market Summary, Real Top News & Market Movers */}
      {financeData && (
        <MarketSummaryAndMovers
          indexName={selectedIndex}
          about={financeData?.about}
          news={financeData?.news}
          related={financeData?.related}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          onSelectStock={(sym) => {
            router.push(`/dashboard/chart?symbol=${encodeURIComponent(sym)}`);
          }}
        />
      )}
    </div>
  );
};

export default LivePage;
