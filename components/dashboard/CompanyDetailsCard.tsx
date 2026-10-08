"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { CompanyDetailsCardProps } from "@/types/CompanyDetailsCard";
import { COMPANY_DETAILS_LABELS } from "@/constants/CompanyDetailsCard";

const CompanyDetailsCard = ({
  symbol,
  title,
  exchange,
  price,
  changePercent,
  aboutSnippet,
  aboutLink,
  aboutInfo = [],
  stats = [],
  isInWatchlist = false,
  onToggleWatchlist,
  loading = false,
}: CompanyDetailsCardProps) => {
  const isPositive = changePercent != null && changePercent >= 0;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Reset expansion state when viewing a different stock
  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [symbol]);

  // Compute 20-word truncated description
  const words = useMemo(() => {
    if (!aboutSnippet) return [];
    return aboutSnippet.trim().split(/\s+/);
  }, [aboutSnippet]);

  const hasMoreThan20Words = words.length > 20;
  const displayedDescription =
    hasMoreThan20Words && !isDescriptionExpanded
      ? `${words.slice(0, 20).join(" ")}...`
      : aboutSnippet;

  // Filter out any empty stats
  const validStats = (stats || []).filter((s) => s?.label && s?.value);

  return (
    <div className="rounded-2xl bg-[#0b121c] border border-[#1a2535] p-5 shadow-2xl text-white flex flex-col h-full">
      {/* Header: Company Identity & Watchlist Action */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#182333]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono">
              {symbol}
            </h2>
            {exchange && (
              <span className="px-2 py-0.5 rounded-md bg-[#111c2a] border border-[#1f2f42] text-[10px] font-mono text-emerald-400 font-semibold">
                {exchange}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 font-medium mt-0.5 line-clamp-1">
            {title || symbol}
          </p>
        </div>

        {/* Watchlist Quick Toggle Button */}
        {onToggleWatchlist && (
          <button
            type="button"
            onClick={() => onToggleWatchlist(symbol)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-sm flex items-center gap-1.5 whitespace-nowrap ${
              isInWatchlist
                ? "bg-emerald-950/80 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/90"
                : "bg-[#111c2b] border-[#1e2f44] text-gray-300 hover:text-white hover:bg-[#162438]"
            }`}
          >
            {isInWatchlist ? COMPANY_DETAILS_LABELS.inWatchlist : COMPANY_DETAILS_LABELS.addToWatchlist}
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 space-y-4 animate-pulse flex-1">
          <div className="h-4 bg-[#141f2e] rounded-md w-3/4" />
          <div className="h-16 bg-[#141f2e] rounded-xl w-full" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-12 bg-[#141f2e] rounded-xl" />
            <div className="h-12 bg-[#141f2e] rounded-xl" />
            <div className="h-12 bg-[#141f2e] rounded-xl" />
            <div className="h-12 bg-[#141f2e] rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
          {/* About Company Snippet */}
          {aboutSnippet && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                {COMPANY_DETAILS_LABELS.aboutSection}
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">
                {displayedDescription}
              </p>
              <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                {hasMoreThan20Words && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>
                      {isDescriptionExpanded
                        ? COMPANY_DETAILS_LABELS.viewLess || "View less"
                        : COMPANY_DETAILS_LABELS.viewMore || "View more"}
                    </span>
                    <span className="text-[10px]">
                      {isDescriptionExpanded ? "▲" : "▼"}
                    </span>
                  </button>
                )}
                {aboutLink && (
                  <a
                    href={aboutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] text-gray-400 hover:text-gray-200 font-medium transition underline underline-offset-2"
                  >
                    {COMPANY_DETAILS_LABELS.readMore}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Corporate Profile Fields (CEO, Founded, Headquarters, Employees, Website) */}
          {aboutInfo && aboutInfo.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#162131]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                {COMPANY_DETAILS_LABELS.profileSection}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aboutInfo.map((item, idx) => (
                  <div
                    key={`${item?.label}-${idx}`}
                    className="p-2 rounded-xl bg-[#080e16] border border-[#162232] flex flex-col justify-center"
                  >
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {item?.label}
                    </span>
                    {item?.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 truncate underline underline-offset-1 mt-0.5"
                      >
                        {item?.value}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-gray-200 truncate mt-0.5">
                        {item?.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Valuation & Financial Stats */}
          {validStats.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#162131]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                {COMPANY_DETAILS_LABELS.statsSection}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validStats.map((stat, idx) => (
                  <div
                    key={`${stat?.label}-${idx}`}
                    className="p-2 rounded-xl bg-[#080e16] border border-[#162232] flex flex-col justify-center"
                  >
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate">
                      {stat?.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 truncate">
                      {stat?.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!aboutSnippet && aboutInfo.length === 0 && validStats.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-400">{COMPANY_DETAILS_LABELS.noDetails}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyDetailsCard;
