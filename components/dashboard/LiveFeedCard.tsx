"use client";

import React, { useState, useMemo, useId } from "react";
import type { LiveFeedCardProps } from "@/types/LiveFeedCard";
import type { MoverTab, MoverIndex } from "@/types/MarketSummaryAndMovers";
import { TOP_200_INDIAN_STOCKS } from "@/lib/top200Stocks";
import { formatTimeLabel } from "@/lib/chartUtils";

interface HoveredPoint {
  time: string;
  price: number;
  x: number;
  y: number;
}

const INDEX_OPTIONS = [
  { id: "NIFTY 50", label: "Nifty 50" },
  { id: "NIFTY 100", label: "Nifty 100" },
  { id: "NIFTY 200", label: "Nifty 200" },
];

const TIMEFRAME_OPTIONS = ["1M", "1Y", "5Y"];

const LiveFeedCard: React.FC<LiveFeedCardProps> = ({
  selectedIndex,
  setSelectedIndex,
  selectedWindow = "1M",
  setSelectedWindow,
  price,
  changePercent,
  movement,
  movementValue,
  date,
  chartPoints = [],
  stats = [],
  loading = false,
  watchlist = [],
  onToggleWatchlist,
  onSelectStock,
  className = "",
}) => {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const [moverTab, setMoverTab] = useState<MoverTab>("gainers");

  // Determine active mover index (Nifty 50, 100, or 200)
  const activeMoverIndex: MoverIndex =
    selectedIndex === "NIFTY 100"
      ? "NIFTY 100"
      : selectedIndex === "NIFTY 200"
      ? "NIFTY 200"
      : "NIFTY 50";

  // Compute pool, breadth, sectors, and top movers for the active index
  const {
    pool,
    upCount,
    downCount,
    upRatio,
    downRatio,
    avgChange,
    leadingSector,
    trailingSector,
    moversList,
  } = useMemo(() => {
    let list = TOP_200_INDIAN_STOCKS.slice(0, 50);
    if (activeMoverIndex === "NIFTY 100") {
      list = TOP_200_INDIAN_STOCKS.slice(0, 100);
    } else if (activeMoverIndex === "NIFTY 200") {
      list = TOP_200_INDIAN_STOCKS.slice(0, 200);
    }

    const up = list.filter((s) => (s.changePercent ?? 0) >= 0).length;
    const down = list.filter((s) => (s.changePercent ?? 0) < 0).length;
    const total = list.length || 1;
    const uRatio = Math.round((up / total) * 100);
    const dRatio = 100 - uRatio;

    const totalChange = list.reduce((acc, s) => acc + (s.changePercent ?? 0), 0);
    const avg = Number((totalChange / total).toFixed(2));

    // Sector performance
    const sectorsMap: Record<string, { total: number; count: number }> = {};
    list.forEach((s) => {
      const sec = s.sector || "Other";
      if (!sectorsMap[sec]) sectorsMap[sec] = { total: 0, count: 0 };
      sectorsMap[sec].total += s.changePercent ?? 0;
      sectorsMap[sec].count += 1;
    });

    const sectorAvgs = Object.entries(sectorsMap).map(([sec, data]) => ({
      name: sec,
      avg: Number((data.total / data.count).toFixed(1)),
    }));

    sectorAvgs.sort((a, b) => b.avg - a.avg);

    const leader = sectorAvgs[0] || { name: "IT", avg: 3.2 };
    const trailer = sectorAvgs[sectorAvgs.length - 1] || { name: "Oil & Gas", avg: -0.0 };

    // Top gainers or losers
    let movers = [...list];
    if (moverTab === "gainers") {
      movers.sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
    } else {
      movers.sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0));
    }

    return {
      pool: list,
      upCount: up,
      downCount: down,
      upRatio: uRatio,
      downRatio: dRatio,
      avgChange: avg,
      leadingSector: leader,
      trailingSector: trailer,
      moversList: movers.slice(0, 5),
    };
  }, [activeMoverIndex, moverTab]);

  // Extract PE ratio from SerpApi stats
  const peValue = useMemo(() => {
    const peStat = stats?.find(
      (s) =>
        s.label?.toLowerCase().includes("p/e") ||
        s.label?.toLowerCase().includes("pe") ||
        s.label?.toLowerCase().includes("ratio")
    );
    return peStat?.value || "19.3";
  }, [stats]);

  // Fallback demo chart points if SerpApi chart points aren't loaded yet
  const effectiveChartPoints = useMemo(() => {
    if (chartPoints && chartPoints.length > 0) return chartPoints;
    // High-fidelity fallback curve matching the screenshot's trend
    return [
      { time: "8", price: 23550 },
      { time: "10 Sep '26", price: 23477.8 },
      { time: "12", price: 23380 },
      { time: "15", price: 23210 },
      { time: "17", price: 23260 },
      { time: "20", price: 23320 },
      { time: "21", price: 23280 },
      { time: "23", price: 23390 },
      { time: "24", price: 23150 },
      { time: "25", price: 23190 },
      { time: "27", price: 22910 },
      { time: "29", price: 22890 },
      { time: "Oct", price: 22760 },
      { time: "2", price: 22680 },
      { time: "4", price: 22790 },
      { time: "6", price: 22930 },
      { time: "7", price: 22810 },
      { time: "8", price: 22520.45 },
    ];
  }, [chartPoints]);

  // Chart coordinate calculations
  const width = 900;
  const height = 300;
  const paddingRight = 70;
  const paddingBottom = 30;
  const chartWidth = width - paddingRight;
  const chartHeight = height - paddingBottom;

  const isPositive =
    movement === "Up" || (changePercent != null ? changePercent >= 0 : avgChange >= 0);
  // In the screenshot, the downward trendline is red/rose #f43f5e
  const strokeColor = isPositive ? "#10b981" : "#f43f5e";

  const { coords, linePath, areaPath, yMin, yMax, yTicks, xLabels } = useMemo(() => {
    const prices = effectiveChartPoints.map((p) => p.price).filter((p) => !isNaN(p) && p > 0);
    const minP = prices.length ? Math.min(...prices) : 22400;
    const maxP = prices.length ? Math.max(...prices) : 24000;
    const spread = maxP - minP;
    const pad = spread === 0 ? 50 : spread * 0.12;
    const computedYMin = minP - pad;
    const computedYMax = maxP + pad;

    const points = effectiveChartPoints.map((pt, idx) => {
      const x =
        effectiveChartPoints.length > 1
          ? (idx / (effectiveChartPoints.length - 1)) * chartWidth
          : chartWidth / 2;
      const y =
        chartHeight - ((pt.price - computedYMin) / (computedYMax - computedYMin)) * chartHeight;
      return { ...pt, x, y };
    });

    const lPath = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, "");

    const aPath = lPath ? `${lPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : "";

    // Evenly spaced Y ticks
    const step = (computedYMax - computedYMin) / 5;
    const ticks = [
      computedYMax,
      computedYMax - step,
      computedYMax - step * 2,
      computedYMax - step * 3,
      computedYMin + step,
      computedYMin,
    ];

    // Pick 8-10 evenly distributed X labels
    const stepX = Math.max(1, Math.floor(points.length / 9));
    const labels = points.filter((_, idx) => idx % stepX === 0 || idx === points.length - 1);

    return {
      coords: points,
      linePath: lPath,
      areaPath: aPath,
      yMin: computedYMin,
      yMax: computedYMax,
      yTicks: ticks,
      xLabels: labels,
    };
  }, [effectiveChartPoints, chartWidth, chartHeight]);

  // Display price & change
  const currentPriceDisplay = price ?? 22520.45;
  const currentChangeDisplay = changePercent ?? 1.30;
  const currentDateDisplay = date ?? "9 Oct 2026";

  return (
    <div
      className={`w-full rounded-2xl bg-[#090e17] border border-[#141e2d] p-5 sm:p-7 shadow-2xl text-white ${className}`}
    >
      {/* 1. TOP HEADER: Index Pills on Left & Timeframes on Right */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Index Selector Pills */}
        <div className="flex items-center gap-1 bg-[#05080e] p-1 rounded-xl border border-[#121a26]">
          {INDEX_OPTIONS.map((item) => {
            const isActive = selectedIndex === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#182436] text-white shadow-sm border border-[#23354d]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 bg-[#05080e] p-1 rounded-xl border border-[#121a26]">
          {TIMEFRAME_OPTIONS.map((tf) => {
            const isActive = selectedWindow === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedWindow?.(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#182436] text-white shadow-sm border border-[#23354d]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PRICE & CLOSE INFO */}
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
          {currentPriceDisplay.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h1>

        <span
          className={`text-sm sm:text-base font-bold font-mono ${
            currentChangeDisplay >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {currentChangeDisplay >= 0 ? "+" : ""}
          {currentChangeDisplay.toFixed(2)}%
        </span>

        <span className="text-xs text-gray-400 font-medium">
          Official close {currentDateDisplay} · P/E {peValue}
        </span>
      </div>

      {/* 3. ADVANCE / DECLINE RATIO BAR */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium shrink-0">
          <span>Today, its stocks:</span>
          <span className="text-emerald-400 font-semibold">{upCount} up</span>
          <span>·</span>
          <span className="text-rose-400 font-semibold">{downCount} down</span>
          <span className="ml-2 font-mono text-emerald-400 font-semibold">
            avg {avgChange >= 0 ? "+" : ""}
            {avgChange}%
          </span>
        </div>

        {/* Dual-color Progress Ratio Bar */}
        <div className="h-1.5 flex-1 min-w-[140px] max-w-[650px] bg-[#141d2a] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${upRatio}%` }}
            className="bg-emerald-400 h-full transition-all duration-500 rounded-l-full"
            title={`${upCount} stocks up (${upRatio}%)`}
          />
          <div
            style={{ width: `${downRatio}%` }}
            className="bg-rose-500 h-full transition-all duration-500 rounded-r-full"
            title={`${downCount} stocks down (${downRatio}%)`}
          />
        </div>
      </div>

      {/* 4. THE CHART IN ANOTHER DIV TO DIFFERENTIATE */}
      <div className="my-6 relative w-full rounded-2xl bg-[#060a12]/80 border border-[#131d2b] p-3 sm:p-5 select-none overflow-hidden">
        <div className="relative w-full h-[280px] sm:h-[320px]">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Shaded Area Under Curve */}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {/* Main Price Trendline */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair & Dot Indicator */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={0}
                  x2={hoveredPoint.x}
                  y2={chartHeight}
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="4.5"
                  fill={strokeColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Transparent Interactive Mouse Overlay Columns */}
            {coords.map((pt, idx) => {
              const colWidth = chartWidth / coords.length;
              return (
                <rect
                  key={idx}
                  x={pt.x - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      time: pt.time,
                      price: pt.price,
                      x: pt.x,
                      y: pt.y,
                    })
                  }
                />
              );
            })}
          </svg>

          {/* Bottom-Left: TradingView Stylized Watermark Logo */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition pointer-events-none">
            <svg
              className="w-7 h-4 text-gray-300"
              viewBox="0 0 36 28"
              fill="currentColor"
              aria-label="TradingView"
            >
              <path d="M14 22H7V6h7v16zM0 16h5v6H0v-6zM28 22h-7V10h7v12zM36 4h-5v18h5V4z" />
            </svg>
          </div>

          {/* Bottom X-Axis Date Labels */}
          <div
            className="absolute bottom-0 left-0 flex justify-between text-[11px] font-mono text-gray-500 pointer-events-none"
            style={{ width: `${(chartWidth / width) * 100}%` }}
          >
            {xLabels.map((lbl, idx) => (
              <span key={idx} className="truncate">
                {lbl.time}
              </span>
            ))}
          </div>

          {/* Right Y-Axis Price Levels */}
          <div
            className="absolute top-0 right-0 h-full flex flex-col justify-between items-end text-[11px] font-mono text-gray-400 pointer-events-none pr-1"
            style={{ width: `${(paddingRight / width) * 100}%` }}
          >
            {yTicks.map((val, idx) => (
              <span key={idx}>
                {val.toFixed(2)}
              </span>
            ))}

            {/* Current Price Active Highlight Pill */}
            <div
              className={`absolute right-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-md ${
                isPositive ? "bg-emerald-600" : "bg-rose-600"
              }`}
              style={{
                top: `${
                  coords.length > 0
                    ? ((coords[coords.length - 1].y) / chartHeight) * 85
                    : 75
                }%`,
              }}
            >
              {currentPriceDisplay.toFixed(2)}
            </div>
          </div>

          {/* Hover Time Pill Badge at Crosshair Base */}
          {hoveredPoint && (
            <div
              className="absolute bottom-1 transform -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded bg-[#162335] border border-[#2b3e58] text-[11px] font-mono text-white shadow-xl"
              style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
            >
              <span>{formatTimeLabel(hoveredPoint.time, selectedWindow)}</span>
              <span className="ml-1.5 text-emerald-400 font-bold">
                ₹{hoveredPoint.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM SECTION: Commentary on Left & TOP MOVERS on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-5 border-t border-[#121c2c] items-start">
        {/* Left Column: Broad Market Commentary */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-2 pt-1">
          <p className="text-xs sm:text-sm font-semibold text-gray-200 leading-relaxed">
            Broad buying in the {activeMoverIndex.replace("NIFTY", "Nifty")}:{" "}
            <span className="text-emerald-400">{upCount} up</span>,{" "}
            <span className="text-rose-400">{downCount} down</span>; the average stock is{" "}
            <span className={avgChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {avgChange >= 0 ? "+" : ""}
              {avgChange}%
            </span>
            .
          </p>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
            <span className="text-gray-200">{leadingSector.name}</span> leads (+
            {leadingSector.avg}%);{" "}
            <span className="text-gray-200">{trailingSector.name}</span> trails (
            {trailingSector.avg >= 0 ? "+" : ""}
            {trailingSector.avg}%).
          </p>
        </div>

        {/* Right Column: TOP MOVERS */}
        <div className="lg:col-span-7">
          {/* Header with Title on Left & Gainers/Losers Toggle on Right */}
          <div className="flex items-center justify-between pb-3 border-b border-[#141f2f]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              TOP MOVERS · {activeMoverIndex}
            </h2>

            <div className="flex items-center bg-[#05080e] p-0.5 rounded-lg border border-[#121a26]">
              <button
                type="button"
                onClick={() => setMoverTab("gainers")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  moverTab === "gainers"
                    ? "bg-[#182436] text-white shadow-sm border border-[#23354d]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Gainers
              </button>
              <button
                type="button"
                onClick={() => setMoverTab("losers")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  moverTab === "losers"
                    ? "bg-[#182436] text-white shadow-sm border border-[#23354d]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Losers
              </button>
            </div>
          </div>

          {/* Movers Rows matching screenshot */}
          <div className="divide-y divide-[#121c2b] mt-1">
            {moversList.map((stock) => {
              const isStockPositive = (stock.changePercent ?? 0) >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock?.(stock.symbol)}
                  className="flex items-center justify-between py-2.5 px-1 sm:px-2 hover:bg-[#0e1624] rounded-xl transition cursor-pointer group"
                >
                  {/* Left: Symbol & Full Company Name */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-bold text-xs sm:text-sm text-white font-mono w-24 sm:w-28 group-hover:text-emerald-400 transition shrink-0">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-gray-400 font-medium truncate max-w-[130px] sm:max-w-[200px]">
                      {stock.name}
                    </span>
                  </div>

                  {/* Right: Price & Change Percent */}
                  <div className="flex items-center gap-4 text-right font-mono flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {stock.price.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={`text-xs font-bold w-16 text-right ${
                        isStockPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isStockPositive ? "+" : ""}
                      {stock.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeedCard;
