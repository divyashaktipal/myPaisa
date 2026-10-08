"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { StockNewsSectionProps, StockNewsTab } from "@/types/StockNewsSection";
import type { SerpApiNewsItem } from "@/types/serpapi";
import {
  STOCK_NEWS_TABS,
  STOCK_NEWS_LABELS,
  SECTOR_MOVES_DATA,
} from "@/constants/StockNewsSection";

// Helper to extract clean domain for source favicon
function getSourceDomain(link?: string, source?: string): string {
  if (link) {
    try {
      const url = new URL(link);
      return url.hostname.replace("www.", "");
    } catch {
      // Fall through
    }
  }
  if (!source) return "google.com";
  const s = source.toLowerCase().trim();
  if (s.includes("moneycontrol")) return "moneycontrol.com";
  if (s.includes("business standard")) return "business-standard.com";
  if (s.includes("economic times")) return "economictimes.indiatimes.com";
  if (s.includes("mint") || s.includes("livemint")) return "livemint.com";
  if (s.includes("reuters")) return "reuters.com";
  if (s.includes("bloomberg")) return "bloomberg.com";
  if (s.includes("businessline") || s.includes("business line")) return "thehindubusinessline.com";
  if (s.includes("cnbc")) return "cnbctv18.com";
  if (s.includes("ndtv")) return "ndtvprofit.com";
  if (s.includes("financial express")) return "financialexpress.com";
  return "google.com";
}

// Generate contextual summary for news if standalone snippet is title
function getNewsSummary(item: SerpApiNewsItem, symbol: string): string {
  if (item.title && item.snippet && item.title !== item.snippet) {
    return item.snippet;
  }

  const text = (item.snippet || item.title || "").toLowerCase();

  if (text.includes("fii") || text.includes("dii") || text.includes("stake") || text.includes("promoter") || text.includes("fund")) {
    return `Institutional holding adjustment reported for ${symbol}. Market participants are actively tracking foreign and domestic fund flows, float changes, and resultant liquidity impact.`;
  }

  if (text.includes("q1") || text.includes("q2") || text.includes("q3") || text.includes("q4") || text.includes("profit") || text.includes("revenue") || text.includes("earnings") || text.includes("results")) {
    return `Financial performance update for ${symbol}. Operational execution, margin trajectory, and revenue growth metrics remain under close review by equity analysts.`;
  }

  if (text.includes("fall") || text.includes("drop") || text.includes("slump") || text.includes("slip") || text.includes("lower") || text.includes("dip") || text.includes("down") || text.includes("pare")) {
    return `Shares encountered downward volatility and intraday profit-taking. Technical indicators point to key support levels as traders assess broader market consolidation.`;
  }

  if (text.includes("rise") || text.includes("gain") || text.includes("surge") || text.includes("jump") || text.includes("rally") || text.includes("high") || text.includes("up")) {
    return `Upward price momentum observed in ${symbol} backed by healthy trading volume and positive sector sentiment, driving renewed buying interest.`;
  }

  if (text.includes("ceo") || text.includes("md") || text.includes("appoint") || text.includes("chief") || text.includes("board") || text.includes("management") || text.includes("executive")) {
    return `Executive leadership and corporate governance update for ${symbol}. Management stability and strategic continuity remain a focal point for long-term investors.`;
  }

  if (text.includes("target") || text.includes("rating") || text.includes("buy") || text.includes("sell") || text.includes("brokerage") || text.includes("emkay") || text.includes("iifl") || text.includes("jefferies")) {
    return `Equity research evaluation: Brokerages and institutional desks have reviewed forward valuation multiples, earnings visibility, and risk-reward dynamics for ${symbol}.`;
  }

  if (text.includes("mclr") || text.includes("loan") || text.includes("rbi") || text.includes("rate") || text.includes("deposit") || text.includes("credit")) {
    return `Credit and interest rate dynamics: Lending adjustments and banking sector benchmarks will influence asset quality and net interest margin trajectory.`;
  }

  return `Market intelligence wire: Corporate disclosures, market transactions, and sector developments monitored for ${symbol} across national financial publications.`;
}

const StockNewsSection = ({
  symbol,
  news = [],
}: StockNewsSectionProps) => {
  const [activeTab, setActiveTab] = useState<StockNewsTab>("trending");
  const hasNews = news.length > 0;
  const displaySymbol = symbol?.toUpperCase() || "STOCK";

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
                const summary = getNewsSummary(item, displaySymbol);
                const domain = getSourceDomain(item.link, item.source);
                const faviconUrl = domain
                  ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
                  : null;

                return (
                  <div
                    key={idx}
                    className="py-4 first:pt-2 last:pb-2 flex items-start gap-3.5 sm:gap-4 group"
                  >
                    {/* Left: Thumbnail with Publication Favicon Badge */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#111927] border border-[#1e2d42] shrink-0 shadow-md">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.source || "News"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121b2a] to-[#0c1320] text-gray-400 font-mono text-xs font-bold">
                          <span>📰</span>
                        </div>
                      )}

                      {/* Publication Source Favicon Badge at Bottom-Left */}
                      {faviconUrl && (
                        <div className="absolute bottom-1 left-1 w-5 h-5 rounded-md bg-white p-0.5 shadow-lg border border-black/20 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={faviconUrl}
                            alt={item.source || "Source"}
                            className="w-full h-full object-contain rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
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
            {SECTOR_MOVES_DATA.map((sector) => {
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
