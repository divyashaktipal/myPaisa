"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type {
  SignalStock,
  SignalsApiResponse,
  SignalsSectionProps,
} from "@/types/Signals";
import {
  SIGNALS_PAGE_CONFIG,
  SIGNALS_FILTER_OPTIONS,
  INITIAL_ALL_SIGNALS,
  INITIAL_SIGNALS_SUMMARY,
} from "@/constants/Signals";

const SignalsSection: React.FC<SignalsSectionProps> = ({
  onSelectStock,
  className = "",
}) => {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "UP" | "DOWN">("ALL");

  // Fetch signals from API route with cache
  const { data: signalsResponse } = useQuery<SignalsApiResponse>({
    queryKey: ["market-signals"],
    queryFn: async () => {
      const res = await fetch("/api/market/signals");
      if (!res.ok) {
        throw new Error("Failed to load signals");
      }
      return res.json();
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    initialData: {
      success: true,
      summary: INITIAL_SIGNALS_SUMMARY,
      highlights: [],
      signals: INITIAL_ALL_SIGNALS,
    },
  });

  const allSignals = signalsResponse?.signals || INITIAL_ALL_SIGNALS;
  const totalCount = signalsResponse?.summary?.totalSignals || allSignals.length;

  // Filter items by direction (All, Up, Down)
  const filteredSignals = useMemo(() => {
    if (filter === "UP") {
      return allSignals.filter((s) => s.changePercent >= 0);
    }
    if (filter === "DOWN") {
      return allSignals.filter((s) => s.changePercent < 0);
    }
    return allSignals;
  }, [allSignals, filter]);

  // Preview top 5 items matching Screenshot 1
  const displayedItems = filteredSignals.slice(0, 5);

  const handleStockClick = (signal: SignalStock) => {
    onSelectStock?.(signal);
    const targetSlug = signal.slug || signal.symbol.toLowerCase();
    router.push(`/dashboard/chart/${encodeURIComponent(targetSlug)}`);
  };

  const handleShowAll = () => {
    router.push("/dashboard/signals");
  };

  return (
    <section
      className={`w-full bg-[#080d16] border border-[#152236] rounded-3xl p-4 sm:p-6 shadow-2xl transition-all ${className}`}
      aria-label="Market Signals Section"
    >
      {/* Header matching Screenshot 1 */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#121c2c]">
        <div className="flex items-baseline gap-2">
          <h2 className="text-white font-bold text-base sm:text-lg tracking-tight">
            {SIGNALS_PAGE_CONFIG.widgetTitle}
          </h2>
          <span className="text-gray-400 font-mono text-xs font-medium">
            {totalCount} {SIGNALS_PAGE_CONFIG.widgetCountSuffix}
          </span>
        </div>

        {/* Filter Pills: All | Up | Down */}
        <div className="flex items-center gap-1 bg-[#0c1420] p-1 rounded-xl border border-[#18263a]">
          {SIGNALS_FILTER_OPTIONS.widgetPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filter === pill.id
                  ? "bg-[#1d2b40] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Rows Feed */}
      <div className="divide-y divide-[#131d2c]/80 mt-1">
        {displayedItems.map((signal) => {
          const isLow = signal.type === "52_WEEK_LOW";
          const isPositive = signal.changePercent >= 0;

          return (
            <div
              key={signal.id}
              onClick={() => handleStockClick(signal)}
              className="flex items-center justify-between py-3.5 px-2 hover:bg-[#0d1624]/70 transition-all rounded-xl cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStockClick(signal);
                }
              }}
            >
              {/* Left Column: Indicator Dot + Symbol & Status + Comparison */}
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isLow
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                      : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  }`}
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-white font-bold text-xs sm:text-sm tracking-tight group-hover:text-emerald-400 transition font-mono">
                      {signal.symbol}
                    </span>
                    <span className="text-gray-300 text-xs font-medium">
                      {signal.statusText}
                    </span>
                  </div>
                  <p className="text-gray-500 font-mono text-[11px] sm:text-xs mt-0.5 truncate">
                    {signal.comparisonText}
                  </p>
                </div>
              </div>

              {/* Right Column: Percentage Change */}
              <div className="shrink-0 text-right">
                <span
                  className={`text-xs sm:text-sm font-mono font-semibold ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {signal.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link matching Screenshot 1 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleShowAll}
          className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 py-1.5 flex items-center gap-1 transition cursor-pointer hover:underline"
        >
          {SIGNALS_PAGE_CONFIG.showAllText}
        </button>
      </div>
    </section>
  );
};

export default SignalsSection;
