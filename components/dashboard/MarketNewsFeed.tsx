"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { newsQueryOptions } from "@/queries/news";
import type { MarketNewsResponse, NewsFilterTab, NewsStoryItem } from "@/types/MarketNews";
import {
  NEWS_FILTER_TABS,
  MARKET_NEWS_HEADER,
} from "@/constants/MarketNews";

// Helper to get formatted current day and date (e.g. • FRIDAY, 9 OCTOBER)
function getFormattedCurrentDate(): string {
  try {
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const date = now.getDate();
    const month = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
    return `• ${day}, ${date} ${month}`;
  } catch {
    return "• TODAY, IN MARKETS";
  }
}



const MarketNewsFeed = () => {
  const [activeTab, setActiveTab] = useState<NewsFilterTab>("top_stories");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const currentDateLabel = useMemo(() => getFormattedCurrentDate(), []);

  // Fetch market news from API via centralized query options
  const { data: newsData, isLoading } = useQuery(newsQueryOptions(activeTab, searchQuery));

  const leadStory = newsData?.leadStory || null;
  const shorts = newsData?.shorts || [];
  const stories = newsData?.stories || [];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeTabObj = NEWS_FILTER_TABS.find((t) => t.id === activeTab);
  const activeTabLabel = activeTabObj ? activeTabObj.label : "Top stories";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 text-white font-sans">
      {/* 1. Header Banner */}
      <div className="space-y-2 pt-2">
        {/* <p className="text-[11px] font-mono tracking-widest text-gray-400 font-semibold uppercase">
          {currentDateLabel}
        </p> */}

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-1.5 flex-wrap">
          <span>{MARKET_NEWS_HEADER.titlePrefix}</span>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {MARKET_NEWS_HEADER.titleHighlight}
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
          {MARKET_NEWS_HEADER.subtitle}
          <span className="font-semibold text-gray-200">{activeTabLabel}</span>
        </p>
      </div>

      {/* 2. Filter Pills & Stock Search Bar */}
      <div className="space-y-3">
        {/* Pills Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* "A stock" Search Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${isSearchOpen || searchQuery
              ? "bg-emerald-500 text-black border-emerald-400 font-bold"
              : "bg-[#0e1624] text-gray-300 border-[#1c293c] hover:border-[#2d405b] hover:text-white"
              }`}
          >
            <span>🔍</span>
            <span>{MARKET_NEWS_HEADER.stockFilterButton}</span>
          </button>

          {/* Category Tabs */}
          {NEWS_FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as NewsFilterTab);
                  if (searchQuery) setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${isActive
                  ? "bg-white text-black border-white shadow-sm font-bold"
                  : "bg-[#0e1624] text-gray-300 border-[#1c293c] hover:border-[#2d405b] hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Bar (Toggled or active) */}
        {(isSearchOpen || searchQuery) && (
          <div className="relative max-w-md animate-in fade-in zoom-in-95 duration-150">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={MARKET_NEWS_HEADER.searchPlaceholder}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[#0e1624] border border-[#20314a] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition pr-8 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Featured Hero: LEAD STORY */}
      {/* 3. Featured Hero: LEAD STORY */}
      {leadStory && (
        <div className="rounded-3xl bg-[#0c1320] border border-[#1a2638] p-6 sm:p-8 space-y-5 shadow-2xl group transition hover:border-[#24354c]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {leadStory.thumbnail ? (
                <div className="w-12 h-12 rounded-2xl bg-[#111927] border border-[#1e2d42] p-2 flex items-center justify-center shrink-0 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leadStory.thumbnail}
                    alt={leadStory.source}
                    className="w-7 h-7 object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#111927] border border-[#1e2d42] flex items-center justify-center shrink-0 shadow-md text-xl">
                  📰
                </div>
              )}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  {MARKET_NEWS_HEADER.leadStoryTag}
                </span>
                <p className="text-xs text-gray-400 font-medium">
                  {leadStory.source} · {leadStory.date}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => toggleBookmark(leadStory.id, e)}
              className={`p-2 rounded-xl transition cursor-pointer text-sm ${bookmarkedIds.has(leadStory.id)
                ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/60"
                : "text-gray-400 hover:text-white bg-[#101825] border border-[#1d293b]"
                }`}
              title={bookmarkedIds.has(leadStory.id) ? "Bookmarked" : "Bookmark story"}
            >
              {bookmarkedIds.has(leadStory.id) ? "★" : "☆"}
            </button>
          </div>

          <div>
            <a
              href={leadStory.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="block group/title"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white group-hover/title:text-emerald-300 transition leading-snug">
                {leadStory.title}
              </h2>
            </a>
          </div>

          {/* Tickers */}
          {leadStory.tickers && leadStory.tickers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#172233]">
              {leadStory.tickers.map((sym) => (
                <Link
                  key={sym}
                  href={`/dashboard/chart?symbol=${encodeURIComponent(sym)}`}
                  className="px-2.5 py-1 rounded-lg bg-[#111c2b] hover:bg-[#18283d] border border-[#1f2e43] text-xs font-mono font-bold text-gray-200 hover:text-emerald-300 transition"
                >
                  {sym}
                </Link>
              ))}
            </div>
          )}

          {/* Executive Summary Box */}
          {leadStory.summary && leadStory.summary !== leadStory.title && (
            <div className="p-4 rounded-2xl bg-[#080e18]/90 border border-[#162335] text-xs sm:text-[13px] text-gray-300 leading-relaxed shadow-sm">
              <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mr-2">
                Executive Summary ·
              </span>
              {leadStory.summary}
            </div>
          )}
        </div>
      )}

      {/* 4. Section: SHORTS (Quick takes, under a minute) */}
      {shorts.length > 0 && (
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              {MARKET_NEWS_HEADER.shortsTag}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {MARKET_NEWS_HEADER.shortsTitle}
            </h3>
          </div>

          {/* Horizontal Scrolling Video Shorts Carousel */}
          <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {shorts.map((short) => {
              const isBookmarked = bookmarkedIds.has(short.id);
              return (
                <a
                  key={short.id}
                  href={short.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-[220px] sm:w-[240px] h-[270px] rounded-2xl relative overflow-hidden bg-gradient-to-b from-[#121c2e] via-[#0d1522] to-[#070c14] border border-[#1c293e] flex flex-col justify-between p-4 shrink-0 shadow-xl group hover:border-emerald-500/50 hover:scale-[1.01] transition duration-300"
                >
                  {/* Top: Source Thumbnail Icon & Duration / Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {short.thumbnail ? (
                        <div className="w-8 h-8 rounded-lg bg-[#142032] border border-[#23354d] p-1 flex items-center justify-center shrink-0 shadow">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={short.thumbnail}
                            alt={short.source}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#142032] border border-[#23354d] flex items-center justify-center shrink-0 shadow text-xs">
                          📰
                        </div>
                      )}
                      <span className="text-[11px] font-medium text-gray-300 truncate max-w-[90px]">
                        {short.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {short.duration && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-mono text-gray-300">
                          {short.duration}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(short.id, e)}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${isBookmarked
                          ? "text-emerald-400 bg-emerald-950/60"
                          : "text-gray-400 hover:text-white bg-black/40"
                          }`}
                      >
                        {isBookmarked ? "★" : "☆"}
                      </button>
                    </div>
                  </div>

                  {/* Middle: Headline */}
                  <p className="text-xs sm:text-[13px] font-bold text-white leading-snug drop-shadow-sm line-clamp-4 group-hover:text-emerald-300 transition my-auto pt-2">
                    {short.title}
                  </p>

                  {/* Bottom: Date & Quick Read Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-2 border-t border-white/10">
                    <span>{short.date}</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      Read ↗
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Section: READ (The latest stories with summaries) */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            {MARKET_NEWS_HEADER.storiesTag}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {MARKET_NEWS_HEADER.storiesTitle}
          </h3>
        </div>

        {/* Stories List */}
        <div className="space-y-3.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-mono animate-pulse">
              Fetching live business news wire...
            </div>
          ) : stories.length > 0 ? (
            stories.map((story) => {
              const isBookmarked = bookmarkedIds.has(story.id);

              return (
                <div
                  key={story.id}
                  className="rounded-2xl bg-[#0c1320] hover:bg-[#101927] border border-[#192639] hover:border-[#22354c] p-4 sm:p-5 transition flex items-start gap-4 shadow-lg group"
                >
                  {/* Left: Real Publisher Thumbnail Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#111927] border border-[#1e2d42] flex items-center justify-center p-2.5 shrink-0 shadow-md group-hover:border-emerald-500/40 transition">
                    {story.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={story.thumbnail}
                        alt={story.source}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-bold text-xs text-gray-300 font-mono">
                        {story.source?.slice(0, 2).toUpperCase() || "NW"}
                      </span>
                    )}
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={story.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block group/title flex-1"
                      >
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover/title:text-emerald-300 transition leading-snug">
                          {story.title}
                        </h4>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(story.id, e)}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer shrink-0 ${isBookmarked
                          ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/60"
                          : "text-gray-500 hover:text-gray-300"
                          }`}
                        title={isBookmarked ? "Bookmarked" : "Bookmark"}
                      >
                        {isBookmarked ? "★" : "☆"}
                      </button>
                    </div>

                    {/* Metadata & Affected Tickers */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      <span className="font-medium text-gray-300">{story.source}</span>
                      <span className="text-gray-600">·</span>
                      <span>{story.date}</span>

                      {story.tickers?.map((t) => (
                        <Link
                          key={t}
                          href={`/dashboard/chart?symbol=${encodeURIComponent(t)}`}
                          className="px-2 py-0.5 rounded-md bg-[#111c2a] hover:bg-[#18283c] border border-[#1e2e42] text-[10px] font-mono text-gray-300 hover:text-emerald-300 transition font-semibold"
                        >
                          {t}
                        </Link>
                      ))}
                    </div>

                    {/* Story Summary Block */}
                    {story.summary && story.summary !== story.title && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#080e18]/80 border border-[#162234] text-xs sm:text-[13px] text-gray-300 leading-relaxed shadow-inner">
                        <span className="text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider mr-1.5">
                          Summary ·
                        </span>
                        {story.summary}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-gray-400 font-mono">
              No stories found for the selected category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketNewsFeed;
