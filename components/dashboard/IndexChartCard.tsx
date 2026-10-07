"use client";

import React from "react";
import { useState, useId, useMemo } from "react";
import type { IndexChartCardProps, HoveredChartPoint } from "@/types/IndexChartCard";
import {
  INDEX_CHART_TABS,
  TIMEFRAME_OPTIONS,
  CHART_DIMENSIONS,
  CHART_COLORS,
  CHART_MESSAGES,
} from "@/constants/IndexChartCard";
import { formatTimeLabel } from "@/lib/chartUtils";
import InvestmentQuotesLoading from "@/components/dashboard/InvestmentQuotesLoading";

const IndexChartCard = ({
  selectedIndex,
  setSelectedIndex,
  selectedWindow,
  setSelectedWindow,
  price,
  changePercent,
  movement,
  movementValue,
  date,
  chartPoints = [],
  stats = [],
  loading = false,
}: IndexChartCardProps) => {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<HoveredChartPoint | null>(null);

  const hasData = price != null || chartPoints.length > 0;
  const isPositive = movement === "Up" || (changePercent != null && changePercent >= 0);
  const strokeColor = isPositive ? CHART_COLORS.positive : CHART_COLORS.negative;
  const stopColor = isPositive ? CHART_COLORS.positive : CHART_COLORS.negative;

  const width = CHART_DIMENSIONS.width;
  const height = CHART_DIMENSIONS.height;
  const paddingRight = CHART_DIMENSIONS.paddingRight;
  const paddingBottom = CHART_DIMENSIONS.paddingBottom;
  const chartWidth = width - paddingRight;
  const chartHeight = height - paddingBottom;

  // Dynamic scale computation based strictly on real SerpApi points
  const { coords, linePath, areaPath, yMin, yMax, yTicks, xLabels } = useMemo(() => {
    if (!chartPoints.length) {
      return {
        coords: [],
        linePath: "",
        areaPath: "",
        yMin: 0,
        yMax: 1,
        yTicks: [],
        xLabels: [],
      };
    }

    const prices = chartPoints.map((p) => p.price).filter((p) => !isNaN(p) && p > 0);
    const minP = prices.length ? Math.min(...prices) : (price ?? 0);
    const maxP = prices.length ? Math.max(...prices) : (price ?? 0);
    const spread = maxP - minP;
    const pad = spread === 0 ? maxP * 0.01 || 10 : spread * 0.08;
    const computedYMin = minP - pad;
    const computedYMax = maxP + pad;

    const points = chartPoints.map((pt, idx) => {
      const x = chartPoints.length > 1 ? (idx / (chartPoints.length - 1)) * chartWidth : chartWidth / 2;
      const y = chartHeight - ((pt.price - computedYMin) / (computedYMax - computedYMin)) * chartHeight;
      return { ...pt, x, y };
    });

    const lPath = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, "");

    const aPath = lPath ? `${lPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z` : "";

    const ticks = [
      computedYMax - pad * 0.5,
      computedYMin + (computedYMax - computedYMin) * 0.66,
      computedYMin + (computedYMax - computedYMin) * 0.33,
      computedYMin + pad * 0.5,
    ];

    const labels =
      points.length >= 2
        ? [
          points[0],
          points[Math.floor(points.length * 0.25)],
          points[Math.floor(points.length * 0.5)],
          points[Math.floor(points.length * 0.75)],
          points[points.length - 1],
        ]
        : [];

    return {
      coords: points,
      linePath: lPath,
      areaPath: aPath,
      yMin: computedYMin,
      yMax: computedYMax,
      yTicks: ticks,
      xLabels: labels,
    };
  }, [chartPoints, chartWidth, chartHeight, price]);

  return (
    <div className="rounded-2xl bg-[#0e1622] border border-[#1b2637] p-5 sm:p-7 shadow-xl text-white">
      {/* Top Controls: Index Tabs & Timeframes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1b2535]">
        {/* Left Index Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0a1019] p-1 rounded-xl border border-[#182333] w-fit">
          {INDEX_CHART_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedIndex(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedIndex === tab.id
                  ? "bg-[#1d2738] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Timeframe Pills */}
        <div className="flex items-center gap-1 bg-[#0a1019] p-1 rounded-xl border border-[#182333] w-fit self-end sm:self-auto">
          {TIMEFRAME_OPTIONS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setSelectedWindow(window)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${selectedWindow === window
                  ? "bg-[#1d2738] text-white font-semibold shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-2">
          <InvestmentQuotesLoading />
        </div>
      ) : !hasData ? (
        /* If no data, show clean empty message */
        <div className="py-24 text-center">
          <p className="text-sm text-gray-400">
            {CHART_MESSAGES.noDataPrefix}{selectedIndex}.
          </p>
        </div>
      ) : (
        <>
          {/* Index Metrics Section */}
          <div className="pt-6">
            <div className="flex flex-wrap items-baseline gap-3">
              {price != null && (
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {price.toLocaleString(CHART_MESSAGES.locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h1>
              )}

              {changePercent != null && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${isPositive
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                      : "bg-rose-950/80 text-rose-400 border-rose-800/60"
                    }`}
                >
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%
                  {movementValue != null && (
                    <span className="ml-1 opacity-80">
                      ({movementValue >= 0 ? "+" : ""}
                      {movementValue.toFixed(2)})
                    </span>
                  )}
                </span>
              )}

              {date && <span className="text-xs text-gray-400">{date}</span>}
            </div>

            {/* Real Stats Grid from SerpApi knowledge_graph */}
            {stats && (stats?.length ?? 0) > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-[#172233]">
                {stats?.map?.((s) => (
                  <div
                    key={s?.label}
                    className="px-2.5 py-1 rounded-lg bg-[#0a1019] border border-[#182333] flex items-center gap-1.5"
                  >
                    <span className="text-[11px] text-gray-400">{s?.label}:</span>
                    <span className="text-xs font-mono font-semibold text-white">{s?.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart Canvas / SVG Container */}
          {coords.length > 0 && (
            <div className="mt-6 relative w-full overflow-x-auto select-none pt-4">
              <div className="relative min-w-[700px] w-full h-[320px]">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stopColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={stopColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {yTicks.map((level, idx) => {
                    const y = chartHeight - ((level - yMin) / (yMax - yMin)) * chartHeight;
                    return (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke={CHART_COLORS.gridLine}
                        strokeWidth="1"
                        strokeDasharray={CHART_COLORS.gridDash}
                      />
                    );
                  })}

                  {/* Area Fill */}
                  {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

                  {/* Main Trendline */}
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

                  {/* Interactive Crosshair & Hover Node */}
                  {hoveredPoint && (
                    <g>
                      <line
                        x1={hoveredPoint.x}
                        y1="0"
                        x2={hoveredPoint.x}
                        y2={chartHeight}
                        stroke={strokeColor}
                        strokeWidth="1"
                        strokeDasharray={CHART_COLORS.crosshairDash}
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="5"
                        fill={strokeColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* Invisible hover overlay zones */}
                  {coords.map((pt, i) => (
                    <rect
                      key={i}
                      x={pt.x - Math.max(2, chartWidth / coords.length / 2)}
                      y="0"
                      width={Math.max(4, chartWidth / coords.length)}
                      height={chartHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-crosshair"
                    />
                  ))}
                </svg>

                {/* Right Y-Axis Labels */}
                <div className="absolute top-0 right-0 h-[265px] w-[90px] flex flex-col justify-between text-[11px] font-mono text-gray-400 pl-2">
                  {yTicks.map((val, idx) => (
                    <span key={idx} className="text-gray-400">
                      {val.toLocaleString(CHART_MESSAGES.locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ))}
                </div>

                {/* Current Price Pill on Right Axis */}
                {price != null && (
                  <div
                    className="absolute right-0 transform -translate-y-1/2 z-20"
                    style={{
                      top: `${Math.max(
                        10,
                        Math.min(chartHeight - 10, chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight)
                      )}px`,
                    }}
                  >
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-xs shadow-lg ${isPositive ? "bg-[#10b981] text-[#052e16]" : "bg-[#f43f5e] text-white"
                        }`}
                    >
                      {price.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Bottom X-Axis Time Labels */}
                {xLabels.length > 0 && (
                  <div className="absolute bottom-1 left-0 w-[calc(100%-95px)] flex justify-between text-[11px] font-mono text-gray-400 px-1">
                    {xLabels.map((lbl, idx) => (
                      <span key={idx}>{formatTimeLabel(lbl.time, selectedWindow)}</span>
                    ))}
                  </div>
                )}

                {/* Google Finance / SerpApi Live Badge */}
                <div className="absolute bottom-7 left-2 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
                  <div className="px-2 py-1 rounded-md bg-[#111c2a] border border-[#23354c] flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{CHART_MESSAGES.sourceBadge}</span>
                  </div>
                </div>

                {/* Hover Tooltip Box */}
                {hoveredPoint && (
                  <div
                    className="absolute z-30 pointer-events-none bg-[#111b29] border border-[#26374e] rounded-xl px-3 py-1.5 text-xs shadow-2xl transform -translate-x-1/2 -translate-y-full -mt-2 transition-all"
                    style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}
                  >
                    <p className="text-gray-400 text-[10px] font-mono">
                      {formatTimeLabel(hoveredPoint?.time ?? "", selectedWindow)}
                    </p>
                    <p className="font-bold text-white font-mono">
                      {CHART_MESSAGES.currencySymbol}
                      {hoveredPoint?.price?.toLocaleString?.(CHART_MESSAGES.locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IndexChartCard;
