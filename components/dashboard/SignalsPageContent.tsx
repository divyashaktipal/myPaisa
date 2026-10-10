"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type {
  SignalStock,
  SignalsApiResponse,
  SignalDirectionFilter,
  SignalCategoryFilter,
} from "@/types/Signals";
import {
  SIGNALS_PAGE_CONFIG,
  SIGNALS_FILTER_OPTIONS,
  INITIAL_ALL_SIGNALS,
  INITIAL_TOP_HIGHLIGHTS,
  INITIAL_SIGNALS_SUMMARY,
} from "@/constants/Signals";

const formatIndianCurrency = (val: number): string => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

const SignalsPageContent: React.FC = () => {
  const router = useRouter();
  const [directionFilter, setDirectionFilter] = useState<SignalDirectionFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<SignalCategoryFilter>("ALL");

  // TanStack React Query for signals
  const { data: signalsResponse } = useQuery<SignalsApiResponse>({
    queryKey: ["market-signals-page"],
    queryFn: async () => {
      const res = await fetch("/api/market/signals");
      if (!res.ok) {
        throw new Error("Failed to load signals data");
      }
      return res.json();
    },
    staleTime: 60000,
    initialData: {
      success: true,
      summary: INITIAL_SIGNALS_SUMMARY,
      highlights: INITIAL_TOP_HIGHLIGHTS,
      signals: INITIAL_ALL_SIGNALS,
    },
  });

  const summary = signalsResponse?.summary || INITIAL_SIGNALS_SUMMARY;
  const highlights = signalsResponse?.highlights || INITIAL_TOP_HIGHLIGHTS;
  const allSignals = signalsResponse?.signals || INITIAL_ALL_SIGNALS;

  // Filter signals list according to active direction and category
  const filteredSignals = useMemo(() => {
    return allSignals.filter((item) => {
      // Direction match
      if (directionFilter === "UP" && item.changePercent < 0) return false;
      if (directionFilter === "DOWN" && item.changePercent >= 0) return false;

      // Category match
      if (categoryFilter === "52_WEEK") {
        if (item.type !== "52_WEEK_LOW" && item.type !== "52_WEEK_HIGH") return false;
      } else if (categoryFilter === "BREAKOUT_20D") {
        if (item.type !== "BREAKOUT_20D") return false;
      }

      return true;
    });
  }, [allSignals, directionFilter, categoryFilter]);

  const handleStockClick = (stock: SignalStock) => {
    const slug = stock.slug || stock.symbol.toLowerCase();
    router.push(`/dashboard/chart/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard/live")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1624] hover:bg-[#142032] text-emerald-400 hover:text-emerald-300 border border-[#1b293e] text-xs font-semibold transition cursor-pointer"
        >
          <span>{SIGNALS_PAGE_CONFIG.backToLiveText}</span>
        </button>

        <span className="text-xs text-gray-500 font-mono hidden sm:inline">
          {summary.asOf}
        </span>
      </div>

      {/* Hero Header Section matching Screenshot 2 */}
      <div className="space-y-4">
        <div className="text-xs font-mono text-gray-500 tracking-wider">
          {summary.totalSignals} signals • {summary.asOf}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          {SIGNALS_PAGE_CONFIG.heading} <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
            {SIGNALS_PAGE_CONFIG.headingAccent}
          </span>
        </h1>
      </div>

      {/* KPI Cards (3 Grid Box) matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: signals */}
        <div className="bg-[#090f18] border border-[#152338] rounded-2xl p-5 shadow-lg">
          <div className="text-3xl font-bold font-mono text-white">
            {summary.totalSignals}
          </div>
          <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mt-1">
            signals
          </div>
        </div>

        {/* Card 2: stocks */}
        <div className="bg-[#090f18] border border-[#152338] rounded-2xl p-5 shadow-lg">
          <div className="text-3xl font-bold font-mono text-white">
            {summary.totalStocks}
          </div>
          <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mt-1">
            stocks
          </div>
        </div>

        {/* Card 3: up / down */}
        <div className="bg-[#090f18] border border-[#152338] rounded-2xl p-5 shadow-lg">
          <div className="text-3xl font-bold font-mono text-white">
            {summary.upCount}/{summary.downCount}
          </div>
          <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mt-1">
            up / down
          </div>
        </div>
      </div>

      {/* Filter Selector Bar matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Direction Filter */}
        <div className="flex items-center gap-1.5 bg-[#090f18] p-1.5 rounded-2xl border border-[#162338] overflow-x-auto">
          {SIGNALS_FILTER_OPTIONS.direction.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDirectionFilter(item.id as SignalDirectionFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                directionFilter === item.id
                  ? "bg-[#1d2b40] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-[#090f18] p-1.5 rounded-2xl border border-[#162338] overflow-x-auto">
          {SIGNALS_FILTER_OPTIONS.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id as SignalCategoryFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-[#1d2b40] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Featured Highlight Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {highlights.map((stock) => {
          const isPositive = stock.changePercent >= 0;

          return (
            <div
              key={stock.id}
              onClick={() => handleStockClick(stock)}
              className="bg-[#0b1019] border border-rose-950/70 hover:border-rose-700/80 rounded-2xl p-5 transition-all shadow-xl group cursor-pointer flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStockClick(stock);
                }
              }}
            >
              <div>
                {/* Sector / Rank tag */}
                <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                  #{stock.rank} · {stock.sector}
                </div>

                {/* Stock Symbol + Percent Change */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition font-mono">
                    {stock.symbol}
                  </h3>
                  <span
                    className={`text-base font-mono font-bold ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Status and Comparison notes */}
                <div className="mt-2 text-xs font-semibold text-rose-300/90">
                  {stock.statusText}
                </div>
                <div className="text-xs font-mono text-gray-400 mt-0.5">
                  {stock.comparisonText}
                </div>
              </div>

              {/* News Catalyst Snippet if available */}
              {stock.newsHeadline && (
                <div className="mt-4 pt-3 border-t border-[#18263a] text-xs text-gray-400 line-clamp-2">
                  <span className="text-gray-300">📰 </span>
                  {stock.newsHeadline}
                  <span className="text-gray-500 block text-[10px] mt-0.5 font-mono">
                    {stock.newsSource} • {stock.newsTime}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ALL SIGNALS Section matching Screenshot 2 */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            {SIGNALS_PAGE_CONFIG.allSignalsSectionTitle}
          </span>
          <span className="text-xs font-mono text-gray-500">
            ({filteredSignals.length})
          </span>
        </div>

        {/* Signals List Feed with Colored Left Vertical Accent Line */}
        <div className="space-y-2.5">
          {filteredSignals.map((item) => {
            const isPositive = item.changePercent >= 0;

            return (
              <div
                key={item.id}
                onClick={() => handleStockClick(item)}
                className="bg-[#090f18] border border-[#141f30] hover:border-[#22354f] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition group relative overflow-hidden"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStockClick(item);
                  }
                }}
              >
                {/* Left Colored Vertical Indicator Accent Line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isPositive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  aria-hidden="true"
                />

                {/* Left Content: Symbol, Status, Comparison & News */}
                <div className="pl-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base group-hover:text-emerald-400 transition font-mono">
                      {item.symbol}
                    </span>
                    <span className="text-gray-300 text-xs font-medium">
                      {item.statusText}
                    </span>
                  </div>

                  <p className="text-gray-400 font-mono text-xs mt-0.5 truncate">
                    {item.comparisonText}
                  </p>

                  {/* Context News Snippet */}
                  {item.newsHeadline && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5 line-clamp-1">
                      <span className="text-gray-500 shrink-0">📰</span>
                      <span className="truncate">{item.newsHeadline}</span>
                    </div>
                  )}
                </div>

                {/* Right Content: Price & Change Pill */}
                <div className="pl-2 sm:pl-0 flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="font-mono text-sm sm:text-base font-bold text-white">
                    ₹{formatIndianCurrency(item.price)}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                      isPositive
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SignalsPageContent;
