"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DashboardNavbar,
  StatusBanner,
  IndexChartCard,
  MarketSummaryAndMovers,
  SearchCommandPalette,
  WatchlistSection,
} from "@/components/dashboard";
import type { StockItem } from "@/types/top200Stocks";
import type {
  DashboardPageProps,
  FinanceApiResponse,
  DashboardErrorState,
} from "@/types/DashboardPage";
import {
  DEFAULT_DASHBOARD_STATE,
  DASHBOARD_API_ROUTES,
  STATUS_BANNER_LABELS,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_FALLBACK_ERROR,
  WATCHLIST_UPDATE_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

const DashboardPage = ({ user }: DashboardPageProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_DASHBOARD_STATE.activeTab);
  const [selectedIndex, setSelectedIndex] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedIndex);
  const [selectedWindow, setSelectedWindow] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedWindow);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [watchlistNotification, setWatchlistNotification] = useState<string | null>(null);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // TanStack React Query: Dynamic caching with window-dependent staleTime
  const currentErrorKey = `${selectedIndex}-${selectedWindow}`;

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

  // TanStack React Query: Cached Watchlist query
  const { data: watchlistData } = useQuery<{ success: boolean; symbols: string[] }>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch(DASHBOARD_API_ROUTES.watchlist);
      if (!res?.ok) {
        if (res?.status === 401) {
          console.warn("Watchlist: user unauthenticated, running in guest mode.");
        }
        return { success: false, symbols: [...DEFAULT_DASHBOARD_STATE.initialWatchlist] };
      }
      return res.json();
    },
    staleTime: QUERY_CLIENT_CONFIG?.watchlistStaleTime ?? 300000,
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const watchlist =
    watchlistData?.symbols && Array.isArray(watchlistData?.symbols)
      ? watchlistData.symbols
      : DEFAULT_DASHBOARD_STATE.initialWatchlist;

  // TanStack React Query: Optimistic Watchlist Mutation with auto-rollback on error
  const toggleWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
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
    },
    onMutate: async (symbol: string) => {
      setWatchlistNotification(null);
      await queryClient.cancelQueries({ queryKey: ["watchlist"] });
      const previous = queryClient.getQueryData<{ success: boolean; symbols: string[] }>(["watchlist"]);
      const previousSymbols = previous?.symbols ?? [...DEFAULT_DASHBOARD_STATE.initialWatchlist];

      const exists = previousSymbols.includes(symbol);
      const nextSymbols = exists
        ? previousSymbols.filter((s) => s !== symbol)
        : [...previousSymbols, symbol];

      queryClient.setQueryData(["watchlist"], {
        success: true,
        symbols: nextSymbols,
      });

      return { previousSymbols };
    },
    onError: (err: unknown, _symbol, context) => {
      if (context?.previousSymbols) {
        queryClient.setQueryData(["watchlist"], {
          success: true,
          symbols: context.previousSymbols,
        });
      }
      const message = err instanceof Error ? err.message : WATCHLIST_UPDATE_ERROR;
      setWatchlistNotification(message);
    },
    onSuccess: (result) => {
      if (result?.symbols && Array.isArray(result?.symbols)) {
        queryClient.setQueryData(["watchlist"], {
          success: true,
          symbols: result.symbols,
        });
      }
    },
  });

  const handleToggleWatchlist = (symbol: string) => {
    toggleWatchlistMutation.mutate(symbol);
  };

  const handleSelectStock = (stock: StockItem) => {
    if (stock?.symbol) {
      setSelectedIndex(stock.symbol);
      setActiveTab("live");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b11] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Universal Navbar */}
      <DashboardNavbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        watchlistCount={watchlist?.length ?? 0}
      />

      {/* Main Responsive Dashboard Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
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

        {/* Watchlist Notification Toast */}
        {watchlistNotification && (
          <div className="w-full rounded-2xl bg-amber-950/40 border border-amber-800/60 p-3.5 flex items-center justify-between text-amber-200 text-xs">
            <span>{watchlistNotification}</span>
            <button
              type="button"
              onClick={() => setWatchlistNotification(null)}
              className="text-amber-400 hover:text-amber-200 text-sm ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real Live Timestamp Banner */}
        {financeData?.date && (
          <StatusBanner
            statusText={`${STATUS_BANNER_LABELS.liveFeedPrefix}${financeData?.title || selectedIndex}`}
            timestamp={`${STATUS_BANNER_LABELS.dataAsOfPrefix}${financeData?.date}`}
          />
        )}

        {activeTab === "watchlist" ? (
          /* Watchlist View */
          <WatchlistSection
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        ) : (
          /* Live Terminal & Chart View */
          <>
            {/* Main Interactive Index & Chart Card */}
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

            {/* Bottom Split Section: Real Market News & Related Markets from SerpApi */}
            {financeData && (
              <MarketSummaryAndMovers
                indexName={selectedIndex}
                about={financeData?.about}
                news={financeData?.news}
                related={financeData?.related}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}
          </>
        )}
      </main>

      {/* ⌘K Global Search Command Palette */}
      <SearchCommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onSelectStock={handleSelectStock}
      />
    </div>
  );
};

export default DashboardPage;
