"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DashboardNavbar,
  StatusBanner,
  IndexChartCard,
  CandlestickChart,
  CompanyDetailsCard,
  MarketSummaryAndMovers,
  SearchCommandPalette,
  WatchlistSection,
  MarketHeatmapSection,
  TanStackStockChart,
  SignalsSection,
  SignalsPageContent,
} from "@/components/dashboard";
import type { StockItem } from "@/types/top200Stocks";
import type { HeatmapStock } from "@/types/MarketHeatmap";
import type {
  DashboardPageProps,
  FinanceApiResponse,
  DashboardErrorState,
} from "@/types/DashboardPage";
import {
  DEFAULT_DASHBOARD_STATE,
  LIVE_INDEX_SYMBOLS,
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

  const [chartEngine, setChartEngine] = useState<"tanstack" | "candlestick">("tanstack");

  // Sync URL query param ?stock=slug on load
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stockParam = params.get("stock");
      if (stockParam) {
        setSelectedIndex(stockParam.toUpperCase());
        setActiveTab("chart");
      }
    }
  }, []);

  const handleToggleWatchlist = (symbol: string) => {
    toggleWatchlistMutation.mutate(symbol);
  };

  const handleSelectStock = (
    stockOrSymbol: StockItem | HeatmapStock | { symbol: string; slug?: string } | string
  ) => {
    const symbol = typeof stockOrSymbol === "string" ? stockOrSymbol : stockOrSymbol.symbol;
    const slug =
      typeof stockOrSymbol === "string"
        ? stockOrSymbol.toLowerCase()
        : "slug" in stockOrSymbol && stockOrSymbol.slug
        ? stockOrSymbol.slug
        : symbol.toLowerCase();

    if (symbol) {
      setSelectedIndex(symbol);
      setActiveTab("chart");
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("stock", slug);
        window.history.pushState({}, "", url.toString());
      } catch {
        // Ignore
      }
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
            onSelectStock={handleSelectStock}
          />
        ) : activeTab === "chart" ? (
          /* Chart Tab: Dedicated Stock Chart followed by Stock Name and Slug */
          <div className="space-y-6">
            {/* Top Return to Live Heatmap Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080d16] border border-[#152236] rounded-2xl p-3 px-4 shadow-lg">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("live")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121c2c] hover:bg-[#1a283e] text-emerald-400 hover:text-emerald-300 border border-[#1e2f48] text-xs font-semibold transition cursor-pointer"
                >
                  <span>← Back to Live Heatmap</span>
                </button>
                <span className="text-gray-600 text-xs hidden sm:inline">|</span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  Inspecting <span className="text-white font-bold">{financeData?.title || selectedIndex}</span> ({selectedIndex.toLowerCase()})
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Engine Selector */}
                <div className="flex items-center gap-1 bg-[#05080e] p-1 rounded-xl border border-[#141e2e]">
                  <button
                    type="button"
                    onClick={() => setChartEngine("tanstack")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      chartEngine === "tanstack"
                        ? "bg-[#182638] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    TanStack Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartEngine("candlestick")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      chartEngine === "candlestick"
                        ? "bg-[#182638] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Candlestick
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0e1624] hover:bg-[#141f30] text-gray-300 text-xs border border-[#1b273a] transition cursor-pointer"
                >
                  Search (⌘K)
                </button>
              </div>
            </div>

            {/* Split layout: Chart on Left, Company Details on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Stock Chart */}
              <div className="lg:col-span-8">
                {chartEngine === "tanstack" ? (
                  <TanStackStockChart
                    stock={{
                      symbol: financeData?.symbol || selectedIndex,
                      name: financeData?.title || financeData?.aboutDetails?.title || selectedIndex,
                      slug: (financeData?.symbol || selectedIndex).toLowerCase(),
                      price: financeData?.price ?? 0,
                      change: financeData?.movementValue ?? 0,
                      changePercent: financeData?.changePercent ?? 0,
                      turnoverCr: Math.round(((financeData?.price ?? 0) * 2000000) / 10000000),
                      volume: 2000000,
                      sector: financeData?.aboutDetails?.exchange || "NSE",
                    }}
                    selectedWindow={selectedWindow}
                    onSelectWindow={setSelectedWindow}
                  />
                ) : (
                  <CandlestickChart
                    symbol={financeData?.symbol || selectedIndex}
                    title={financeData?.title || financeData?.aboutDetails?.title}
                    exchange={financeData?.exchange}
                    price={financeData?.price ?? null}
                    changePercent={financeData?.changePercent ?? null}
                    movement={financeData?.movement ?? null}
                    movementValue={financeData?.movementValue ?? null}
                    date={financeData?.date ?? null}
                    chartPoints={financeData?.chartPoints ?? []}
                    selectedWindow={selectedWindow}
                    setSelectedWindow={setSelectedWindow}
                    loading={loading}
                    onBackToIndices={() => setActiveTab("live")}
                  />
                )}
              </div>

              {/* Right Column: Company Basic Details from SerpApi Knowledge Graph */}
              <div className="lg:col-span-4">
                <CompanyDetailsCard
                  symbol={financeData?.symbol || selectedIndex}
                  title={financeData?.title || financeData?.aboutDetails?.title}
                  exchange={financeData?.exchange}
                  price={financeData?.price ?? null}
                  changePercent={financeData?.changePercent ?? null}
                  aboutSnippet={financeData?.aboutDetails?.snippet || financeData?.about}
                  aboutLink={financeData?.aboutDetails?.link}
                  aboutInfo={financeData?.aboutDetails?.info}
                  stats={financeData?.aboutDetails?.stats || financeData?.stats}
                  isInWatchlist={watchlist.includes(financeData?.symbol || selectedIndex)}
                  onToggleWatchlist={handleToggleWatchlist}
                  loading={loading}
                />
              </div>
            </div>

            {/* Bottom Split Section: Real Company News & Discover Items from SerpApi */}
            {financeData && (
              <MarketSummaryAndMovers
                indexName={financeData?.title || selectedIndex}
                about={financeData?.about}
                news={financeData?.news}
                related={financeData?.related}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectStock={handleSelectStock}
              />
            )}
          </div>
        ) : activeTab === "signals" ? (
          /* Signals Tab */
          <SignalsPageContent />
        ) : activeTab === "news" ? (
          /* News Tab */
          <MarketSummaryAndMovers
            indexName={financeData?.title || selectedIndex}
            about={financeData?.about}
            news={financeData?.news}
            related={financeData?.related}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectStock={handleSelectStock}
          />
        ) : (
          /* Live View: Live Indices Section followed by Market Heatmap Section */
          <div className="space-y-6">
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

            <MarketHeatmapSection
              onSelectStock={handleSelectStock}
              selectedStockSymbol={selectedIndex}
            />

            <SignalsSection
              onSelectStock={(stock) => {
                handleSelectStock({ symbol: stock.symbol, slug: stock.slug });
              }}
            />

            {financeData && (
              <MarketSummaryAndMovers
                indexName={selectedIndex}
                about={financeData?.about}
                news={financeData?.news}
                related={financeData?.related}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectStock={handleSelectStock}
              />
            )}
          </div>
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
