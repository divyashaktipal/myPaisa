"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import type {
  LiveIndexData,
  FeatureTimeframe,
  FeaturesSectionProps,
} from "@/types/FeaturesSection";
import type { FinanceApiResponse } from "@/types";
import {
  FEATURES_SECTION_HEADER,
  FEATURE_TIMEFRAMES,
  SCREENER_FILTER_OPTIONS,
  NEWS_MEDIA_SOURCES,
  DEFAULT_FEATURE_WATCHLIST,
  STATIC_FEATURE_NEWS,
  FEATURE_CARDS_CONTENT,
  QUERY_CLIENT_CONFIG,
} from "@/constants";

const FeaturesSection = (_props: FeaturesSectionProps = {}) => {
  // 1. Dynamic Live Index State (polled from SerpApi Google Finance feed)
  const [indices, setIndices] = useState<LiveIndexData[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Connecting...");
  const [refreshCountdown, setRefreshCountdown] = useState<number>(180);

  // 2. Dynamic Chart Timeframe Selector
  const [activeTimeframe, setActiveTimeframe] = useState<FeatureTimeframe>("5Y");

  // 3. Dynamic Interactive Watchlist
  const [myWatchlist, setMyWatchlist] = useState<string[]>([...DEFAULT_FEATURE_WATCHLIST]);

  // 4. Dynamic Screener Filter Selector
  const [activeFilter, setActiveFilter] = useState<string>(SCREENER_FILTER_OPTIONS[0]);

  // TanStack React Query: Shared cached NIFTY 50 live feed with DashboardPage
  const { data: nifityFinanceData } = useQuery<FinanceApiResponse | null>({
    queryKey: ["finance", "NIFTY 50", "1D"],
    queryFn: async () => {
      const res = await fetch("/api/finance?symbol=NIFTY%2050&window=1D");
      if (!res?.ok) {
        console.warn(`FeaturesSection live feed received HTTP status ${res?.status}`);
        return null;
      }
      return (await res.json()) as FinanceApiResponse;
    },
    staleTime: QUERY_CLIENT_CONFIG?.liveWindowStaleTime ?? 180000,
    gcTime: QUERY_CLIENT_CONFIG?.defaultGcTime ?? 3600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!nifityFinanceData || nifityFinanceData?.price == null) return;
    const json = nifityFinanceData;
    const list: LiveIndexData[] = [
      {
        symbol: "NIFTY 50",
        name: "Nifty 50",
        price: Number(json?.price),
        changePercent: Number(json?.changePercent ?? 0),
      },
    ];

    if (Array.isArray(json?.related)) {
      for (const item of json?.related?.slice?.(0, 2) ?? []) {
        const p =
          item?.extracted_price ??
          (item?.price ? parseFloat(item?.price?.replace?.(/,/g, "") ?? "0") : null);
        if (p != null) {
          const rawStock = item?.stock
            ? item?.stock?.split?.(":")[0]?.replace?.(/_/g, " ")
            : "INDEX";
          const isDown = item?.price_movement?.movement === "Down";
          const pct = item?.price_movement?.percentage ?? 0;
          list.push({
            symbol: rawStock,
            name: rawStock,
            price: p,
            changePercent: isDown ? -Math.abs(pct) : Math.abs(pct),
          });
        }
      }
    }

    setIndices(list);
    const now = new Date();
    setLastRefreshed(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }, [nifityFinanceData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 180 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Compute dynamic top signals from actual TOP 200 Indian stocks
  const dynamicSignals = useMemo(() => {
    const gainers = [...TOP_200_INDIAN_STOCKS].sort((a, b) => b.changePercent - a.changePercent);
    return [
      { tag: "★ 52-Week High", stock: gainers[0] || { symbol: "TRENT", changePercent: 12.64 } },
      { tag: "⚡ Volume Surge 3.4x", stock: gainers[1] || { symbol: "BSE", changePercent: 3.94 } },
      { tag: "↗ Breakout", stock: gainers[2] || { symbol: "KOTAKBANK", changePercent: 3.82 } },
      { tag: "▲ Gap Up", stock: gainers[3] || { symbol: "BAJFINANCE", changePercent: 1.55 } },
    ];
  }, []);

  // Compute dynamic matching count for screener based on active filter
  const matchingCount = useMemo(() => {
    switch (activeFilter) {
      case "> 200 DMA":
        return TOP_200_INDIAN_STOCKS.filter((s) => s.changePercent > 0.5).length;
      case "Near 52W High":
        return TOP_200_INDIAN_STOCKS.filter((s) => s.changePercent > 1.2).length;
      case "RSI < 40":
        return TOP_200_INDIAN_STOCKS.filter((s) => s.changePercent < 0).length;
      case "Volume Spike":
        return TOP_200_INDIAN_STOCKS.filter((s) => Math.abs(s.changePercent) > 1.5).length;
      default:
        return 42;
    }
  }, [activeFilter]);

  const toggleWatchlistSymbol = (symbol: string) => {
    setMyWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#fafbfa] border-t border-gray-100" data-purpose="whats-inside">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {FEATURES_SECTION_HEADER.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-normal text-gray-900 tracking-tight leading-tight">
            {FEATURES_SECTION_HEADER.titleLine1}
            <br />
            <span className="font-semibold text-emerald-900">{FEATURES_SECTION_HEADER.titleLine2}</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            {FEATURES_SECTION_HEADER.description}
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: ⚡ Live */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.liveCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  {FEATURE_CARDS_CONTENT.liveCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.liveCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.liveCard.description}
              </p>
            </div>

            {/* Dynamic Live Ticker Graphic */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200/60 font-mono">
                <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Feed ({lastRefreshed})
                </span>
                <span className="text-[10px] text-gray-400">Next: {refreshCountdown}s</span>
              </div>
              {(indices?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {indices?.map?.((idx) => {
                    const isUp = (idx?.changePercent ?? 0) >= 0;
                    return (
                      <div key={idx?.symbol} className="p-2 rounded-xl bg-white border border-gray-100 shadow-xs">
                        <p className="text-[10px] text-gray-500 font-medium truncate">{idx?.symbol}</p>
                        <p className="text-xs font-bold text-gray-900 mt-0.5 font-mono">
                          {Math.round(idx?.price ?? 0)?.toLocaleString?.("en-IN")}
                        </p>
                        <span
                          className={`text-[10px] font-semibold font-mono ${
                            isUp ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {idx?.changePercent?.toFixed?.(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-gray-400 font-mono">{FEATURE_CARDS_CONTENT.liveCard.connectingText}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: 📡 Signals */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.signalsCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-blue-500/10 text-blue-700 border-blue-500/20">
                  {FEATURE_CARDS_CONTENT.signalsCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.signalsCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.signalsCard.description}
              </p>
            </div>

            {/* Dynamic Market Signals Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {dynamicSignals?.map?.((item) => (
                  <div
                    key={item?.tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-mono shadow-xs"
                  >
                    <span className="text-gray-500">{item?.tag}:</span>
                    <span className="font-bold text-gray-900">{item?.stock?.symbol}</span>
                    <span className="text-emerald-600 font-semibold">
                      (+{item?.stock?.changePercent?.toFixed?.(1)}%)
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-200/60">
                <span className="font-medium text-gray-800">{FEATURE_CARDS_CONTENT.signalsCard.quote}</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  {FEATURE_CARDS_CONTENT.signalsCard.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: 🧭 Screener */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.screenerCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-700 border-amber-500/20">
                  {FEATURE_CARDS_CONTENT.screenerCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.screenerCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.screenerCard.description}
              </p>
            </div>

            {/* Dynamic Screener Filter Selector */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 font-mono shadow-xs">
                <span className="text-gray-400">🔍</span>
                <span className="truncate text-emerald-900 font-medium">“{activeFilter}”</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {SCREENER_FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer ${
                      activeFilter === f
                        ? "bg-brand-deep text-brand-lime font-bold"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-gray-500">{FEATURE_CARDS_CONTENT.screenerCard.instantFiltersLabel}</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                  {matchingCount} matches in 95ms
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: 📈 Charts */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.chartsCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-teal-500/10 text-teal-700 border-teal-500/20">
                  {FEATURE_CARDS_CONTENT.chartsCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.chartsCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.chartsCard.description}
              </p>
            </div>

            {/* Dynamic Charts Timeframe Selector */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-gray-800">{FEATURE_CARDS_CONTENT.chartsCard.adjustedLabel}</span>
                <div className="flex gap-1 text-[10px] font-mono">
                  {FEATURE_TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                        activeTimeframe === tf
                          ? "bg-brand-deep text-brand-lime font-bold shadow-xs"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dynamic Sparkline bars adjusting to active timeframe */}
              <div className="h-10 flex items-end gap-1.5 justify-between px-1">
                {activeTimeframe === "1D" && (
                  <>
                    <div className="w-full bg-emerald-100 rounded-t h-7" />
                    <div className="w-full bg-emerald-200 rounded-t h-5" />
                    <div className="w-full bg-emerald-300 rounded-t h-8" />
                    <div className="w-full bg-emerald-400 rounded-t h-6" />
                    <div className="w-full bg-emerald-500 rounded-t h-9" />
                    <div className="w-full bg-[#1b4332] rounded-t h-10 shadow-sm" />
                  </>
                )}
                {activeTimeframe === "1W" && (
                  <>
                    <div className="w-full bg-emerald-200 rounded-t h-5" />
                    <div className="w-full bg-emerald-300 rounded-t h-7" />
                    <div className="w-full bg-emerald-400 rounded-t h-6" />
                    <div className="w-full bg-emerald-500 rounded-t h-8" />
                    <div className="w-full bg-[#1b4332] rounded-t h-10 shadow-sm" />
                    <div className="w-full bg-emerald-600 rounded-t h-9" />
                  </>
                )}
                {activeTimeframe === "1M" && (
                  <>
                    <div className="w-full bg-emerald-100 rounded-t h-4" />
                    <div className="w-full bg-emerald-200 rounded-t h-6" />
                    <div className="w-full bg-emerald-300 rounded-t h-5" />
                    <div className="w-full bg-emerald-500 rounded-t h-8" />
                    <div className="w-full bg-emerald-600 rounded-t h-9" />
                    <div className="w-full bg-[#1b4332] rounded-t h-10 shadow-sm" />
                  </>
                )}
                {activeTimeframe === "1Y" && (
                  <>
                    <div className="w-full bg-emerald-200 rounded-t h-3" />
                    <div className="w-full bg-emerald-300 rounded-t h-5" />
                    <div className="w-full bg-emerald-400 rounded-t h-7" />
                    <div className="w-full bg-emerald-500 rounded-t h-8" />
                    <div className="w-full bg-[#1b4332] rounded-t h-10 shadow-sm" />
                    <div className="w-full bg-emerald-600 rounded-t h-9" />
                  </>
                )}
                {activeTimeframe === "5Y" && (
                  <>
                    <div className="w-full bg-emerald-100 rounded-t h-3" />
                    <div className="w-full bg-emerald-200 rounded-t h-5" />
                    <div className="w-full bg-emerald-300 rounded-t h-6" />
                    <div className="w-full bg-emerald-400 rounded-t h-7" />
                    <div className="w-full bg-emerald-500 rounded-t h-9" />
                    <div className="w-full bg-[#1b4332] rounded-t h-10 shadow-sm" />
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-mono text-right">
                {FEATURE_CARDS_CONTENT.chartsCard.rsiLabel}
              </p>
            </div>
          </div>

          {/* Card 5: ⭐ Watchlists */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-yellow-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.watchlistCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-800 border-yellow-500/20">
                  {FEATURE_CARDS_CONTENT.watchlistCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.watchlistCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.watchlistCard.description}
              </p>
            </div>

            {/* Dynamic Interactive Watchlist Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-200/60 font-mono text-gray-500">
                <span>My Watchlist ({myWatchlist.length})</span>
                <span className="text-[10px] text-emerald-700">{FEATURE_CARDS_CONTENT.watchlistCard.tapHint}</span>
              </div>
              {TOP_200_INDIAN_STOCKS?.slice?.(0, 3)?.map?.((stk) => {
                const inList = myWatchlist?.includes?.(stk?.symbol);
                return (
                  <div
                    key={stk?.symbol}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white border border-gray-100 shadow-xs"
                  >
                    <span className="font-bold text-gray-900">{stk?.symbol}</span>
                    <span className="text-emerald-700 font-mono font-medium">
                      ₹{stk?.price?.toLocaleString?.("en-IN", { minimumFractionDigits: 1 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleWatchlistSymbol(stk?.symbol)}
                      className={`text-sm cursor-pointer transition transform hover:scale-125 ${
                        inList ? "text-amber-400" : "text-gray-300 hover:text-amber-400"
                      }`}
                      title={inList ? "Remove" : "Add"}
                    >
                      ★
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 6: 📰 News */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-soft-card flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-sky-500/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl shadow-xs">
                  {FEATURE_CARDS_CONTENT.newsCard.emoji}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-700 border-sky-500/20">
                  {FEATURE_CARDS_CONTENT.newsCard.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {FEATURE_CARDS_CONTENT.newsCard.title}
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {FEATURE_CARDS_CONTENT.newsCard.description}
              </p>
            </div>

            {/* Dynamic News Feed Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-[#fafbfa] border border-gray-100 shadow-inner space-y-2">
              <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-gray-600 pb-1 border-b border-gray-200/60">
                {NEWS_MEDIA_SOURCES.map((src) => (
                  <span key={src} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 shadow-xs">
                    {src}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5 pt-1">
                {STATIC_FEATURE_NEWS?.slice?.(0, 2)?.map?.((item) => (
                  <div key={item?.id} className="p-2 rounded-xl bg-white border border-gray-100 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5 font-mono">
                      <span className="font-bold text-emerald-800">{item?.source}</span>
                      <span>{item?.minutesAgo}m ago</span>
                    </div>
                    <p className="text-[11px] text-gray-800 line-clamp-1 leading-snug">
                      {item?.headline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-14 text-center">
          <Link
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-deep text-white text-sm font-semibold hover:bg-black transition shadow-lg group"
            href={FEATURES_SECTION_HEADER.ctaHref}
          >
            <span>{FEATURES_SECTION_HEADER.ctaText}</span>
            <span className="w-5 h-5 rounded-full bg-brand-lime text-brand-deep flex items-center justify-center text-xs transition-transform group-hover:translate-x-0.5">
              {FEATURES_SECTION_HEADER.ctaArrow}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
