"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { LiveNewsFeedSectionProps } from "@/types/LiveNewsFeed";
import { FALLBACK_STORIES } from "@/constants/MarketNews";

function getSourceBadgeStyle(source: string): { bg: string; text: string; label: string } {
  const s = source.toLowerCase();
  if (s.includes("et now") || s.includes("economic times")) {
    return { bg: "bg-red-950/90 border-red-600/70", text: "text-red-200", label: "ET" };
  }
  if (s.includes("mint") || s.includes("livemint")) {
    return { bg: "bg-amber-950/90 border-amber-600/70", text: "text-amber-200", label: "mint" };
  }
  if (s.includes("ndtv")) {
    return { bg: "bg-slate-900/90 border-slate-600/70", text: "text-white", label: "NDTV" };
  }
  if (s.includes("moneycontrol")) {
    return { bg: "bg-emerald-950/90 border-emerald-600/70", text: "text-emerald-200", label: "MC" };
  }
  if (s.includes("cnbc")) {
    return { bg: "bg-blue-950/90 border-blue-600/70", text: "text-blue-200", label: "CNBC" };
  }
  return { bg: "bg-[#141f30] border-[#22334a]", text: "text-gray-300", label: source.slice(0, 4).toUpperCase() };
}

const LiveNewsFeedSection: React.FC<LiveNewsFeedSectionProps> = ({
  news = [],
  className = "",
  onSelectStock,
}) => {
  const router = useRouter();

  // If news is provided from SerpApi knowledge graph, map them with fallbacks
  const displayStories = news && news.length >= 3 ? news : FALLBACK_STORIES;

  const handleShowAll = () => {
    router.push("/dashboard/news");
  };

  return (
    <section
      className={`w-full bg-[#080d16] border border-[#152236] rounded-3xl p-5 sm:p-7 shadow-2xl transition-all ${className}`}
      aria-label="In the news Section"
    >
      {/* Header matching user screenshot */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#131d2c]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="text-white font-bold text-base sm:text-lg tracking-tight">
            In the news
          </h2>
          <span className="text-gray-400 text-xs font-normal">
            About today&apos;s biggest movers in the 200 · newest first
          </span>
        </div>

        {/* Right Show all link */}
        <button
          type="button"
          onClick={handleShowAll}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer hover:underline shrink-0"
        >
          Show all
        </button>
      </div>

      {/* Rows Feed matching screenshot */}
      <div className="divide-y divide-[#131d2c]">
        {displayStories.map((item, idx) => {
          const source = item.source || "Google News";
          const badge = getSourceBadgeStyle(source);
          const summaryText =
            ("summary" in item && typeof item.summary === "string" ? item.summary : "") ||
            ("snippet" in item && typeof item.snippet === "string" ? item.snippet : "") ||
            "";
          const thumbnail =
            ("thumbnail" in item && typeof item.thumbnail === "string" && item.thumbnail.length > 5
              ? item.thumbnail
              : null) ||
            FALLBACK_STORIES[idx % FALLBACK_STORIES.length]?.thumbnail;

          const tickers: string[] =
            ("tickers" in item && Array.isArray(item.tickers) ? item.tickers : null) ||
            (FALLBACK_STORIES[idx % FALLBACK_STORIES.length]?.tickers ?? ["NIFTY"]);

          return (
            <div
              key={idx}
              onClick={() => {
                if (item.link && item.link.startsWith("http")) {
                  window.open(item.link, "_blank", "noreferrer");
                } else {
                  handleShowAll();
                }
              }}
              className="py-4 sm:py-5 flex items-start gap-4 hover:bg-[#0c1422] -mx-2 px-2 sm:-mx-3 sm:px-3 rounded-2xl transition group cursor-pointer"
            >
              {/* Left: Thumbnail with Source Badge overlay in corner */}
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-[#101724] shrink-0 border border-[#1b283a]">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#131c2c] text-gray-400 text-lg">
                    📰
                  </div>
                )}
                {/* Source badge overlay on thumbnail matching screenshot */}
                <div
                  className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border shadow-md backdrop-blur-sm ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </div>
              </div>

              {/* Right: Content details */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Title */}
                <h3 className="text-xs sm:text-[14px] font-bold text-white group-hover:text-emerald-300 transition leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Source · Date · Ticker tags */}
                <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap pt-0.5">
                  <span className="font-medium text-gray-300">{source}</span>
                  <span>·</span>
                  <span>{item.date || "Just now"}</span>
                  {tickers.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectStock) {
                          onSelectStock(sym);
                        } else {
                          router.push(`/dashboard/chart?symbol=${encodeURIComponent(sym)}`);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#131d2b] hover:bg-[#1a283b] border border-[#1e2e43] text-[10px] font-mono font-bold text-gray-200 hover:text-emerald-300 transition cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                {/* News Summary included as requested */}
                {summaryText && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                    {summaryText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom disclaimer note matching screenshot */}
      <div className="pt-4 border-t border-[#121c2b] mt-1">
        <p className="text-xs text-gray-500 font-mono">
          Headlines from Google News, as published by each source. myPaisa doesn&apos;t write or endorse them.
        </p>
      </div>
    </section>
  );
};

export default LiveNewsFeedSection;
