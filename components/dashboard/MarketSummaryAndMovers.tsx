"use client";

import React from "react";
import type { MarketSummaryAndMoversProps } from "@/types/MarketSummaryAndMovers";
import {
  MARKET_SUMMARY_DEFAULTS,
  MARKET_SUMMARY_HEADERS,
  WATCHLIST_INTERACTION,
} from "@/constants/MarketSummaryAndMovers";

const MarketSummaryAndMovers = ({
  indexName = MARKET_SUMMARY_DEFAULTS.defaultIndexName,
  about,
  news = [],
  related = [],
  watchlist = [],
  onToggleWatchlist,
}: MarketSummaryAndMoversProps) => {
  const hasNews = (news?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;
  const hasAbout = Boolean(about);

  // If no data returned from SerpApi, show nothing
  if (!hasNews && !hasRelated && !hasAbout) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
      {/* Left Column: Real Market News & Profile from SerpApi */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-4 pt-2">
        {hasAbout && (
          <div className="p-4 rounded-2xl bg-[#0e1622] border border-[#1b2637]">
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
                className="block p-3.5 rounded-2xl bg-[#0e1622] hover:bg-[#131d2e] border border-[#1b2637] transition group"
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
      </div>

      {/* Right Column: Real Related Markets / Discover Items from SerpApi */}
      {hasRelated && (
        <div className="lg:col-span-7">
          <div className="pb-3 mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              {MARKET_SUMMARY_HEADERS.relatedMarketsTitle}
            </h2>
          </div>

          <div className="space-y-2">
            {related?.map?.((item, idx) => {
              const symbol = item?.stock || `ITEM_${idx}`;
              const isWatchlisted = watchlist?.includes?.(symbol);
              const price = item?.extracted_price ?? (item?.price ? parseFloat(item?.price?.replace?.(/,/g, "") ?? "0") : null);
              const pct = item?.price_movement?.percentage ?? null;
              const movement = item?.price_movement?.movement;
              const isPositive = movement !== "Down" && (pct == null || pct >= 0);

              return (
                <div
                  key={symbol}
                  className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#0e1622] border border-[#1b2637] hover:bg-[#131d2e] transition group"
                >
                  {/* Left: Symbol & Exchange */}
                  <div className="flex items-center gap-3">
                    {onToggleWatchlist && (
                      <button
                        type="button"
                        onClick={() => onToggleWatchlist?.(symbol)}
                        title={
                          isWatchlisted
                            ? WATCHLIST_INTERACTION.removeFromWatchlistTooltip
                            : WATCHLIST_INTERACTION.addToWatchlistTooltip
                        }
                        className={`text-sm transition cursor-pointer ${
                          isWatchlisted
                            ? "text-amber-400"
                            : "text-gray-600 group-hover:text-gray-400 hover:scale-110"
                        }`}
                      >
                        {isWatchlisted
                          ? WATCHLIST_INTERACTION.activeStar
                          : WATCHLIST_INTERACTION.inactiveStar}
                      </button>
                    )}
                    <span className="font-bold text-sm text-white tracking-tight">
                      {symbol}
                    </span>
                  </div>

                  {/* Right: Real Price & Change */}
                  <div className="flex items-center gap-5 text-right font-mono">
                    {price != null && (
                      <span className="text-sm font-semibold text-white">
                        {MARKET_SUMMARY_DEFAULTS.currencySymbol}
                        {price?.toLocaleString?.(MARKET_SUMMARY_DEFAULTS.locale, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                    {pct != null && (
                      <span
                        className={`text-xs font-bold w-16 text-right ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : "-"}
                        {Math.abs(pct)?.toFixed?.(2)}%
                      </span>
                    )}
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

export default MarketSummaryAndMovers;
