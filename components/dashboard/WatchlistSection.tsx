"use client";

import React from "react";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import type { StockItem } from "@/types/top200Stocks";
import type { WatchlistSectionProps } from "@/types/WatchlistSection";
import { WATCHLIST_SECTION_CONFIG } from "@/constants/WatchlistSection";

const WatchlistSection = ({
  watchlist = [],
  onToggleWatchlist,
  onOpenSearch,
}: WatchlistSectionProps) => {
  const watchlistedStocks: StockItem[] =
    watchlist
      ?.map?.((sym) => {
        const match = TOP_200_INDIAN_STOCKS?.find?.((s) => s?.symbol?.toUpperCase() === sym?.toUpperCase());
        if (match) return match;
        return {
          symbol: sym,
          name: sym,
          price: WATCHLIST_SECTION_CONFIG.fallbackStockValues.price,
          change: WATCHLIST_SECTION_CONFIG.fallbackStockValues.change,
          changePercent: WATCHLIST_SECTION_CONFIG.fallbackStockValues.changePercent,
        };
      })
      ?.filter(Boolean) ?? [];

  return (
    <div className="rounded-2xl bg-[#0e1622] border border-[#1b2637] p-6 text-white shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#1b2535]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">{WATCHLIST_SECTION_CONFIG.starIcon}</span>{" "}
            {WATCHLIST_SECTION_CONFIG.title}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {WATCHLIST_SECTION_CONFIG.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>{WATCHLIST_SECTION_CONFIG.addStockButtonText}</span>
        </button>
      </div>

      {(watchlistedStocks?.length ?? 0) === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">{WATCHLIST_SECTION_CONFIG.emptyTitle}</p>
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-3 px-4 py-2 rounded-xl bg-[#172233] hover:bg-[#202f45] text-emerald-400 font-medium text-xs transition cursor-pointer"
          >
            {WATCHLIST_SECTION_CONFIG.emptyButtonText}
          </button>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#172233]">
          {watchlistedStocks?.map?.((stock) => {
            const isPositive = (stock?.changePercent ?? 0) >= 0;
            return (
              <div
                key={stock?.symbol}
                className="py-3 flex items-center justify-between hover:bg-[#121a28] px-3 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleWatchlist?.(stock?.symbol)}
                    className="text-amber-400 hover:text-gray-500 transition text-sm cursor-pointer"
                    title={WATCHLIST_SECTION_CONFIG.removeTooltip}
                  >
                    {WATCHLIST_SECTION_CONFIG.starIcon}
                  </button>
                  <div>
                    <h3 className="font-bold text-sm text-white">{stock?.symbol}</h3>
                    <p className="text-xs text-gray-400">{stock?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right font-mono">
                  <span className="text-sm font-semibold text-white">
                    {WATCHLIST_SECTION_CONFIG.currencySymbol}
                    {stock?.price?.toLocaleString?.(WATCHLIST_SECTION_CONFIG.locale, { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {stock?.changePercent?.toFixed?.(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistSection;
