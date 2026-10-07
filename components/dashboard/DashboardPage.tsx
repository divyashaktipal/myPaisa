"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "@/constants/DashboardPage";

const DashboardPage = ({ user }: DashboardPageProps) => {
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_DASHBOARD_STATE.activeTab);
  const [selectedIndex, setSelectedIndex] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedIndex);
  const [selectedWindow, setSelectedWindow] = useState<string>(DEFAULT_DASHBOARD_STATE.selectedWindow);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([...DEFAULT_DASHBOARD_STATE.initialWatchlist]);

  // 100% Dynamic SerpApi Finance state - absolutely NO mock/fallback data
  const [financeData, setFinanceData] = useState<FinanceApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<DashboardErrorState | null>(null);
  const [watchlistNotification, setWatchlistNotification] = useState<string | null>(null);

  // Fetch Watchlist from MongoDB / API with comprehensive status code error handling
  useEffect(() => {
    fetch(DASHBOARD_API_ROUTES.watchlist)
      .then(async (res) => {
        if (res?.ok) {
          return res.json();
        }
        if (res?.status === 401) {
          console.warn("Watchlist: user unauthenticated, running in guest mode.");
        } else if ((res?.status ?? 0) >= 500) {
          console.error(`Watchlist API returned server error status ${res?.status}`);
        }
        return null;
      })
      .then((data) => {
        if (data?.symbols && Array.isArray(data?.symbols)) {
          setWatchlist(data?.symbols);
        }
      })
      .catch((err) => {
        console.error("Network error fetching watchlist:", err);
      });
  }, []);

  // Fetch Live Finance Data strictly from SerpApi with HTTP 400, 401, 404, 429, 500, 502, 503 handling
  const fetchFinance = useCallback(async (index: string, window: string) => {
    setLoading(true);
    setErrorState(null);

    try {
      const res = await fetch(
        `${DASHBOARD_API_ROUTES.finance}?symbol=${encodeURIComponent(index)}&window=${encodeURIComponent(window)}`
      );

      if (res?.ok) {
        const json = (await res?.json?.()) as FinanceApiResponse;
        setFinanceData(json);
        setErrorState(null);
      } else {
        const status = res?.status ?? 500;
        let errorMessage = DASHBOARD_ERROR_MESSAGES[status] || DASHBOARD_FALLBACK_ERROR;

        try {
          const errorJson = await res?.json?.();
          if (errorJson?.error && typeof errorJson?.error === "string") {
            errorMessage = errorJson?.error;
          }
        } catch {
          // If response body isn't JSON, retain default status code message
        }

        setFinanceData(null);
        setErrorState({
          statusCode: status,
          message: errorMessage,
        });
      }
    } catch (err: unknown) {
      console.error("Fetch finance network exception:", err);
      setFinanceData(null);
      setErrorState({
        statusCode: 0,
        message: DASHBOARD_FALLBACK_ERROR,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance(selectedIndex, selectedWindow);
  }, [selectedIndex, selectedWindow, fetchFinance]);

  // Toggle stock in MongoDB Watchlist with optimistic update and rollback on 400/500 errors
  const handleToggleWatchlist = async (symbol: string) => {
    const previousWatchlist = [...watchlist];
    const exists = watchlist.includes(symbol);
    setWatchlist((prev) => (exists ? prev.filter((s) => s !== symbol) : [...prev, symbol]));
    setWatchlistNotification(null);

    try {
      const res = await fetch(DASHBOARD_API_ROUTES.watchlist, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (res?.ok) {
        const result = await res?.json?.();
        if (result?.symbols && Array.isArray(result?.symbols)) {
          setWatchlist(result?.symbols);
        }
      } else {
        const status = res?.status ?? 500;
        console.warn(`Watchlist modification failed with HTTP ${status}`);
        setWatchlist(previousWatchlist);
        setWatchlistNotification(
          status === 401
            ? "Sign in required to persist watchlist across sessions."
            : WATCHLIST_UPDATE_ERROR
        );
      }
    } catch (err) {
      console.error("Error communicating with watchlist API:", err);
      setWatchlist(previousWatchlist);
      setWatchlistNotification(WATCHLIST_UPDATE_ERROR);
    }
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
                onClick={() => fetchFinance(selectedIndex, selectedWindow)}
                className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 text-xs font-semibold transition cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setErrorState(null)}
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
