"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { newsQueryOptions } from "@/queries/news";
import type { LiveNewsFeedSectionProps } from "@/types/LiveNewsFeed";



const LiveNewsFeedSection: React.FC<LiveNewsFeedSectionProps> = ({
  news = [],
  className = "",
  onSelectStock,
}) => {
  const router = useRouter();

  // If news is not passed from knowledge graph, fetch real live wire from /api/news
  const { data: newsData, isLoading } = useQuery({
    ...newsQueryOptions("top_stories"),
    enabled: !news || news.length === 0,
  });

  const displayStories = news && news.length > 0 ? news : (newsData?.stories || []);

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
        {isLoading && (!news || news.length === 0) ? (
          <div className="py-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 py-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#101724] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#101724] rounded w-3/4" />
                  <div className="h-3 bg-[#101724] rounded w-1/3" />
                  <div className="h-3 bg-[#101724] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayStories.length > 0 ? (
          displayStories.map((item, idx) => {
            const source = item.source || "Google News";
            // Real publisher summary directly from news_results snippet
            const summaryText =
              ("snippet" in item && typeof item.snippet === "string" ? item.snippet : "") ||
              ("summary" in item && typeof item.summary === "string" ? item.summary : "") ||
              "";
            const thumbnail =
              "thumbnail" in item && typeof item.thumbnail === "string" && item.thumbnail.length > 5
                ? item.thumbnail
                : null;

            const tickers: string[] =
              "tickers" in item && Array.isArray(item.tickers) && item.tickers.length > 0
                ? item.tickers
                : ["MARKET"];

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
                {/* Left: Real Publisher Thumbnail Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#101826] border border-[#1e2c40] flex items-center justify-center p-2.5 shrink-0 shadow-md group-hover:border-emerald-500/40 transition">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnail}
                      alt={source}
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="font-bold text-xs text-gray-300 font-mono">
                      {source?.slice(0, 2).toUpperCase() || "NW"}
                    </span>
                  )}
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

                  {/* News Summary: Real publisher snippet directly from news_results */}
                  {summaryText && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                      {summaryText}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-gray-400 font-mono">
            No recent news stories found. Live market wire is active.
          </div>
        )}
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
