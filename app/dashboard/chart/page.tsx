"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  StatusBanner,
  CandlestickChart,
  CompanyDetailsCard,
  StockNewsSection,
  useDashboard,
  InvestmentQuotesLoading,
} from "@/components/dashboard";
import type { FinanceApiResponse, DashboardErrorState } from "@/types/DashboardPage";
import {
  DEFAULT_CHART_STOCK_SYMBOL,
  DASHBOARD_API_ROUTES,
  STATUS_BANNER_LABELS,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_FALLBACK_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

export const dynamic = "force-dynamic";

const ChartContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { watchlist, toggleWatchlist } = useDashboard();

  // If URL has ?symbol=XYZ use it; otherwise default to HDFC stock (HDFCBANK)
  const querySymbol = searchParams.get("symbol");
  const initialStock = querySymbol?.trim() ? querySymbol.trim().toUpperCase() : DEFAULT_CHART_STOCK_SYMBOL;

  const [selectedStock, setSelectedStock] = useState<string>(initialStock);
  const [selectedWindow, setSelectedWindow] = useState<string>("1D");
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // Sync if query param changes
  useEffect(() => {
    if (querySymbol?.trim()) {
      setSelectedStock(querySymbol.trim().toUpperCase());
    }
  }, [querySymbol]);

  const currentErrorKey = `${selectedStock}-${selectedWindow}`;

  // TanStack React Query: Dynamic caching for Stock Candlestick Chart & Fundamentals
  const {
    data: financeData,
    isLoading: isFinanceLoading,
    error: financeQueryError,
    refetch: refetchFinance,
  } = useQuery<FinanceApiResponse, DashboardErrorState>({
    queryKey: ["finance", selectedStock, selectedWindow],
    queryFn: async () => {
      const res = await fetch(
        `${DASHBOARD_API_ROUTES.finance}?symbol=${encodeURIComponent(selectedStock)}&window=${encodeURIComponent(selectedWindow)}`
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

  const handleSelectAnotherStock = (sym: string) => {
    setSelectedStock(sym);
    router.push(`/dashboard/chart?symbol=${encodeURIComponent(sym)}`);
  };

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
          statusText={`${STATUS_BANNER_LABELS.liveFeedPrefix}${financeData?.title || selectedStock}`}
          timestamp={`${STATUS_BANNER_LABELS.dataAsOfPrefix}${financeData?.date}`}
        />
      )}

      {/* Stock Candlestick Chart (Left) + Company Basic Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Candlestick Chart with Minimal Filters */}
        <div className="lg:col-span-8">
          <CandlestickChart
            symbol={financeData?.symbol || selectedStock}
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
            onBackToIndices={() => router.push("/dashboard/live")}
          />
        </div>

        {/* Right Column: Company Basic Details from SerpApi Knowledge Graph */}
        <div className="lg:col-span-4">
          <CompanyDetailsCard
            symbol={financeData?.symbol || selectedStock}
            title={financeData?.title || financeData?.aboutDetails?.title}
            exchange={financeData?.exchange}
            price={financeData?.price ?? null}
            changePercent={financeData?.changePercent ?? null}
            aboutSnippet={financeData?.aboutDetails?.snippet || financeData?.about}
            aboutLink={financeData?.aboutDetails?.link}
            aboutInfo={financeData?.aboutDetails?.info}
            stats={financeData?.aboutDetails?.stats || financeData?.stats}
            isInWatchlist={watchlist.includes(financeData?.symbol || selectedStock)}
            onToggleWatchlist={toggleWatchlist}
            loading={loading}
          />
        </div>
      </div>

      {/* Real Company News Terminal with Trending, Sector Moves, and Summaries */}
      {financeData && (
        <StockNewsSection
          symbol={financeData?.symbol || selectedStock}
          title={financeData?.title || financeData?.aboutDetails?.title}
          news={financeData?.news}
          related={financeData?.related}
        />
      )}
    </div>
  );
};

const ChartPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <InvestmentQuotesLoading />
        </div>
      }
    >
      <ChartContent />
    </Suspense>
  );
};

export default ChartPage;
