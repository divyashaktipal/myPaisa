"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { StockNewsSectionProps, StockNewsTab } from "@/types/StockNewsSection";
import type { SerpApiNewsItem } from "@/types/serpapi";
import {
  STOCK_NEWS_TABS,
  STOCK_NEWS_LABELS,
} from "@/constants/StockNewsSection";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";

const StockNewsSection = ({
  symbol,
  news = [],
}: StockNewsSectionProps) => {
  const [activeTab, setActiveTab] = useState<StockNewsTab>("trending");
  const hasNews = news.length > 0;
  const displaySymbol = symbol?.toUpperCase() || "STOCK";

  // Dynamically derive sector moves from TOP_200_INDIAN_STOCKS without hardcoded data
  const sectorMoves = useMemo(() => {
    const sectorMap: Record<
      string,
      {
        id: string;
        name: string;
        totalChange: number;
        upCount: number;
        downCount: number;
        totalCount: number;
        bestStock: string;
        bestStockChange: number;
      }
    > = {};

    TOP_200_INDIAN_STOCKS.forEach((stk) => {
      const sector = stk.sector || "Other";
      const id = sector.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!sectorMap[sector]) {
        sectorMap[sector] = {
          id,
          name: sector,
          totalChange: 0,
          upCount: 0,
          downCount: 0,
          totalCount: 0,
          bestStock: stk.symbol,
          bestStockChange: stk.changePercent ?? 0,
        };
      }
      const s = sectorMap[sector];
      const chg = stk.changePercent ?? 0;
      s.totalChange += chg;
      s.totalCount += 1;
      if (chg >= 0) s.upCount += 1;
      else s.downCount += 1;
      if (chg > s.bestStockChange) {
        s.bestStock = stk.symbol;
        s.bestStockChange = chg;
      }
    });

    return Object.values(sectorMap)
      .map((sec) => ({
        id: sec.id,
        name: sec.name,
        changePercent: Number((sec.totalChange / Math.max(1, sec.totalCount)).toFixed(2)),
        upCount: sec.upCount,
        downCount: sec.downCount,
        totalCount: sec.totalCount,
        bestStock: sec.bestStock,
      }))
      .sort((a, b) => b.changePercent - a.changePercent);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#0b121c] border border-[#1a2535] p-5 sm:p-6 shadow-xl text-white">
      {/* Top Header Tabs */}
      <div className="flex items-center gap-6 border-b border-[#1b2738] overflow-x-auto scrollbar-none">
        {STOCK_NEWS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as StockNewsTab)}
              className={`pb-3 text-sm font-semibold transition cursor-pointer relative whitespace-nowrap ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Trending News Feed */}
      {activeTab === "trending" && (
        <>
          {/* Subtitle */}
          <p className="mt-4 text-xs sm:text-[13px] text-gray-400 font-normal">
            {STOCK_NEWS_LABELS.subtitleTemplate(displaySymbol)}
          </p>

          <div className="mt-5 divide-y divide-[#152132]">
            {hasNews ? (
              news.map((item, idx) => {
                const headline = item.title || item.snippet || "Financial news update";
                const summary = item.snippet && item.snippet !== item.title ? item.snippet : (item.snippet || "");

                return (
                  <div
                    key={idx}
                    className="py-4 first:pt-2 last:pb-2 flex items-start gap-3.5 sm:gap-4 group"
                  >
                    {/* Left: Crisp Publication Thumbnail Badge */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#111927] border border-[#1e2d42] flex items-center justify-center p-2.5 shrink-0 shadow-md group-hover:border-emerald-500/40 transition">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.source || "News"}
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 font-mono text-xs font-bold">
                          {item.source?.slice(0, 2).toUpperCase() || "NW"}
                        </span>
                      )}
                    </div>

                    {/* Right: Headline, Meta Row & Summary */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block group/link"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover/link:text-emerald-300 transition leading-snug line-clamp-2">
                          {headline}
                        </h3>
                      </a>

                      {/* Metadata: Source · Time · Ticker Pill */}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 flex-wrap">
                        <span className="font-medium text-gray-300">
                          {item.source || "Market Wire"}
                        </span>
                        {item.date && (
                          <>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-400">{item.date}</span>
                          </>
                        )}
                        <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#101927] border border-[#1f2e43] text-[11px] font-mono text-gray-200 font-semibold tracking-wider">
                          {displaySymbol}
                        </span>
                      </div>

                      {/* News Story Summary Block */}
                      {summary && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#0e1724]/80 border border-[#19273a] text-xs sm:text-[13px] text-gray-300 leading-relaxed shadow-sm">
                          <span className="text-emerald-400 font-semibold font-mono text-[11px] uppercase tracking-wider mr-1.5">
                            {STOCK_NEWS_LABELS.summaryPrefix} ·
                          </span>
                          {summary}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-gray-400 font-mono">
                {STOCK_NEWS_LABELS.emptyState}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Sector Moves Cards Grid */}
      {activeTab === "sector" && (
        <div className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8 gap-2.5 sm:gap-3">
            {sectorMoves.map((sector) => {
              const isPositive = sector.changePercent >= 0;
              return (
                <div
                  key={sector.id}
                  className={`rounded-xl p-3 sm:p-3.5 border transition flex flex-col justify-between ${
                    isPositive
                      ? "bg-[#0d161a] border-[#152e28] hover:border-emerald-600/60"
                      : "bg-[#160f15] border-[#291720] hover:border-rose-900/60"
                  }`}
                >
                  {/* Row 1: Sector Name & Percentage Change */}
                  <div className="flex items-baseline justify-between gap-1.5">
                    <span
                      title={sector.name}
                      className="text-xs sm:text-[13px] font-bold text-gray-100 truncate"
                    >
                      {sector.name}
                    </span>
                    <span
                      className={`text-xs sm:text-[13px] font-mono font-bold shrink-0 ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {sector.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Row 2: Advance / Decline Counts & Best Stock Link */}
                  <div className="mt-2 text-[11px] text-gray-400 flex items-center flex-wrap gap-1 leading-tight">
                    <span>
                      {sector.upCount} up · {sector.downCount} down of {sector.totalCount} · best
                    </span>
                    <Link
                      href={`/dashboard/chart?symbol=${encodeURIComponent(sector.bestStock)}`}
                      className="font-mono text-gray-200 underline hover:text-emerald-400 transition font-medium"
                      title={`Open ${sector.bestStock} chart`}
                    >
                      {sector.bestStock}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockNewsSection;
