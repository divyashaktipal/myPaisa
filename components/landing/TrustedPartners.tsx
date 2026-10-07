"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import type { StockItem } from "@/types/top200Stocks";
import type { TrustedPartnersProps } from "@/types/TrustedPartners";
import { TRUSTED_PARTNERS_CONFIG } from "@/constants/TrustedPartners";
import StockPill from "@/components/landing/StockPill";

const TrustedPartners = (_props: TrustedPartnersProps = {}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [activeStock, setActiveStock] = useState<StockItem | null>(null);

  // Split into 2 rows of 100 stocks each for ultra-dense, balanced terminal ticker
  const row1 = TOP_200_INDIAN_STOCKS?.slice?.(0, TRUSTED_PARTNERS_CONFIG.rowSplitIndex) ?? [];
  const row2 = TOP_200_INDIAN_STOCKS?.slice?.(TRUSTED_PARTNERS_CONFIG.rowSplitIndex, 200) ?? [];

  // Duplicate for seamless 0 -> -50% infinite marquee loop
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];

  // Quick market summary
  const totalStocks = TOP_200_INDIAN_STOCKS?.length ?? 0;
  const gainers = TOP_200_INDIAN_STOCKS?.filter?.((s) => (s?.changePercent ?? 0) >= 0)?.length ?? 0;
  const decliners = totalStocks - gainers;

  return (
    <motion.section
      id="stocks-ticker"
      ref={sectionRef}
      aria-label={TRUSTED_PARTNERS_CONFIG.titleText}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="py-10 bg-white border-y border-gray-100 overflow-hidden relative select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          {/* Section Title & Live Dot */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              {TRUSTED_PARTNERS_CONFIG.badgeText}
            </span>
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
              {TRUSTED_PARTNERS_CONFIG.titleText}
            </h2>
          </div>

          {/* Market Stats & Hover Hint */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              <span className="text-gray-400 font-medium">{TRUSTED_PARTNERS_CONFIG.summaryLabel}</span>
              <span className="font-semibold text-emerald-600">▲ {gainers}{TRUSTED_PARTNERS_CONFIG.advancersSuffix}</span>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-red-500">▼ {decliners}{TRUSTED_PARTNERS_CONFIG.declinersSuffix}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {TRUSTED_PARTNERS_CONFIG.hoverHintText}
            </span>
          </div>
        </div>
      </div>

      {/* Marquee Track Container with group-hover pause */}
      <div className="marquee-container space-y-3 relative group">
        {/* Left & Right gradient fade masks for smooth aesthetic */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Row 1: Stocks 1 to 100 (Flow Right to Left) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-rtl flex items-center gap-3 py-1">
            {row1Doubled?.map?.((stock, idx) => (
              <StockPill
                key={`r1-${stock?.symbol}-${idx}`}
                stock={stock}
                onHover={() => setActiveStock(stock)}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Stocks 101 to 200 (Flow Right to Left) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-rtl-alt flex items-center gap-3 py-1">
            {row2Doubled?.map?.((stock, idx) => (
              <StockPill
                key={`r2-${stock?.symbol}-${idx}`}
                stock={stock}
                onHover={() => setActiveStock(stock)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Active Stock Detail Toast (if hovered) */}
      {activeStock && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{activeStock?.name}</span>
            <span className="text-gray-400 font-mono text-[11px]">({activeStock?.symbol})</span>
            {activeStock?.sector && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">
                {activeStock?.sector}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-gray-900">
              {TRUSTED_PARTNERS_CONFIG.currencySymbol}
              {activeStock?.price?.toLocaleString?.(TRUSTED_PARTNERS_CONFIG.locale, { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`font-semibold ${
                (activeStock?.changePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {(activeStock?.changePercent ?? 0) >= 0 ? "+" : ""}
              {activeStock?.change?.toFixed?.(2)} ({(activeStock?.changePercent ?? 0) >= 0 ? "+" : ""}
              {activeStock?.changePercent?.toFixed?.(2)}%)
            </span>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default TrustedPartners;
