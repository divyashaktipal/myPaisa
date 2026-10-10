"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MarketNewsResponse, NewsFilterTab, NewsStoryItem } from "@/types/MarketNews";
import {
  NEWS_FILTER_TABS,
  MARKET_NEWS_HEADER,
  FALLBACK_LEAD_STORY,
  FALLBACK_SHORTS,
  FALLBACK_STORIES,
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

// Source color badges for news icons
function getSourceBadgeStyle(source: string): { bg: string; text: string; label: string } {
  const s = source.toLowerCase();
  if (s.includes("et now") || s.includes("economic times")) {
    return { bg: "bg-red-950/80 border-red-700/60", text: "text-red-300", label: "ET" };
  }
  if (s.includes("moneycontrol")) {
    return { bg: "bg-emerald-950/80 border-emerald-700/60", text: "text-emerald-300", label: "MC" };
  }
  if (s.includes("cnbc")) {
    return { bg: "bg-blue-950/80 border-blue-700/60", text: "text-blue-300", label: "CNBC" };
  }
  if (s.includes("mint") || s.includes("livemint")) {
    return { bg: "bg-amber-950/80 border-amber-700/60", text: "text-amber-300", label: "MINT" };
  }
  if (s.includes("financial express")) {
    return { bg: "bg-indigo-950/80 border-indigo-700/60", text: "text-indigo-300", label: "FE" };
  }
  if (s.includes("reuters")) {
    return { bg: "bg-orange-950/80 border-orange-700/60", text: "text-orange-300", label: "R" };
  }
  return { bg: "bg-[#141f30] border-[#22334a]", text: "text-gray-300", label: source.slice(0, 2).toUpperCase() };
}

const MarketNewsFeed = () => {
  const [activeTab, setActiveTab] = useState<NewsFilterTab>("top_stories");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const currentDateLabel = useMemo(() => getFormattedCurrentDate(), []);

  // Fetch market news from API
  const { data: newsData, isLoading } = useQuery<MarketNewsResponse>({
    queryKey: ["market-news", activeTab, searchQuery],
    queryFn: async () => {
      const url = new URL("/api/news", window.location.origin);
      url.searchParams.set("category", activeTab);
      if (searchQuery.trim()) {
        url.searchParams.set("query", searchQuery.trim());
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load news");
      return res.json();
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const leadStory = newsData?.leadStory || FALLBACK_LEAD_STORY;
  const shorts = newsData?.shorts || FALLBACK_SHORTS;
  const stories = newsData?.stories || FALLBACK_STORIES;

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
      {leadStory && (
        <div className="rounded-3xl bg-[#0c1320] border border-[#1a2638] overflow-hidden shadow-2xl group transition hover:border-[#24354c]">
          {/* Top Hero Image Banner */}
          <div className="relative w-full h-[240px] sm:h-[340px] lg:h-[400px] overflow-hidden bg-[#111927]">
            {leadStory.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={leadStory.thumbnail}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121c2d] to-[#0a111a] text-gray-500 text-4xl">
                📰
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1320] via-transparent to-black/30" />
          </div>

          {/* Lead Story Body */}
          <div className="p-6 sm:p-8 space-y-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
                {MARKET_NEWS_HEADER.leadStoryTag}
              </span>

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

              <p className="mt-2 text-xs text-gray-400 font-medium">
                {leadStory.source} · {leadStory.date}
              </p>
            </div>

            {/* Bottom Actions: Tickers & Bookmark */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#172233]">
              <div className="flex items-center gap-1.5 flex-wrap">
                {leadStory.tickers?.map((sym) => (
                  <Link
                    key={sym}
                    href={`/dashboard/chart?symbol=${encodeURIComponent(sym)}`}
                    className="px-2.5 py-1 rounded-lg bg-[#111c2b] hover:bg-[#18283d] border border-[#1f2e43] text-xs font-mono font-bold text-gray-200 hover:text-emerald-300 transition"
                  >
                    {sym}
                  </Link>
                ))}
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

            {/* Executive Summary Box */}
            {leadStory.summary && (
              <div className="p-4 rounded-2xl bg-[#080e18]/90 border border-[#162335] text-xs sm:text-[13px] text-gray-300 leading-relaxed shadow-sm">
                <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mr-2">
                  Executive Summary ·
                </span>
                {leadStory.summary}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Section: SHORTS (Quick takes, under a minute) */}
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
                className="w-[200px] sm:w-[220px] h-[330px] rounded-2xl relative overflow-hidden bg-[#0c1320] border border-[#1a2538] flex flex-col justify-between p-3.5 shrink-0 shadow-xl group hover:border-[#2d425f] hover:scale-[1.01] transition duration-300"
              >
                {/* Background Image / Thumbnail */}
                {short.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={short.thumbnail}
                    alt={short.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

                {/* Top: Bookmark Button & Duration Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  {short.duration ? (
                    <span className="px-2 py-0.5 rounded-md bg-black/70 border border-white/20 text-[10px] font-mono text-gray-200">
                      ▶ {short.duration}
                    </span>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(short.id, e)}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer backdrop-blur-md ${isBookmarked
                      ? "text-emerald-400 bg-black/80"
                      : "text-gray-300 hover:text-white bg-black/50"
                      }`}
                  >
                    {isBookmarked ? "★" : "☆"}
                  </button>
                </div>

                {/* Bottom: Headline & Source */}
                <div className="relative z-10 space-y-2">
                  <p className="text-xs sm:text-[13px] font-bold text-white leading-snug drop-shadow-md line-clamp-3 group-hover:text-emerald-300 transition">
                    {short.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium pt-1 border-t border-white/10">
                    <span>{short.source}</span>
                    <span>{short.date}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

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
              const badge = getSourceBadgeStyle(story.source);
              const isBookmarked = bookmarkedIds.has(story.id);

              return (
                <div
                  key={story.id}
                  className="rounded-2xl bg-[#0c1320] hover:bg-[#101927] border border-[#192639] hover:border-[#22354c] p-4 sm:p-5 transition flex items-start gap-4 shadow-lg group"
                >
                  {/* Left: Source Icon Badge */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-xs shadow-md shrink-0 border ${badge.bg} ${badge.text}`}
                  >
                    <span>{badge.label}</span>
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
                    {story.summary && (
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
