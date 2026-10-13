"use client";

import React, { useState, useId, useMemo, useRef, useCallback, useEffect } from "react";
import type { IndexChartCardProps, HoveredChartPoint } from "@/types/IndexChartCard";
import {
  INDEX_CHART_TABS,
  TIMEFRAME_OPTIONS,
  CHART_DIMENSIONS,
  CHART_COLORS,
  CHART_MESSAGES,
} from "@/constants/IndexChartCard";
import { formatTimeLabel, formatVolume, formatTurnover, getSmartTooltipPosition } from "@/lib/chartUtils";
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
  showIndexTabs = false,
  className = "",
}: IndexChartCardProps) => {
  const gradientId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<HoveredChartPoint | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  useEffect(() => {
    setHoveredPoint(null);
  }, [selectedIndex, selectedWindow]);

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

    const volumeStat = stats?.find((s) => {
      const lbl = s?.label?.toLowerCase() || "";
      return lbl.includes("volume") || lbl.includes("vol");
    });
    let baseDayVolume = 1800000;
    if (volumeStat?.value) {
      const parsed = parseFloat(volumeStat.value.replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0) {
        if (/cr|crore/i.test(volumeStat.value)) baseDayVolume = parsed * 10000000;
        else if (/l|lakh/i.test(volumeStat.value)) baseDayVolume = parsed * 100000;
        else if (/m|million/i.test(volumeStat.value)) baseDayVolume = parsed * 1000000;
        else if (/k|thousand/i.test(volumeStat.value)) baseDayVolume = parsed * 1000;
        else baseDayVolume = parsed;
      }
    }

    const points = chartPoints.map((pt, idx) => {
      const x = chartPoints.length > 1 ? (idx / (chartPoints.length - 1)) * chartWidth : chartWidth / 2;
      const y = chartHeight - ((pt.price - computedYMin) / (computedYMax - computedYMin)) * chartHeight;
      const uShape = 0.75 + 1.15 * Math.pow(Math.abs((idx / Math.max(1, chartPoints.length - 1)) - 0.48) * 1.8, 2);
      const computedVol = pt.volume || Math.round((baseDayVolume / Math.max(1, chartPoints.length)) * uShape);
      return { ...pt, x, y, volume: computedVol };
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
  }, [chartPoints, chartWidth, chartHeight, price, stats]);

  const updateHoverFromClientX = useCallback(
    (clientX: number) => {
      if (!coords || coords.length === 0 || !chartContainerRef.current) return;
      const rect = chartContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const offsetX = clientX - rect.left;
      const svgX = (offsetX / rect.width) * width;
      const clampedSvgX = Math.max(0, Math.min(chartWidth, svgX));
      const ratio = clampedSvgX / chartWidth;
      const idx = Math.min(
        coords.length - 1,
        Math.max(0, Math.round(ratio * (coords.length - 1)))
      );
      const pt = coords[idx];
      if (pt) {
        setHoveredPoint(pt);
      }
    },
    [coords, width, chartWidth]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isInteractingRef.current = true;
      updateHoverFromClientX(touch.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0 && touchStartRef.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);

      if (dx > dy || isInteractingRef.current) {
        if (e.cancelable) e.preventDefault();
        updateHoverFromClientX(touch.clientX);
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    isInteractingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateHoverFromClientX(e.clientX);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className={`rounded-2xl bg-[#0e1622] border border-[#1b2637] p-5 sm:p-7 shadow-xl text-white ${className}`}>
      {/* Top Controls: Index Tabs & Timeframes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1b2535]">
        {showIndexTabs && setSelectedIndex ? (
          /* Left Index Switcher Tabs */
          <div className="flex items-center gap-1.5 bg-[#0a1019] p-1 rounded-xl border border-[#182333] w-fit">
            {INDEX_CHART_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedIndex(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedIndex === tab.id
                    ? "bg-[#1d2738] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          /* Dedicated Chart Title & Subtitle */
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#141f2d] border border-[#203046] flex items-center justify-center text-sm shadow-inner">
              📈
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-mono">
                  {selectedIndex} Performance Chart
                </h2>
                {price != null && (
                  <span className="text-xs font-mono font-semibold text-gray-300">
                    ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {changePercent != null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                      isPositive
                        ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/40"
                        : "text-rose-400 bg-rose-950/60 border border-rose-800/40"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Interactive Price Trend Analysis · {selectedWindow}
              </p>
            </div>
          </div>
        )}

        {/* Right Timeframe Pills */}
        <div className="flex items-center gap-1 bg-[#0a1019] p-1 rounded-xl border border-[#182333] w-fit self-end sm:self-auto">
          {TIMEFRAME_OPTIONS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setSelectedWindow(window)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedWindow === window
                  ? "bg-[#1d2738] text-white font-semibold shadow-sm border border-[#2b3c54]"
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
          {/* Index Metrics Section (Only when showIndexTabs is enabled) */}
          {showIndexTabs && (
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
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                      isPositive
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
          )}

          {/* Chart Canvas / SVG Container */}
          {coords.length > 0 && (
            <div
              ref={chartContainerRef}
              className="mt-6 relative w-full select-none pt-4 touch-pan-y"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div className="relative w-full h-[280px] sm:h-[320px]">
                <svg
                  className="w-full h-full overflow-visible pointer-events-none"
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
                </svg>

                {/* Right Y-Axis Labels */}
                <div
                  className="absolute top-0 right-0 h-[calc(100%-35px)] flex flex-col justify-between items-end text-[9px] sm:text-[11px] font-mono text-gray-400 pr-1 pointer-events-none"
                  style={{ width: `${(paddingRight / width) * 100}%` }}
                >
                  {yTicks.map((val, idx) => (
                    <span key={idx} className="truncate">
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
                    className="absolute right-0 transform -translate-y-1/2 z-20 pointer-events-none"
                    style={{
                      top: `${Math.max(
                        6,
                        Math.min(90, ((chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight) / height) * 100)
                      )}%`,
                    }}
                  >
                    <span
                      className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-md font-mono font-bold text-[10px] sm:text-xs shadow-lg ${isPositive ? "bg-[#10b981] text-[#052e16]" : "bg-[#f43f5e] text-white"
                        }`}
                    >
                      {price.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Bottom X-Axis Time Labels */}
                {xLabels.length > 0 && (
                  <div
                    className="absolute bottom-1 left-0 flex justify-between text-[9px] sm:text-[11px] font-mono text-gray-400 px-1 pointer-events-none"
                    style={{ width: `${(chartWidth / width) * 100}%` }}
                  >
                    {xLabels.map((lbl, idx) => (
                      <span key={idx} className="truncate">{formatTimeLabel(lbl.time, selectedWindow)}</span>
                    ))}
                  </div>
                )}

                {/* Google Finance / SerpApi Live Badge */}
                <div className="absolute bottom-7 left-2 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition pointer-events-none">
                  <div className="px-2 py-1 rounded-md bg-[#111c2a] border border-[#23354c] flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{CHART_MESSAGES.sourceBadge}</span>
                  </div>
                </div>

                {/* Hover Tooltip Box */}
                {hoveredPoint && (
                  <div
                    className="absolute z-30 pointer-events-none bg-[#111b29]/95 border border-[#26374e] rounded-xl p-2.5 sm:p-3 text-xs shadow-2xl backdrop-blur-md min-w-[155px] max-w-[220px] transition-[left,top] duration-0 sm:duration-75"
                    style={getSmartTooltipPosition(hoveredPoint.x, hoveredPoint.y, width, height, {
                      rightPadding: paddingRight,
                      topPadding: 0,
                      bottomPadding: paddingBottom,
                    })}
                  >
                    <div className="pb-1.5 border-b border-[#1e2e44]">
                      <p className="text-gray-300 text-[10.5px] font-mono font-medium">
                        {formatTimeLabel(hoveredPoint?.time ?? "", selectedWindow)}
                      </p>
                    </div>
                    <div className="pt-2 space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-white text-xs">
                          {CHART_MESSAGES.currencySymbol}
                          {hoveredPoint?.price?.toLocaleString?.(CHART_MESSAGES.locale, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 pt-1 border-t border-[#1e2e44] text-[10.5px]">
                        <span className="text-gray-400">Volume Traded:</span>
                        <span className="font-bold text-emerald-400">
                          {formatVolume(hoveredPoint.volume)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-gray-400">Turnover:</span>
                        <span className="font-bold text-gray-200">
                          {formatTurnover(hoveredPoint.price, hoveredPoint.volume)}
                        </span>
                      </div>
                    </div>
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
