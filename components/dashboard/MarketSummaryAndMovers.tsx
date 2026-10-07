"use client";

import React, { useState, useMemo, useEffect } from "react";
import type {
  MarketSummaryAndMoversProps,
  MoverTab,
  MoverIndex,
} from "@/types/MarketSummaryAndMovers";
import {
  MARKET_SUMMARY_DEFAULTS,
  MARKET_SUMMARY_HEADERS,
  MOVER_INDICES,
  WATCHLIST_INTERACTION,
} from "@/constants/MarketSummaryAndMovers";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";

const MarketSummaryAndMovers = ({
  indexName = MARKET_SUMMARY_DEFAULTS.defaultIndexName,
  about,
  news = [],
  watchlist = [],
  onToggleWatchlist,
  onSelectStock,
}: MarketSummaryAndMoversProps) => {
  const hasNews = (news?.length ?? 0) > 0;
  const hasAbout = Boolean(about);

  // Sync selected index with parent if parent switches Nifty 50/100/200
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
      {/* Left Column: Real Market News & Business Profile from SerpApi */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-4 pt-1">
        {hasAbout && (
          <div className="p-4 rounded-2xl bg-[#0b121c] border border-[#1a2535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 font-mono">
              {MARKET_SUMMARY_HEADERS.aboutPrefix}{indexName}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-4">
              {about}
            </p>
          </div>
        )}

        {hasNews && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              {MARKET_SUMMARY_HEADERS.liveNewsFeedPrefix}{indexName}
            </h3>
            {news?.map?.((item, idx) => (
              <a
                key={idx}
                href={item?.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="block p-3.5 rounded-2xl bg-[#0b121c] hover:bg-[#111b29] border border-[#1a2535] transition group"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1 font-mono">
                  <span className="font-semibold text-emerald-400">
                    {item?.source || MARKET_SUMMARY_DEFAULTS.defaultSourceName}
                  </span>
                  {item?.date && <span>{item?.date}</span>}
                </div>
                <p className="text-xs sm:text-sm font-medium text-white group-hover:text-emerald-300 transition leading-snug">
                  {item?.snippet || item?.title}
                </p>
              </a>
            ))}
          </div>
        )}

        {!hasAbout && !hasNews && (
          <div className="p-5 rounded-2xl bg-[#0b121c] border border-[#1a2535] text-xs text-gray-400 font-mono">
            <span>Market feed active · tracking {indexName}</span>
          </div>
        )}
      </div>

      {/* Right Column: TOP MOVERS for NIFTY 50, 100 & 200 */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl bg-[#0b121c] border border-[#1a2535] p-5 sm:p-6 shadow-xl">
          {/* Header: Title with Index Pills on Left & Gainers/Losers Toggle on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#182333]">
            {/* Left: Title & Index Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300 font-mono">
                {MARKET_SUMMARY_HEADERS.topMoversPrefix}{selectedMoverIndex}
              </h2>
              <div className="flex items-center gap-1 bg-[#070d14] p-0.5 rounded-lg border border-[#15202e] ml-1">
                {MOVER_INDICES.map((idxName) => (
                  <button
                    key={idxName}
                    type="button"
                    onClick={() => setSelectedMoverIndex(idxName)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
                      selectedMoverIndex === idxName
                        ? "bg-[#182638] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {idxName.replace("NIFTY ", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Gainers / Losers Selector */}
            <div className="flex items-center bg-[#070d14] p-1 rounded-xl border border-[#15202e] self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setMoverTab("gainers")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  moverTab === "gainers"
                    ? "bg-[#1a2638] text-white shadow-sm"
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
                    ? "bg-[#1a2638] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {MARKET_SUMMARY_HEADERS.losers}
              </button>
            </div>
          </div>

          {/* Rows List */}
          <div className="divide-y divide-[#141e2b]">
            {moversList.map((stock) => {
              const isPositive = (stock.changePercent ?? 0) >= 0;
              const isWatchlisted = watchlist?.includes?.(stock.symbol);

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock?.(stock.symbol)}
                  className="flex items-center justify-between py-3.5 px-1 sm:px-2 hover:bg-[#111a28] rounded-xl transition group cursor-pointer"
                >
                  {/* Left: Ticker & Name */}
                  <div className="flex items-center gap-3 min-w-0">
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
                    <span className="font-bold text-sm sm:text-base text-white tracking-tight font-mono group-hover:text-emerald-400 transition">
                      {stock.symbol}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400 font-medium truncate max-w-[140px] sm:max-w-[220px]">
                      {stock.name}
                    </span>
                  </div>

                  {/* Right: Price & Change Percent */}
                  <div className="flex items-center gap-5 sm:gap-6 text-right font-mono flex-shrink-0">
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {stock.price.toLocaleString(MARKET_SUMMARY_DEFAULTS.locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold w-16 text-right ${
                        isPositive ? "text-[#10b981]" : "text-[#f43f5e]"
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
      </div>
    </div>
  );
};

export default MarketSummaryAndMovers;
