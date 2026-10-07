"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { InvestmentQuotesLoadingProps } from "@/types";
import { INVESTMENT_QUOTES, INVESTMENT_QUOTES_CONFIG } from "@/constants";

const InvestmentQuotesLoading = ({
  intervalMs = INVESTMENT_QUOTES_CONFIG?.intervalMs ?? 6000,
  className = "",
}: InvestmentQuotesLoadingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const quotesCount = INVESTMENT_QUOTES?.length ?? 0;
  const currentQuote = INVESTMENT_QUOTES?.[currentIndex];

  // Auto-advance quotes every 6 seconds until data fetching completes
  useEffect(() => {
    if (isPaused || quotesCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotesCount);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, quotesCount, intervalMs]);

  const handlePrev = () => {
    if (quotesCount <= 0) return;
    setCurrentIndex((prev) => (prev - 1 + quotesCount) % quotesCount);
  };

  const handleNext = () => {
    if (quotesCount <= 0) return;
    setCurrentIndex((prev) => (prev + 1) % quotesCount);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const currentNumberFormatted = String((currentIndex ?? 0) + 1).padStart(2, "0");
  const totalNumberFormatted = String(quotesCount ?? 0).padStart(2, "0");

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1420]/95 via-[#0a1019]/95 to-[#070c14]/95 border border-emerald-500/20 p-5 sm:p-7 shadow-2xl backdrop-blur-md ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glows */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Header: Fetching Notice & Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1b2637]">
        {/* Live SerpApi Fetching Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono font-medium text-emerald-400">
              {INVESTMENT_QUOTES_CONFIG?.fetchingNotice}
            </span>
          </div>
        </div>

        {/* Category Pill & Counter Controls */}
        <div className="flex items-center gap-2.5">
          {currentQuote?.category && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              {currentQuote?.category}
            </span>
          )}

          <span className="text-xs font-mono text-gray-400">
            <strong className="text-white">{currentNumberFormatted}</strong> / {totalNumberFormatted}
          </span>

          <button
            type="button"
            onClick={togglePause}
            className="p-1 rounded-md text-gray-400 hover:text-emerald-300 hover:bg-[#131d2b] transition text-xs cursor-pointer"
            aria-label={isPaused ? INVESTMENT_QUOTES_CONFIG?.resumeAria : INVESTMENT_QUOTES_CONFIG?.pauseAria}
            title={isPaused ? "Resume rotation (6s)" : "Pause rotation"}
          >
            {isPaused ? "▶" : "⏸"}
          </button>
        </div>
      </div>

      {/* 6-Second Animated Progress Bar */}
      <div className="relative z-10 my-3.5 h-1 w-full overflow-hidden rounded-full bg-[#141f2d]">
        <motion.div
          key={`${currentIndex}-${isPaused}`}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? "0%" : "100%" }}
          transition={{ duration: intervalMs / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-sm"
        />
      </div>

      {/* Main Quote & Tip Animated Area */}
      <div className="relative z-10 min-h-[170px] sm:min-h-[155px] flex flex-col justify-between pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote?.id ?? currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* The Quote */}
            <div className="relative">
              <span className="absolute -top-3 -left-2 text-4xl sm:text-5xl font-serif text-emerald-500/20 select-none pointer-events-none">
                {INVESTMENT_QUOTES_CONFIG?.quotePrefix}
              </span>
              <p className="text-base sm:text-lg text-gray-100 font-medium leading-relaxed italic pl-5 sm:pl-6">
                {currentQuote?.quote}
              </p>
            </div>

            {/* Actionable Investment Tip Highlight Box */}
            {currentQuote?.tip && (
              <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#0e1a27]/60 border border-emerald-500/20 p-3.5 sm:p-4 text-xs sm:text-sm text-emerald-200/95 flex items-start gap-3 shadow-inner">
                <span className="text-base sm:text-lg leading-none shrink-0" role="img" aria-label="Tip">
                  💡
                </span>
                <div>
                  <span className="font-semibold text-emerald-400 block text-[11px] uppercase tracking-wider font-mono mb-0.5">
                    {INVESTMENT_QUOTES_CONFIG?.tipHeading}
                  </span>
                  <p className="text-gray-300 leading-relaxed">
                    {currentQuote?.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Author Attribution Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Initials Avatar */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xs font-bold font-mono shadow-md border border-emerald-400/30 shrink-0">
                  {currentQuote?.author
                    ?.split(" ")
                    ?.map?.((n) => n?.[0])
                    ?.slice?.(0, 2)
                    ?.join?.("")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {currentQuote?.author}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {currentQuote?.title}
                    {currentQuote?.netWorth && (
                      <span className="ml-1.5 text-emerald-400 font-mono text-[11px]">
                        • {currentQuote?.netWorth}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Prev / Next Manual Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-lg bg-[#111c2a] border border-[#202f43] text-gray-300 hover:text-white hover:border-emerald-500/40 text-xs font-mono transition cursor-pointer"
                  aria-label={INVESTMENT_QUOTES_CONFIG?.prevButtonAria}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-lg bg-[#111c2a] border border-[#202f43] text-gray-300 hover:text-white hover:border-emerald-500/40 text-xs font-mono transition cursor-pointer"
                  aria-label={INVESTMENT_QUOTES_CONFIG?.nextButtonAria}
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Dots Carousel Indicator */}
      <div className="relative z-10 mt-5 pt-3 border-t border-[#162232] flex items-center justify-center gap-1.5">
        {INVESTMENT_QUOTES?.map?.((item, idx) => (
          <button
            key={item?.id ?? idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? "w-6 h-1.5 bg-emerald-400"
                : "w-1.5 h-1.5 bg-[#202e40] hover:bg-gray-400"
            }`}
            aria-label={`Jump to quote ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default InvestmentQuotesLoading;
