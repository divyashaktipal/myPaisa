"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { TopMoversProps } from "@/types/TopMovers";
import type { MoverTab, MoverIndex } from "@/types/MarketSummaryAndMovers";
import {
  MARKET_SUMMARY_DEFAULTS,
  MARKET_SUMMARY_HEADERS,
  MOVER_INDICES,
  WATCHLIST_INTERACTION,
} from "@/constants/MarketSummaryAndMovers";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";

const TopMovers: React.FC<TopMoversProps> = ({
  indexName = MARKET_SUMMARY_DEFAULTS.defaultIndexName,
  watchlist = [],
  onToggleWatchlist,
  onSelectStock,
  className = "",
}) => {
  // Sync selected index with parent indexName if it switches between Nifty 50/100/200
  const initialIndex: MoverIndex =
    indexName === "NIFTY 100"
      ? "NIFTY 100"
      : indexName === "NIFTY 200"
      ? "NIFTY 200"
      : "NIFTY 50";

  const [selectedMoverIndex, setSelectedMoverIndex] = useState<MoverIndex>(initialIndex);
  const [moverTab, setMoverTab] = useState<MoverTab>("gainers");

  useEffect(() => {
    if (indexName === "NIFTY 100") setSelectedMoverIndex("NIFTY 100");
    else if (indexName === "NIFTY 200") setSelectedMoverIndex("NIFTY 200");
    else if (indexName === "NIFTY 50") setSelectedMoverIndex("NIFTY 50");
  }, [indexName]);

  // Compute top gainers / losers for the selected index
  const moversList = useMemo(() => {
    let pool = TOP_200_INDIAN_STOCKS.slice(0, 50);
    if (selectedMoverIndex === "NIFTY 100") {
      pool = TOP_200_INDIAN_STOCKS.slice(0, 100);
    } else if (selectedMoverIndex === "NIFTY 200") {
      pool = TOP_200_INDIAN_STOCKS.slice(0, 200);
    }

    if (moverTab === "gainers") {
      return [...pool]
        .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
        .slice(0, 5);
    } else {
      return [...pool]
        .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
        .slice(0, 5);
    }
  }, [selectedMoverIndex, moverTab]);

  return (
    <div
      className={`rounded-2xl bg-[#090f18] border border-[#172335] p-4 sm:p-5 shadow-lg ${className}`}
    >
      {/* Header: Title with Index Pills on Left & Gainers/Losers Toggle on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#141f2f]">
        {/* Left: Title & Index Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300 font-mono">
            {MARKET_SUMMARY_HEADERS.topMoversPrefix}{selectedMoverIndex}
          </h2>
          <div className="flex items-center gap-1 bg-[#060b12] p-0.5 rounded-lg border border-[#131c2a] ml-1">
            {MOVER_INDICES.map((idxName) => (
              <button
                key={idxName}
                type="button"
                onClick={() => setSelectedMoverIndex(idxName)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
                  selectedMoverIndex === idxName
                    ? "bg-[#182638] text-white shadow-sm border border-[#24354c]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {idxName.replace("NIFTY ", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Gainers / Losers Selector */}
        <div className="flex items-center bg-[#060b12] p-1 rounded-xl border border-[#131c2a] self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setMoverTab("gainers")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              moverTab === "gainers"
                ? "bg-[#182638] text-emerald-400 shadow-sm border border-[#23354b]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {MARKET_SUMMARY_HEADERS.gainers}
          </button>
          <button
            type="button"
            onClick={() => setMoverTab("losers")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              moverTab === "losers"
                ? "bg-[#182638] text-rose-400 shadow-sm border border-[#23354b]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {MARKET_SUMMARY_HEADERS.losers}
          </button>
        </div>
      </div>

      {/* Rows List */}
      <div className="divide-y divide-[#121c2c] mt-1">
        {moversList.map((stock) => {
          const isPositive = (stock.changePercent ?? 0) >= 0;
          const isWatchlisted = watchlist?.includes?.(stock.symbol);

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock?.(stock.symbol)}
              className="flex items-center justify-between py-3 px-1 sm:px-2 hover:bg-[#0e1624] rounded-xl transition group cursor-pointer"
            >
              {/* Left: Star + Ticker & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                {onToggleWatchlist && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist?.(stock.symbol);
                    }}
                    className={`text-sm transition cursor-pointer ${
                      isWatchlisted ? "text-amber-400" : "text-gray-600 hover:text-gray-400"
                    }`}
                    title={
                      isWatchlisted
                        ? WATCHLIST_INTERACTION.removeFromWatchlistTooltip
                        : WATCHLIST_INTERACTION.addToWatchlistTooltip
                    }
                  >
                    {isWatchlisted
                      ? WATCHLIST_INTERACTION.activeStar
                      : WATCHLIST_INTERACTION.inactiveStar}
                  </button>
                )}
                <span className="font-bold text-xs sm:text-sm text-white tracking-tight font-mono group-hover:text-emerald-400 transition">
                  {stock.symbol}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium truncate max-w-[120px] sm:max-w-[180px]">
                  {stock.name}
                </span>
              </div>

              {/* Right: Price & Change Percent */}
              <div className="flex items-center gap-4 text-right font-mono flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {stock.price.toLocaleString(MARKET_SUMMARY_DEFAULTS.locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`text-xs font-bold w-16 text-right ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.changePercent?.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopMovers;
