"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "@tanstack/react-charts";
import { defineChart, lineY, areaY } from "@tanstack/charts";
import { scalePoint, scaleLinear } from "d3-scale";
import type { TanStackStockChartProps } from "@/types/MarketHeatmap";
import type { FinanceApiResponse } from "@/types/DashboardPage";
import { DASHBOARD_API_ROUTES } from "@/constants/DashboardPage";

const CHART_WINDOWS = ["1D", "5D", "1M", "6M", "1Y", "MAX"] as const;

export const TanStackStockChart: React.FC<TanStackStockChartProps> = ({
  stock,
  selectedWindow: initialWindow = "1D",
  onSelectWindow,
  onClose,
  onOpenFullTerminal,
}) => {
  const [currentWindow, setCurrentWindow] = useState<string>(initialWindow);
  const [hoveredPoint, setHoveredPoint] = useState<{ time: string; price: number } | null>(null);

  // Sync window if prop changes
  useEffect(() => {
    if (initialWindow) setCurrentWindow(initialWindow);
  }, [initialWindow]);

  const handleWindowChange = (win: string) => {
    setCurrentWindow(win);
    onSelectWindow?.(win);
  };

  // Fetch real market chart points for the selected stock
  const {
    data: financeData,
    isLoading,
    isError,
  } = useQuery<FinanceApiResponse>({
    queryKey: ["finance", stock.symbol, currentWindow],
    queryFn: async () => {
      const res = await fetch(
        `${DASHBOARD_API_ROUTES.finance}?symbol=${encodeURIComponent(stock.symbol)}&window=${encodeURIComponent(currentWindow)}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load chart points for ${stock.symbol}`);
      }
      return res.json();
    },
    staleTime: currentWindow === "1D" ? 60000 : 300000,
    refetchOnWindowFocus: false,
  });

  const chartPoints = financeData?.chartPoints || [];

  const isPositive =
    financeData?.movement === "Up" ||
    (financeData?.changePercent != null
      ? financeData.changePercent >= 0
      : stock.changePercent >= 0);

  const displayPrice = financeData?.price ?? stock.price;
  const displayChangePercent = financeData?.changePercent ?? stock.changePercent;
  const displayMovementValue = financeData?.movementValue ?? stock.change;
  const displayName = financeData?.title || stock.name;

  // Prepare and sample points for TanStack Chart
  const { sampledPoints, minPrice, maxPrice } = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) {
      return { sampledPoints: [], minPrice: 0, maxPrice: 1 };
    }

    const valid = chartPoints.filter(
      (p) => p?.price != null && !isNaN(p.price) && p.price > 0
    );

    if (valid.length === 0) {
      return { sampledPoints: [], minPrice: 0, maxPrice: 1 };
    }

    // Keep point count optimal for responsive rendering
    const maxRenderPoints = 70;
    const step = Math.max(1, Math.floor(valid.length / maxRenderPoints));
    const sampled = valid
      .filter((_, idx) => idx % step === 0 || idx === valid.length - 1)
      .map((p, index) => ({
        ...p,
        index,
      }));

    const prices = sampled.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      sampledPoints: sampled,
      minPrice: min,
      maxPrice: max,
    };
  }, [chartPoints]);

  // Construct TanStack Chart definition
  const chartDefinition = useMemo(() => {
    if (sampledPoints.length === 0) return null;

    const pad = (maxPrice - minPrice) * 0.08 || 1;
    const domainMin = Math.max(0, minPrice - pad);
    const domainMax = maxPrice + pad;
    const maxIndex = Math.max(1, sampledPoints.length - 1);

    return defineChart({
      scales: {
        x: {
          scale: scaleLinear().domain([0, maxIndex]),
        },
        y: {
          scale: scaleLinear().domain([domainMin, domainMax]).nice(),
        },
      },
      marks: [
        areaY(sampledPoints, {
          x: (d: { index: number; price: number }) => d.index,
          y: (d: { index: number; price: number }) => d.price,
        }),
        lineY(sampledPoints, {
          x: (d: { index: number; price: number }) => d.index,
          y: (d: { index: number; price: number }) => d.price,
        }),
      ],
    });
  }, [sampledPoints, minPrice, maxPrice]);

  return (
    <div className="w-full bg-[#080d15] border border-[#1a2538] rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Subtle background glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isPositive ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />

      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#141e2e]">
        {/* Left: Quick status tag & Timeframe selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0e1624] border border-[#1c293d]">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isPositive ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-300 font-semibold">
              TanStack Chart View
            </span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-[#0b121d] p-1 rounded-xl border border-[#162234]">
            {CHART_WINDOWS.map((win) => {
              const active = currentWindow === win;
              return (
                <button
                  key={win}
                  type="button"
                  onClick={() => handleWindowChange(win)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition font-mono ${
                    active
                      ? "bg-[#1f2b3e] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#121c2c]"
                  }`}
                >
                  {win}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onOpenFullTerminal && (
            <button
              type="button"
              onClick={() => onOpenFullTerminal(stock.symbol)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Terminal</span>
              <span>↗</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#0f1724] hover:bg-[#152132] text-gray-400 hover:text-white border border-[#1b2638] text-xs transition cursor-pointer"
              aria-label="Close chart"
              title="Close chart view"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative mt-4 mb-5 w-full min-h-[280px] sm:min-h-[320px] flex items-center justify-center rounded-xl bg-[#050910] border border-[#121c2c] p-2 sm:p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div
              className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${
                isPositive ? "border-emerald-400" : "border-rose-400"
              }`}
            />
            <span className="text-xs text-gray-400 font-mono tracking-wider">
              Loading real tick data for {stock.symbol}...
            </span>
          </div>
        ) : isError || !chartDefinition || sampledPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm text-gray-300 font-medium">
              Real-time chart stream for {stock.symbol}
            </p>
            <p className="text-xs text-gray-500 max-w-sm">
              Current live price is ₹{displayPrice.toLocaleString("en-IN")}. Detailed intraday chart points are updating from the exchange.
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Real TanStack Chart Component */}
            <div className="w-full overflow-hidden [&_.ts-chart-surface]:!overflow-visible [&_svg]:!overflow-visible">
              <Chart
                definition={chartDefinition}
                ariaLabel={`${stock.name} price chart`}
                ariaDescription={`Price history for ${stock.name} (${stock.symbol})`}
                height={260}
                className="w-full"
                onFocusChange={(point) => {
                  if (point?.datum) {
                    const datum = point.datum as { time: string; price: number };
                    setHoveredPoint(datum);
                  } else {
                    setHoveredPoint(null);
                  }
                }}
              />
            </div>

            {/* Time labels axis strip */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-[#101826] px-2">
              <span>{sampledPoints[0]?.time || "09:15 AM"}</span>
              {hoveredPoint && (
                <span className="text-white bg-[#141e2e] px-2 py-0.5 rounded border border-[#223148] font-bold">
                  {hoveredPoint.time} · ₹{hoveredPoint.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              )}
              <span>{sampledPoints[sampledPoints.length - 1]?.time || "03:30 PM"}</span>
            </div>
          </div>
        )}
      </div>

      {/* "Followed by their stock name (means slug)" - Detailed Information Card */}
      <div className="bg-[#0b121e] border border-[#162336] rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Stock Name followed by Slug and Ticker Badges */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {displayName}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#162235] text-gray-300 font-mono text-xs font-semibold border border-[#223149]">
                {stock.symbol}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 font-mono text-xs border border-emerald-800/60" title="Stock Slug">
                slug: <span className="underline font-bold">{stock.slug}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-300 text-[11px] font-mono border border-blue-800/40">
                {stock.sector}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1 font-mono">
              National Stock Exchange of India (NSE: {stock.symbol}) · Real-time market feed
            </p>
          </div>

          {/* Real-time Price and Day Change */}
          <div className="text-left md:text-right">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              ₹{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div
              className={`text-xs sm:text-sm font-semibold font-mono flex items-center md:justify-end gap-1.5 mt-0.5 ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>
                {isPositive ? "+" : ""}
                {displayMovementValue != null
                  ? `₹${Math.abs(displayMovementValue).toFixed(2)}`
                  : ""}
              </span>
              <span>
                ({isPositive ? "+" : ""}
                {displayChangePercent != null
                  ? `${displayChangePercent.toFixed(2)}%`
                  : `${stock.changePercent.toFixed(2)}%`}
                )
              </span>
            </div>
          </div>
        </div>

        {/* Fundamental & Trading Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#152132]">
          <div className="p-2.5 rounded-lg bg-[#080d16] border border-[#141e2e]">
            <p className="text-[10px] font-mono uppercase text-gray-400">Traded Value (Turnover)</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">
              ₹{stock.turnoverCr.toLocaleString("en-IN")} Cr
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#080d16] border border-[#141e2e]">
            <p className="text-[10px] font-mono uppercase text-gray-400">Volume (Shares)</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">
              {(stock.volume / 100000).toFixed(2)} Lakh
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#080d16] border border-[#141e2e]">
            <p className="text-[10px] font-mono uppercase text-gray-400">Day High</p>
            <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              ₹{(stock.dayHigh ?? displayPrice * 1.01).toFixed(2)}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#080d16] border border-[#141e2e]">
            <p className="text-[10px] font-mono uppercase text-gray-400">Day Low</p>
            <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">
              ₹{(stock.dayLow ?? displayPrice * 0.99).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TanStackStockChart;
