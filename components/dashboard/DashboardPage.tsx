"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeQueryOptions } from "@/queries/finance";
import { watchlistQueryOptions, toggleWatchlistApi } from "@/queries/watchlist";
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
  SignalsSection,
  SignalsPageContent,
  LiveFeedCard,
  LiveNewsFeedSection,
} from "@/components/dashboard";
import type { StockItem } from "@/types/top200Stocks";
import type { HeatmapStock } from "@/types/MarketHeatmap";
import type {
  DashboardPageProps,
  FinanceApiResponse,
  DashboardErrorState,
} from "@/types/DashboardPage";
import type { ChartStat } from "@/types/IndexChartCard";
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

  // TanStack React Query: Dynamic caching with keepPreviousData via centralized query options
  const {
    data: financeData,
    isLoading: isFinanceLoading,
    isFetching: isFinanceFetching,
    error: financeQueryError,
    refetch: refetchFinance,
  } = useQuery<FinanceApiResponse, DashboardErrorState>(
    financeQueryOptions(selectedIndex, selectedWindow)
  );

  // Retain company details across window changes so the right panel never disappears
  const lastKnownAboutRef = useRef<{
    [symbol: string]: {
      aboutSnippet?: string | null;
      aboutLink?: string | null;
      aboutInfo?: Array<{ title?: string; value?: string }>;
      stats?: ChartStat[];
      title?: string | null;
      exchange?: string | null;
    };
  }>({});

  if (financeData?.symbol) {
    const sym = financeData.symbol.toUpperCase();
    const currSnippet = financeData.aboutDetails?.snippet || financeData.about;
    const currStats = financeData.aboutDetails?.stats || financeData.stats;
    if (currSnippet || (currStats && currStats.length > 0)) {
      lastKnownAboutRef.current[sym] = {
        aboutSnippet: currSnippet,
        aboutLink: financeData.aboutDetails?.link,
        aboutInfo: financeData.aboutDetails?.info,
        stats: currStats,
        title: financeData.title || financeData.aboutDetails?.title,
        exchange: financeData.exchange,
      };
    }
  }

  const cachedAbout = lastKnownAboutRef.current[(financeData?.symbol || selectedIndex).toUpperCase()];
  const isInitialLoading = isFinanceLoading && !financeData;
  const isUpdatingData = isFinanceLoading || isFinanceFetching;
  const loading = isFinanceLoading;
  const errorState = dismissedErrorKey === currentErrorKey ? null : (financeQueryError ?? null);

  // TanStack React Query: Cached Watchlist query via centralized query options
  const { data: watchlistData } = useQuery<{ success: boolean; symbols: string[] }>(
    watchlistQueryOptions()
  );

  const watchlist =
    watchlistData?.symbols && Array.isArray(watchlistData?.symbols)
      ? watchlistData.symbols
      : DEFAULT_DASHBOARD_STATE.initialWatchlist;

  // TanStack React Query: Optimistic Watchlist Mutation with auto-rollback on error
  const toggleWatchlistMutation = useMutation({
    mutationFn: toggleWatchlistApi,
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
        {/* {financeData?.date && (
          <StatusBanner
            statusText={`${STATUS_BANNER_LABELS.liveFeedPrefix}${financeData?.title || selectedIndex}`}
            timestamp={`${STATUS_BANNER_LABELS.dataAsOfPrefix}${financeData?.date}`}
          />
        )} */}

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
                  <span>← Back</span>
                </button>
              </div>

              {/* <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0e1624] hover:bg-[#141f30] text-gray-300 text-xs border border-[#1b273a] transition cursor-pointer"
                >
                  Search (⌘K)
                </button>
              </div> */}
            </div>

            {/* Split layout: Chart on Left, Company Details on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Candlestick Stock Chart */}
              <div className="lg:col-span-8">
                <CandlestickChart
                  symbol={financeData?.symbol || selectedIndex}
                  title={financeData?.title || financeData?.aboutDetails?.title || cachedAbout?.title}
                  exchange={financeData?.exchange || cachedAbout?.exchange}
                  price={financeData?.price ?? null}
                  changePercent={financeData?.changePercent ?? null}
                  movement={financeData?.movement ?? null}
                  movementValue={financeData?.movementValue ?? null}
                  date={financeData?.date ?? null}
                  chartPoints={financeData?.chartPoints ?? []}
                  stats={financeData?.stats || cachedAbout?.stats || []}
                  selectedWindow={selectedWindow}
                  setSelectedWindow={setSelectedWindow}
                  loading={isUpdatingData}
                  onBackToIndices={() => setActiveTab("live")}
                />
              </div>

              {/* Right Column: Company Basic Details from SerpApi Knowledge Graph */}
              <div className="lg:col-span-4">
                <CompanyDetailsCard
                  symbol={financeData?.symbol || selectedIndex}
                  title={financeData?.title || financeData?.aboutDetails?.title || cachedAbout?.title}
                  exchange={financeData?.exchange || cachedAbout?.exchange}
                  price={financeData?.price ?? null}
                  changePercent={financeData?.changePercent ?? null}
                  aboutSnippet={financeData?.aboutDetails?.snippet || financeData?.about || cachedAbout?.aboutSnippet}
                  aboutLink={financeData?.aboutDetails?.link || cachedAbout?.aboutLink}
                  aboutInfo={financeData?.aboutDetails?.info || cachedAbout?.aboutInfo}
                  stats={financeData?.aboutDetails?.stats || financeData?.stats || cachedAbout?.stats}
                  isInWatchlist={watchlist.includes(financeData?.symbol || selectedIndex)}
                  onToggleWatchlist={handleToggleWatchlist}
                  loading={isInitialLoading}
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
            <LiveFeedCard
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
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectStock={handleSelectStock}
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

            <LiveNewsFeedSection
              indexName={selectedIndex}
              about={financeData?.about}
              news={financeData?.news}
              onSelectStock={handleSelectStock}
            />
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
