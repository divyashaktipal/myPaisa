"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { financeQueryOptions } from "@/queries/finance";
import {
  StatusBanner,
  CandlestickChart,
  CompanyDetailsCard,
  StockNewsSection,
  useDashboard,
  InvestmentQuotesLoading,
} from "@/components/dashboard";
import type { FinanceApiResponse, DashboardErrorState } from "@/types/DashboardPage";
import type { ChartStat } from "@/types/IndexChartCard";
import {
  DEFAULT_CHART_STOCK_SYMBOL,
  DASHBOARD_API_ROUTES,
  STATUS_BANNER_LABELS,
  DASHBOARD_ERROR_MESSAGES,
  DASHBOARD_FALLBACK_ERROR,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

interface ChartContentProps {
  symbolProp?: string;
}

const ChartContent = ({ symbolProp }: ChartContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { watchlist, toggleWatchlist, openSearch } = useDashboard();

  // If symbolProp or URL has ?symbol=XYZ or ?stock=slug use it; otherwise default to HDFC stock (HDFCBANK)
  const querySymbol = symbolProp || searchParams.get("symbol") || searchParams.get("stock");
  const initialStock = querySymbol?.trim() ? querySymbol.trim().toUpperCase() : DEFAULT_CHART_STOCK_SYMBOL;

  const [selectedStock, setSelectedStock] = useState<string>(initialStock);
  const [selectedWindow, setSelectedWindow] = useState<string>("1D");
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // Sync if query param or symbolProp changes
  useEffect(() => {
    const effectiveSymbol = symbolProp || searchParams.get("symbol") || searchParams.get("stock");
    if (effectiveSymbol?.trim()) {
      setSelectedStock(effectiveSymbol.trim().toUpperCase());
    }
  }, [symbolProp, searchParams]);

  const currentErrorKey = `${selectedStock}-${selectedWindow}`;

  // TanStack React Query: Dynamic caching with keepPreviousData via centralized query options
  const {
    data: financeData,
    isLoading: isFinanceLoading,
    isFetching: isFinanceFetching,
    error: financeQueryError,
    refetch: refetchFinance,
  } = useQuery<FinanceApiResponse, DashboardErrorState>(
    financeQueryOptions(selectedStock, selectedWindow)
  );

  // Retain company details across window changes so the right panel never disappears
  const lastKnownAboutRef = React.useRef<{
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

  const cachedAbout = lastKnownAboutRef.current[(financeData?.symbol || selectedStock).toUpperCase()];
  const isInitialLoading = isFinanceLoading && !financeData;
  const isUpdatingData = isFinanceLoading || isFinanceFetching;
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

      {/* Top Navigation & Global Search Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push("/dashboard/live")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121c2c] hover:bg-[#1a283e] text-emerald-400 hover:text-emerald-300 border border-[#1e2f48] text-xs font-semibold transition cursor-pointer"
        >
          <span>← Back</span>
        </button>
      </div>

      {/* Stock Chart (Left) + Company Basic Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Candlestick Stock Chart */}
        <div className="lg:col-span-8">
          <CandlestickChart
            symbol={financeData?.symbol || selectedStock}
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
            onBackToIndices={() => router.push("/dashboard/live")}
          />
        </div>

        {/* Right Column: Company Basic Details from SerpApi Knowledge Graph */}
        <div className="lg:col-span-4">
          <CompanyDetailsCard
            symbol={financeData?.symbol || selectedStock}
            title={financeData?.title || financeData?.aboutDetails?.title || cachedAbout?.title}
            exchange={financeData?.exchange || cachedAbout?.exchange}
            price={financeData?.price ?? null}
            changePercent={financeData?.changePercent ?? null}
            aboutSnippet={financeData?.aboutDetails?.snippet || financeData?.about || cachedAbout?.aboutSnippet}
            aboutLink={financeData?.aboutDetails?.link || cachedAbout?.aboutLink}
            aboutInfo={financeData?.aboutDetails?.info || cachedAbout?.aboutInfo}
            stats={financeData?.aboutDetails?.stats || financeData?.stats || cachedAbout?.stats}
            isInWatchlist={watchlist.includes(financeData?.symbol || selectedStock)}
            onToggleWatchlist={toggleWatchlist}
            loading={isInitialLoading}
          />
        </div>
      </div>

      {/* Real Company News Terminal with Trending, Sector Moves, and Summaries */}
      {(financeData || cachedAbout) && (
        <StockNewsSection
          symbol={financeData?.symbol || selectedStock}
          title={financeData?.title || financeData?.aboutDetails?.title || cachedAbout?.title}
          news={financeData?.news}
          related={financeData?.related}
        />
      )}
    </div>
  );
};

export const ChartTerminal = ({ initialSymbol }: { initialSymbol?: string }) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <InvestmentQuotesLoading />
        </div>
      }
    >
      <ChartContent symbolProp={initialSymbol} />
    </Suspense>
  );
};

export default ChartTerminal;
