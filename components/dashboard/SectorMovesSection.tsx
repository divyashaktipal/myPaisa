"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import type { SectorMoveData, SectorMovesSectionProps } from "@/types/SectorMoves";
import { SECTOR_MOVES_CONFIG } from "@/constants/SectorMoves";

export const SectorMovesSection: React.FC<SectorMovesSectionProps> = ({
  className = "",
  onSelectStock,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "gainers" | "losers">("all");
  const [mobileVisibleCount, setMobileVisibleCount] = useState<number>(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleFilterChange = (mode: "all" | "gainers" | "losers") => {
    setFilterMode(mode);
    setMobileVisibleCount(8);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setMobileVisibleCount((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 250);
  };

  // Derive aggregate sector metrics dynamically from the 200 constituents
  const { sectorList, gainingCount, losingCount } = useMemo(() => {
    const sectorMap: Record<
      string,
      {
        id: string;
        name: string;
        totalChange: number;
        upCount: number;
        downCount: number;
        totalCount: number;
        bestStock: string;
        bestStockChange: number;
      }
    > = {};

    TOP_200_INDIAN_STOCKS.forEach((stk) => {
      const sector = stk.sector || "Other";
      const id = sector.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!sectorMap[sector]) {
        sectorMap[sector] = {
          id,
          name: sector,
          totalChange: 0,
          upCount: 0,
          downCount: 0,
          totalCount: 0,
          bestStock: stk.symbol,
          bestStockChange: stk.changePercent ?? 0,
        };
      }
      const s = sectorMap[sector];
      const chg = stk.changePercent ?? 0;
      s.totalChange += chg;
      s.totalCount += 1;
      if (chg >= 0) s.upCount += 1;
      else s.downCount += 1;

      if (chg > s.bestStockChange) {
        s.bestStock = stk.symbol;
        s.bestStockChange = chg;
      }
    });

    const list: SectorMoveData[] = Object.values(sectorMap)
      .map((sec) => ({
        id: sec.id,
        name: sec.name,
        changePercent: Number((sec.totalChange / Math.max(1, sec.totalCount)).toFixed(2)),
        upCount: sec.upCount,
        downCount: sec.downCount,
        totalCount: sec.totalCount,
        bestStock: sec.bestStock,
        bestStockChange: sec.bestStockChange,
      }))
      .sort((a, b) => b.changePercent - a.changePercent);

    const gainers = list.filter((s) => s.changePercent >= 0).length;
    const losers = list.length - gainers;

    return { sectorList: list, gainingCount: gainers, losingCount: losers };
  }, []);

  const displayedSectors = useMemo(() => {
    if (filterMode === "gainers") return sectorList.filter((s) => s.changePercent >= 0);
    if (filterMode === "losers") return sectorList.filter((s) => s.changePercent < 0);
    return sectorList;
  }, [sectorList, filterMode]);

  const hasMoreMobile = mobileVisibleCount < displayedSectors.length;

  return (
    <section
      className={`w-full rounded-3xl bg-[#080d16] border border-[#152236] p-5 sm:p-7 shadow-2xl transition-all ${className}`}
      aria-label="Sector Moves Section"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#131d2c]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-white font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {SECTOR_MOVES_CONFIG.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-semibold">
                {gainingCount} Gaining
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 font-semibold">
                {losingCount} Declining
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {SECTOR_MOVES_CONFIG.subtitle}
          </p>
        </div>

        {/* Filter Tab Buttons */}
        <div className="flex items-center bg-[#050910] p-1 rounded-xl border border-[#152132] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterMode === "all"
                ? "bg-[#182638] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {SECTOR_MOVES_CONFIG.allTab}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("gainers")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterMode === "gainers"
                ? "bg-[#182638] text-emerald-400 shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {SECTOR_MOVES_CONFIG.gainersTab}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("losers")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterMode === "losers"
                ? "bg-[#182638] text-rose-400 shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {SECTOR_MOVES_CONFIG.losersTab}
          </button>
        </div>
      </div>

      {/* Grid of Sector Cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-3.5">
        {displayedSectors.map((sector, index) => {
          const isPositive = sector.changePercent >= 0;
          const advanceRatio = sector.totalCount > 0 ? (sector.upCount / sector.totalCount) * 100 : 50;
          const isHiddenOnMobile = index >= mobileVisibleCount;

          return (
            <div
              key={sector.id}
              className={`rounded-2xl p-4 border transition duration-200 flex-col justify-between gap-3 group shadow-lg ${
                isHiddenOnMobile ? "hidden sm:flex" : "flex"
              } ${
                isPositive
                  ? "bg-gradient-to-br from-[#0c1619] to-[#070e13] border-[#152d26] hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-gradient-to-br from-[#160f15] to-[#0d0910] border-[#291720] hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]"
              }`}
            >
              {/* Row 1: Sector Name & Average Change */}
              <div className="flex items-start justify-between gap-2">
                <span
                  title={sector.name}
                  className="text-xs sm:text-[13px] font-bold text-gray-100 group-hover:text-white transition leading-snug line-clamp-1"
                >
                  {sector.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                    isPositive
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {sector.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Row 2: Advance vs Decline Breadth Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span className="text-emerald-400 font-semibold">{sector.upCount} up</span>
                  <span className="text-gray-500">of {sector.totalCount}</span>
                  <span className="text-rose-400 font-semibold">{sector.downCount} down</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#121c2c] overflow-hidden flex">
                  <div
                    style={{ width: `${advanceRatio}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                  <div
                    style={{ width: `${100 - advanceRatio}%` }}
                    className="h-full bg-rose-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Row 3: Top Performer Stock Pill */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">{SECTOR_MOVES_CONFIG.bestPrefix}</span>
                {onSelectStock ? (
                  <button
                    type="button"
                    onClick={() => onSelectStock(sector.bestStock)}
                    className="font-mono text-gray-200 hover:text-emerald-300 transition font-bold cursor-pointer flex items-center gap-1 group/btn"
                    title={`Open ${sector.bestStock} chart`}
                  >
                    <span className="underline decoration-dotted">{sector.bestStock}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      +{sector.bestStockChange > 0 ? sector.bestStockChange.toFixed(1) : "0"}%
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/chart?symbol=${encodeURIComponent(sector.bestStock)}`}
                    className="font-mono text-gray-200 hover:text-emerald-300 transition font-bold flex items-center gap-1 group/btn"
                    title={`Open ${sector.bestStock} chart`}
                  >
                    <span className="underline decoration-dotted">{sector.bestStock}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      +{sector.bestStockChange > 0 ? sector.bestStockChange.toFixed(1) : "0"}%
                    </span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Load More Controls (Only shown on mobile viewports < sm) */}
      <div className="mt-4 pt-3 border-t border-[#131d2c] flex sm:hidden flex-col items-center justify-center gap-2">
        {hasMoreMobile ? (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full py-2.5 px-4 rounded-xl border border-[#1e2e44] bg-[#0c1422] hover:bg-[#142136] active:bg-[#182842] text-emerald-400 hover:text-emerald-300 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            aria-label="Load more sectors"
          >
            {isLoadingMore ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading next 8 cards...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono font-bold">
                  +{Math.min(8, displayedSectors.length - mobileVisibleCount)}
                </span>
              </>
            )}
          </button>
        ) : displayedSectors.length > 8 ? (
          <div className="flex items-center justify-between w-full text-xs font-mono text-gray-500">
            <span>All {displayedSectors.length} sectors loaded</span>
            <button
              type="button"
              onClick={() => setMobileVisibleCount(8)}
              className="text-gray-400 hover:text-white underline cursor-pointer text-[11px]"
            >
              Show less
            </button>
          </div>
        ) : null}

        {hasMoreMobile && (
          <span className="text-[11px] font-mono text-gray-400">
            Showing{" "}
            <span className="text-white font-semibold">
              {Math.min(mobileVisibleCount, displayedSectors.length)}
            </span>{" "}
            of <span className="text-white font-semibold">{displayedSectors.length}</span> sectors
          </span>
        )}
      </div>
    </section>
  );
};

export default SectorMovesSection;
