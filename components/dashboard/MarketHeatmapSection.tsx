"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  HeatmapStock,
  HeatmapSector,
  MarketHeatmapResponse,
  TreemapTile,
  MarketHeatmapSectionProps,
} from "@/types/MarketHeatmap";
import {
  HEATMAP_TEXT_CONFIG,
  getTileBackgroundColor,
} from "@/constants/MarketHeatmap";
import { computeTreemapLayout } from "@/lib/treemapLayout";

export const MarketHeatmapSection: React.FC<MarketHeatmapSectionProps> = ({
  onSelectStock: parentOnSelectStock,
  selectedStockSymbol = null,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<"all" | "top">("all");
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>("ALL");
  const [hoveredTile, setHoveredTile] = useState<{
    stock: HeatmapStock;
    clientX: number;
    clientY: number;
    rect: DOMRect | null;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real market heatmap from API route
  const {
    data: heatmapData,
    isLoading,
    isError,
    refetch,
  } = useQuery<MarketHeatmapResponse>({
    queryKey: ["market-heatmap"],
    queryFn: async () => {
      const res = await fetch("/api/market/heatmap");
      if (!res.ok) {
        throw new Error("Failed to load real market heatmap data.");
      }
      return res.json();
    },
    staleTime: 60000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });

  const sectors = heatmapData?.sectors || [];
  const topSectorLeaders = heatmapData?.topSectorLeaders || [];

  // Filter sectors according to view mode and sector filter
  const displayedSectors = useMemo(() => {
    let list = sectors;
    if (selectedSectorFilter !== "ALL") {
      list = list.filter((s) => s.id === selectedSectorFilter || s.name === selectedSectorFilter);
    }

    if (activeViewMode === "top") {
      // In "Top in Each Sector" view, display only the top stock for each sector
      return list.map((sector) => ({
        ...sector,
        stocks: [sector.topStock],
      }));
    }

    return list;
  }, [sectors, selectedSectorFilter, activeViewMode]);

  // Sector dictionary for fast grid area placement
  const sectorMap = useMemo(() => {
    const map = new Map<string, HeatmapSector>();
    for (const sec of displayedSectors) {
      map.set(sec.id, sec);
    }
    return map;
  }, [displayedSectors]);

  // Compute treemap layout for each sector
  const sectorTreemaps = useMemo(() => {
    const map = new Map<string, TreemapTile[]>();
    for (const sector of displayedSectors) {
      const tiles = computeTreemapLayout(sector.stocks, 100, 100);
      map.set(sector.id, tiles);
    }
    return map;
  }, [displayedSectors]);

  // Handle stock click: goes directly to the chart tab
  const handleStockClick = (stock: HeatmapStock) => {
    // Update browser URL query param with slug (e.g. ?stock=coalindia)
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("stock", stock.slug);
      window.history.pushState({}, "", url.toString());
    } catch {
      // Ignore
    }

    parentOnSelectStock?.(stock);
  };

  // Render an individual sector block inside the contiguous grid
  const renderSectorBlock = (sectorId: string) => {
    const sector = sectorMap.get(sectorId);
    if (!sector) return null;

    const tiles = sectorTreemaps.get(sector.id) || [];

    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#070b13] relative select-none">
        {/* Sector title header in upper left corner */}
        <div className="flex items-center justify-between px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wider select-none shrink-0 border-b border-[#0f1724]">
          <span className="truncate">{sector.name}</span>
        </div>

        {/* Squarified Tiles Container */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {tiles.map((tile) => {
            const isTileSelected = selectedStockSymbol === tile.symbol;
            const isHovered = hoveredTile?.stock.symbol === tile.symbol;
            const bgColor = getTileBackgroundColor(tile.changePercent);

            const isSmallTile = tile.width < 28 || tile.height < 28;
            const displaySymbol =
              isSmallTile && tile.symbol.length > 5
                ? `${tile.symbol.slice(0, 4)}...`
                : tile.symbol;

            return (
              <div
                key={tile.symbol}
                onClick={() => handleStockClick(tile)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredTile({
                    stock: tile,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    rect,
                  });
                }}
                onMouseLeave={() => setHoveredTile(null)}
                style={{
                  left: `${tile.x}%`,
                  top: `${tile.y}%`,
                  width: `${tile.width}%`,
                  height: `${tile.height}%`,
                  backgroundColor: bgColor,
                }}
                className={`absolute box-border p-1 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-75 overflow-hidden ${
                  isHovered
                    ? "outline outline-2 outline-white z-30 shadow-2xl brightness-125 scale-[1.01]"
                    : isTileSelected
                    ? "outline outline-2 outline-emerald-400 z-20 shadow-lg"
                    : "border-[0.5px] border-[#070b13]/90 hover:brightness-110"
                }`}
              >
                {/* Stock Symbol */}
                <span className="text-white font-bold text-[9px] sm:text-[11px] leading-tight tracking-tight truncate max-w-full font-mono">
                  {displaySymbol}
                </span>

                {/* Change Percentage */}
                {!isSmallTile && (
                  <span
                    className={`text-[8px] sm:text-[10px] font-mono font-semibold mt-0.5 leading-none ${
                      tile.changePercent >= 0 ? "text-emerald-200" : "text-rose-200"
                    }`}
                  >
                    {tile.changePercent >= 0 ? "+" : ""}
                    {tile.changePercent.toFixed(1)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={containerRef}
      className="w-full bg-[#080d16] border border-[#162235] rounded-3xl p-4 sm:p-6 shadow-2xl relative"
    >
      {/* Top Header matching screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#121c2c]">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {HEATMAP_TEXT_CONFIG.heading}
            </h2>
            <span className="text-xs sm:text-sm text-gray-400 font-normal">
              {HEATMAP_TEXT_CONFIG.subheading}
            </span>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* All Stocks vs Top in Each Sector Toggle */}
          <div className="flex items-center gap-1 bg-[#0c1420] p-1 rounded-xl border border-[#18263a]">
            <button
              type="button"
              onClick={() => setActiveViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeViewMode === "all"
                  ? "bg-[#1d2b40] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {HEATMAP_TEXT_CONFIG.allTabLabel}
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("top")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeViewMode === "top"
                  ? "bg-[#1d2b40] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ★ {HEATMAP_TEXT_CONFIG.topSectorTabLabel}
            </button>
          </div>

          {/* Sector Filter Dropdown */}
          <select
            value={selectedSectorFilter}
            onChange={(e) => setSelectedSectorFilter(e.target.value)}
            className="bg-[#0c1420] text-gray-300 border border-[#18263a] rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All 16 Sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 rounded-xl bg-[#0c1420] hover:bg-[#131e30] border border-[#18263a] text-gray-400 hover:text-white text-xs transition cursor-pointer"
            title="Refresh real-time market data"
          >
            ↻
          </button>
        </div>
      </div>

      {/* "Top in each sector" - Sector Leaders Quick Bar */}
      {topSectorLeaders.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5 px-1">
            <span className="font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <span>🏆</span>
              <span>Top Leaders by Sector (Traded Turnover)</span>
            </span>
            <span className="text-gray-500 text-[10px]">Click any stock to open chart tab</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-800">
            {topSectorLeaders.map((leader) => {
              const isGain = leader.changePercent >= 0;
              return (
                <button
                  key={leader.symbol}
                  type="button"
                  onClick={() => handleStockClick(leader)}
                  className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono transition shrink-0 cursor-pointer border bg-[#0c1320] hover:bg-[#131e30] border-[#182538] text-gray-200"
                >
                  <span className="font-bold">{leader.symbol}</span>
                  <span
                    className={`font-semibold ${
                      isGain ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isGain ? "+" : ""}
                    {leader.changePercent.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-gray-500">
                    ₹{leader.turnoverCr}Cr
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="w-full h-[580px] rounded-2xl bg-[#0b121e]/80 border border-[#141e2e] animate-pulse mt-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-xs text-gray-400 font-mono">Loading real market sector grid...</span>
          </div>
        </div>
      )}

      {/* Error View */}
      {isError && (
        <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl my-6">
          <p className="text-rose-300 text-sm font-medium">
            Failed to connect to real-time market heatmap service.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 rounded-xl bg-rose-900 text-rose-100 text-xs font-semibold transition hover:bg-rose-800"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ONE PARENT DIV: Contiguous Master Treemap Grid (Matching User's Reference Screenshot) */}
      {!isLoading && !isError && (
        <div className="w-full rounded-2xl overflow-hidden border border-[#162337] bg-[#05080e] mt-4 shadow-inner">
          {/* Desktop Layout (>= 1024px): Seamless Multi-Column Sector Mosaic */}
          <div className="hidden lg:grid grid-cols-12 h-[580px] w-full gap-[2px] bg-[#121c2c]">
            {/* Column 1: Financial Services (cols 1-3: ~26% width, spans full height) */}
            <div className="col-span-3 h-full bg-[#070b13] flex flex-col overflow-hidden">
              {renderSectorBlock("financial-services")}
            </div>

            {/* Column 2: Capital Goods (top 55%) + IT (bottom 45%) (cols 4-5) */}
            <div className="col-span-2 h-full flex flex-col gap-[2px] bg-[#121c2c]">
              <div className="h-[55%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("capital-goods")}
              </div>
              <div className="h-[45%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("it")}
              </div>
            </div>

            {/* Column 3: Metals & Mining (top 52%) + Auto (bottom 48%) (cols 6-7) */}
            <div className="col-span-2 h-full flex flex-col gap-[2px] bg-[#121c2c]">
              <div className="h-[52%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("metals-mining")}
              </div>
              <div className="h-[48%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("auto")}
              </div>
            </div>

            {/* Column 4: Healthcare (top 40%) + Power (mid 28%) + Oil & Gas (bottom 32%) (cols 8-9) */}
            <div className="col-span-2 h-full flex flex-col gap-[2px] bg-[#121c2c]">
              <div className="h-[40%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("healthcare")}
              </div>
              <div className="h-[28%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("power")}
              </div>
              <div className="h-[32%] bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock("oil-gas")}
              </div>
            </div>

            {/* Column 5: Right Multi-Sector Column (cols 10-12: ~26% width) */}
            <div className="col-span-3 h-full flex flex-col gap-[2px] bg-[#121c2c]">
              {/* Row 1: Consumer Services (left) & FMCG (right) */}
              <div className="h-[28%] grid grid-cols-2 gap-[2px] bg-[#121c2c]">
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("consumer-services")}
                </div>
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("fmcg")}
                </div>
              </div>

              {/* Row 2: Telecom (left) & Services (right) */}
              <div className="h-[24%] grid grid-cols-2 gap-[2px] bg-[#121c2c]">
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("telecom")}
                </div>
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("services")}
                </div>
              </div>

              {/* Row 3: Realty (left) & Consumer Durables (right) */}
              <div className="h-[24%] grid grid-cols-2 gap-[2px] bg-[#121c2c]">
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("realty")}
                </div>
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("consumer-durables")}
                </div>
              </div>

              {/* Row 4: Chemicals (left) & Infra & Materials (right) */}
              <div className="h-[24%] grid grid-cols-2 gap-[2px] bg-[#121c2c]">
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("chemicals")}
                </div>
                <div className="bg-[#070b13] flex flex-col overflow-hidden">
                  {renderSectorBlock("infra-materials")}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Responsive Fallback (< 1024px) */}
          <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 gap-[2px] bg-[#121c2c]">
            {displayedSectors.map((sector) => (
              <div key={sector.id} className="h-56 bg-[#070b13] flex flex-col overflow-hidden">
                {renderSectorBlock(sector.id)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip (Image 2 Replica: e.g. "COALINDIA · -1.24% · ₹223 Cr") */}
      {hoveredTile && hoveredTile.rect && (
        <div
          style={{
            position: "fixed",
            left: `${Math.min(
              window.innerWidth - 280,
              Math.max(16, hoveredTile.rect.left + hoveredTile.rect.width / 2 - 130)
            )}px`,
            top: `${
              hoveredTile.rect.top > 80
                ? hoveredTile.rect.top - 64
                : hoveredTile.rect.bottom + 10
            }px`,
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="bg-[#0b1320] border-2 border-white text-white rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center min-w-[220px]"
        >
          {/* Main Badge matching Screenshot 2: "SYMBOL · % · ₹... Cr" */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-tight">
            <span>{hoveredTile.stock.symbol}</span>
            <span>·</span>
            <span
              className={
                hoveredTile.stock.changePercent >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }
            >
              {hoveredTile.stock.changePercent >= 0 ? "+" : ""}
              {hoveredTile.stock.changePercent.toFixed(2)}%
            </span>
            <span>·</span>
            <span className="text-gray-100 font-semibold">
              ₹{hoveredTile.stock.turnoverCr} Cr
            </span>
          </div>

          {/* Subtitle with live price and prompt to click */}
          <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
            <span>LTP: ₹{hoveredTile.stock.price.toLocaleString("en-IN")}</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Click to open chart tab</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarketHeatmapSection;
