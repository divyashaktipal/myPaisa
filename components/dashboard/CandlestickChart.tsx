"use client";

import React, { useState, useMemo, useId } from "react";
import type {
  CandlestickChartProps,
  CandleData,
  HoveredCandle,
} from "@/types/CandlestickChart";
import {
  MINIMAL_TIMEFRAMES,
  CANDLESTICK_DIMENSIONS,
  CANDLESTICK_COLORS,
  CANDLESTICK_MESSAGES,
} from "@/constants/CandlestickChart";
import { formatTimeLabel } from "@/lib/chartUtils";
import InvestmentQuotesLoading from "@/components/dashboard/InvestmentQuotesLoading";

const CandlestickChart = ({
  symbol,
  title,
  exchange,
  price,
  changePercent,
  movement,
  movementValue,
  date,
  chartPoints = [],
  selectedWindow,
  setSelectedWindow,
  loading = false,
  onBackToIndices,
}: CandlestickChartProps) => {
  const gradientId = useId();
  const [hoveredCandle, setHoveredCandle] = useState<HoveredCandle | null>(null);
  const [chartMode, setChartMode] = useState<"candles" | "line">("candles");

  const hasData = (price != null && !isNaN(price)) || chartPoints?.length > 0;
  const isPositive = movement === "Up" || (changePercent != null && changePercent >= 0);

  const { width, height, paddingRight, paddingBottom, paddingTop } = CANDLESTICK_DIMENSIONS;
  const chartWidth = width - paddingRight;
  const chartHeight = height - paddingBottom - paddingTop;

  // Build candle data partitioned from SerpApi graph points
  const { candles, yMin, yMax, yTicks, xTimeLabels, linePath, areaPath } = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) {
      return {
        candles: [],
        yMin: 0,
        yMax: 1,
        yTicks: [],
        xTimeLabels: [],
        linePath: "",
        areaPath: "",
      };
    }

    const validPoints = chartPoints
      .filter((pt) => pt?.price != null && !isNaN(pt.price) && pt.price > 0)
      .map((pt) => ({ time: pt?.time ?? "", price: Number(pt.price) }));

    if (validPoints.length === 0) {
      return {
        candles: [],
        yMin: 0,
        yMax: 1,
        yTicks: [],
        xTimeLabels: [],
        linePath: "",
        areaPath: "",
      };
    }

    // Determine target candle count (balanced for width)
    const targetCount = Math.min(36, Math.max(14, Math.floor(validPoints.length / 2)));
    const bucketSize = Math.max(1, validPoints.length / targetCount);

    const generatedCandles: CandleData[] = [];

    for (let i = 0; i < targetCount; i++) {
      const startIndex = Math.floor(i * bucketSize);
      const endIndex = Math.min(validPoints.length, Math.floor((i + 1) * bucketSize));
      const slice = validPoints.slice(startIndex, endIndex);

      if (slice.length === 0) continue;

      const open = slice[0].price;
      const close = slice[slice.length - 1].price;
      const prices = slice.map((p) => p.price);
      let high = Math.max(...prices);
      let low = Math.min(...prices);

      // In case high equals low (single point in bucket), add subtle intra-candle wick
      if (high === low) {
        high = open * 1.0015;
        low = open * 0.9985;
      }

      const isBullish = close >= open;
      const candleChange = open !== 0 ? ((close - open) / open) * 100 : 0;

      generatedCandles.push({
        time: slice[slice.length - 1].time || slice[0].time,
        open,
        high,
        low,
        close,
        isBullish,
        changePercent: candleChange,
        index: generatedCandles.length,
      });
    }

    // Min and Max scales
    const allLows = generatedCandles.map((c) => c.low);
    const allHighs = generatedCandles.map((c) => c.high);
    const minVal = Math.min(...allLows, price ?? Infinity);
    const maxVal = Math.max(...allHighs, price ?? -Infinity);
    const spread = maxVal - minVal;
    const pad = spread === 0 ? maxVal * 0.02 || 5 : spread * 0.07;
    const computedYMin = minVal - pad;
    const computedYMax = maxVal + pad;

    const ticks = [
      computedYMax - pad * 0.4,
      computedYMin + (computedYMax - computedYMin) * 0.66,
      computedYMin + (computedYMax - computedYMin) * 0.33,
      computedYMin + pad * 0.4,
    ];

    // X-Axis time sample labels
    const timeLabels =
      generatedCandles.length >= 2
        ? [
            generatedCandles[0],
            generatedCandles[Math.floor(generatedCandles.length * 0.25)],
            generatedCandles[Math.floor(generatedCandles.length * 0.5)],
            generatedCandles[Math.floor(generatedCandles.length * 0.75)],
            generatedCandles[generatedCandles.length - 1],
          ]
        : [];

    // Line Path for optional Line Mode
    const pointsForLine = generatedCandles.map((c, idx) => {
      const x =
        generatedCandles.length > 1
          ? (idx / (generatedCandles.length - 1)) * chartWidth
          : chartWidth / 2;
      const y =
        paddingTop +
        chartHeight -
        ((c.close - computedYMin) / (computedYMax - computedYMin)) * chartHeight;
      return { x, y };
    });

    const lPath = pointsForLine.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, "");

    const aPath = lPath
      ? `${lPath} L ${chartWidth} ${paddingTop + chartHeight} L 0 ${
          paddingTop + chartHeight
        } Z`
      : "";

    return {
      candles: generatedCandles,
      yMin: computedYMin,
      yMax: computedYMax,
      yTicks: ticks,
      xTimeLabels: timeLabels,
      linePath: lPath,
      areaPath: aPath,
    };
  }, [chartPoints, price, chartWidth, chartHeight, paddingTop]);

  const scaleY = (val: number) => {
    if (yMax <= yMin) return paddingTop + chartHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const candleSlotWidth = candles.length > 0 ? chartWidth / candles.length : 0;
  const candleBodyWidth = Math.max(3, Math.min(18, candleSlotWidth * 0.65));

  const activeCandle = hoveredCandle?.candle ?? (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="rounded-2xl bg-[#0b121c] border border-[#1a2535] p-4 sm:p-6 shadow-2xl text-white">
      {/* Top Header: Stock Meta, Return Button & Minimal Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#182333]">
        {/* Left: Back Button & Stock Identity */}
        <div className="flex items-center gap-3">
          {onBackToIndices && (
            <button
              type="button"
              onClick={onBackToIndices}
              className="px-2.5 py-1.5 rounded-xl bg-[#111c2a] hover:bg-[#182638] border border-[#1e2e42] text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Return to Live Indices (Nifty 50, 100, 200)"
            >
              <span>←</span>
              <span>{CANDLESTICK_MESSAGES.backToIndices}</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono text-white">
                {symbol}
              </span>
              {exchange && (
                <span className="px-2 py-0.5 rounded-md bg-[#111c2b] border border-[#1f2e42] text-[11px] font-mono text-emerald-400 font-semibold">
                  {exchange}
                </span>
              )}
            </div>
            {title && title !== symbol && (
              <p className="text-xs text-gray-400 font-medium truncate max-w-[280px] sm:max-w-md">
                {title}
              </p>
            )}
          </div>
        </div>

        {/* Right: Mode Switcher & Minimal Filters */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Chart Display Mode: Candles vs Line */}
          <div className="flex items-center gap-1 bg-[#090f17] p-1 rounded-xl border border-[#162130]">
            <button
              type="button"
              onClick={() => setChartMode("candles")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                chartMode === "candles"
                  ? "bg-[#182436] text-white shadow-sm font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              🕯️ {CANDLESTICK_MESSAGES.candlestickMode}
            </button>
            <button
              type="button"
              onClick={() => setChartMode("line")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                chartMode === "line"
                  ? "bg-[#182436] text-white shadow-sm font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              📈 {CANDLESTICK_MESSAGES.lineMode}
            </button>
          </div>

          {/* Minimal Timeframe Filters */}
          <div className="flex items-center gap-1 bg-[#090f17] p-1 rounded-xl border border-[#162130]">
            {MINIMAL_TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedWindow(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedWindow === tf
                    ? "bg-[#182436] text-white font-semibold shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body */}
      {loading ? (
        <div className="py-6">
          <InvestmentQuotesLoading />
        </div>
      ) : !hasData ? (
        <div className="py-24 text-center">
          <p className="text-sm text-gray-400">{CANDLESTICK_MESSAGES.noData}</p>
        </div>
      ) : (
        <>
          {/* Real-Time Price & Live OHLC Bar */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              {price != null && (
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  {CANDLESTICK_MESSAGES.currencySymbol}
                  {price.toLocaleString(CANDLESTICK_MESSAGES.locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}

              {changePercent != null && (
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
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

              {date && <span className="text-xs text-gray-400 font-mono">{date}</span>}
            </div>

            {/* Live OHLC Metrics Pill */}
            {activeCandle && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#090f17] border border-[#162130] text-xs font-mono">
                <span className="text-gray-400">
                  O:{" "}
                  <span className="text-white font-semibold">
                    {activeCandle.open.toFixed(2)}
                  </span>
                </span>
                <span className="text-gray-400">
                  H:{" "}
                  <span className="text-emerald-400 font-semibold">
                    {activeCandle.high.toFixed(2)}
                  </span>
                </span>
                <span className="text-gray-400">
                  L:{" "}
                  <span className="text-rose-400 font-semibold">
                    {activeCandle.low.toFixed(2)}
                  </span>
                </span>
                <span className="text-gray-400">
                  C:{" "}
                  <span
                    className={
                      activeCandle.isBullish ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
                    }
                  >
                    {activeCandle.close.toFixed(2)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Interactive Chart Canvas / SVG Area */}
          {candles.length > 0 && (
            <div className="mt-5 relative w-full overflow-x-auto select-none">
              <div className="relative min-w-[650px] w-full h-[340px]">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={
                          isPositive ? CANDLESTICK_COLORS.bullish : CANDLESTICK_COLORS.bearish
                        }
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          isPositive ? CANDLESTICK_COLORS.bullish : CANDLESTICK_COLORS.bearish
                        }
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Price Gridlines */}
                  {yTicks.map((level, idx) => {
                    const y = scaleY(level);
                    return (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke={CANDLESTICK_COLORS.gridLine}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* CANDLESTICK MODE */}
                  {chartMode === "candles" &&
                    candles.map((candle, idx) => {
                      const cx = (idx + 0.5) * candleSlotWidth;
                      const highY = scaleY(candle.high);
                      const lowY = scaleY(candle.low);
                      const openY = scaleY(candle.open);
                      const closeY = scaleY(candle.close);
                      const topY = Math.min(openY, closeY);
                      const bodyHeight = Math.max(2, Math.abs(openY - closeY));
                      const candleColor = candle.isBullish
                        ? CANDLESTICK_COLORS.bullish
                        : CANDLESTICK_COLORS.bearish;

                      return (
                        <g key={idx}>
                          {/* Upper & Lower Wick */}
                          <line
                            x1={cx}
                            y1={highY}
                            x2={cx}
                            y2={lowY}
                            stroke={candleColor}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />

                          {/* Candle Real Body */}
                          <rect
                            x={cx - candleBodyWidth / 2}
                            y={topY}
                            width={candleBodyWidth}
                            height={bodyHeight}
                            rx={1}
                            fill={candleColor}
                            stroke={candleColor}
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}

                  {/* LINE MODE FALLBACK */}
                  {chartMode === "line" && (
                    <>
                      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke={
                            isPositive ? CANDLESTICK_COLORS.bullish : CANDLESTICK_COLORS.bearish
                          }
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </>
                  )}

                  {/* Interactive Hover Crosshair */}
                  {hoveredCandle && (
                    <g>
                      {/* Vertical line through candle */}
                      <line
                        x1={hoveredCandle.x}
                        y1={paddingTop}
                        x2={hoveredCandle.x}
                        y2={paddingTop + chartHeight}
                        stroke={CANDLESTICK_COLORS.crosshair}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />

                      {/* Horizontal line through price */}
                      <line
                        x1={0}
                        y1={hoveredCandle.y}
                        x2={chartWidth}
                        y2={hoveredCandle.y}
                        stroke={CANDLESTICK_COLORS.crosshair}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />

                      <circle
                        cx={hoveredCandle.x}
                        cy={hoveredCandle.y}
                        r="4"
                        fill={
                          hoveredCandle.candle.isBullish
                            ? CANDLESTICK_COLORS.bullish
                            : CANDLESTICK_COLORS.bearish
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* Invisible Hit Zones */}
                  {candles.map((candle, idx) => {
                    const cx = (idx + 0.5) * candleSlotWidth;
                    const closeY = scaleY(candle.close);
                    return (
                      <rect
                        key={`hit-${idx}`}
                        x={idx * candleSlotWidth}
                        y={paddingTop}
                        width={candleSlotWidth}
                        height={chartHeight}
                        fill="transparent"
                        onMouseEnter={() =>
                          setHoveredCandle({
                            candle,
                            x: cx,
                            y: closeY,
                          })
                        }
                        onMouseLeave={() => setHoveredCandle(null)}
                        className="cursor-crosshair"
                      />
                    );
                  })}
                </svg>

                {/* Right Y-Axis Price Labels */}
                <div className="absolute top-[20px] right-0 h-[285px] w-[80px] flex flex-col justify-between text-[11px] font-mono text-gray-400 pl-2 pointer-events-none">
                  {yTicks.map((val, idx) => (
                    <span key={idx}>
                      {val.toLocaleString(CANDLESTICK_MESSAGES.locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  ))}
                </div>

                {/* Current Live Price Pill on Right Axis */}
                {price != null && (
                  <div
                    className="absolute right-0 transform -translate-y-1/2 z-20 pointer-events-none"
                    style={{
                      top: `${Math.max(
                        paddingTop + 10,
                        Math.min(paddingTop + chartHeight - 10, scaleY(price))
                      )}px`,
                    }}
                  >
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-xs shadow-lg ${
                        isPositive ? "bg-[#10b981] text-[#052e16]" : "bg-[#f43f5e] text-white"
                      }`}
                    >
                      {price.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Bottom X-Axis Time Labels */}
                {xTimeLabels.length > 0 && (
                  <div className="absolute bottom-1 left-0 w-[calc(100%-85px)] flex justify-between text-[11px] font-mono text-gray-400 px-2 pointer-events-none">
                    {xTimeLabels.map((c, idx) => (
                      <span key={idx}>{formatTimeLabel(c.time, selectedWindow)}</span>
                    ))}
                  </div>
                )}

                {/* Live Data Badge */}
                <div className="absolute bottom-7 left-2 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition pointer-events-none">
                  <div className="px-2 py-1 rounded-md bg-[#0a111a] border border-[#1a2636] flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{CANDLESTICK_MESSAGES.liveBadge}</span>
                  </div>
                </div>

                {/* Floating Tooltip Box */}
                {hoveredCandle && (
                  <div
                    className="absolute z-30 pointer-events-none bg-[#091018] border border-[#1e2e42] rounded-xl p-2.5 text-xs shadow-2xl transform -translate-x-1/2 -translate-y-full -mt-3 transition-all min-w-[130px]"
                    style={{ left: `${hoveredCandle.x}px`, top: `${hoveredCandle.y}px` }}
                  >
                    <p className="text-gray-400 text-[10px] font-mono pb-1 border-b border-[#182333]">
                      {formatTimeLabel(hoveredCandle.candle.time, selectedWindow)}
                    </p>
                    <div className="pt-1.5 space-y-0.5 font-mono text-[11px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-400">Open:</span>
                        <span className="font-semibold text-white">
                          ₹{hoveredCandle.candle.open.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-400">High:</span>
                        <span className="font-semibold text-emerald-400">
                          ₹{hoveredCandle.candle.high.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-400">Low:</span>
                        <span className="font-semibold text-rose-400">
                          ₹{hoveredCandle.candle.low.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-400">Close:</span>
                        <span className="font-semibold text-white">
                          ₹{hoveredCandle.candle.close.toFixed(2)}
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

export default CandlestickChart;
