"use client";

import React, { useState, useMemo, useId, useRef, useCallback, useEffect } from "react";
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
import {
  formatTimeLabel,
  formatVolume,
  formatTurnover,
  getSmartTooltipPosition,
  extractInvestorMetrics,
} from "@/lib/chartUtils";
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
  stats = [],
  selectedWindow,
  setSelectedWindow,
  loading = false,
  onBackToIndices,
}: CandlestickChartProps) => {
  const gradientId = useId();
  const [hoveredCandle, setHoveredCandle] = useState<HoveredCandle | null>(null);
  const [chartMode, setChartMode] = useState<"candles" | "line">("candles");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  useEffect(() => {
    setHoveredCandle(null);
  }, [symbol, selectedWindow]);

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
      .map((pt) => ({ time: pt?.time ?? "", price: Number(pt.price), volume: pt?.volume }));

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

    // Extract baseline day volume from SerpApi knowledge_graph stats if available
    const volumeStat = stats?.find((s) => {
      const lbl = s?.label?.toLowerCase() || "";
      return lbl.includes("volume") || lbl.includes("vol");
    });
    let baseDayVolume = 2500000;
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

      // Realistic intraday candle volume:
      // High trading volume at open (9:15-10:00 AM) and close (2:30-3:30 PM),
      // modulated by candle spread volatility
      const uShape = 0.75 + 1.15 * Math.pow(Math.abs((i / Math.max(1, targetCount - 1)) - 0.48) * 1.8, 2);
      const spreadFactor = Math.max(0.65, Math.min(2.5, ((high - low) / (open || 1)) * 320));
      const pointVol = slice.reduce((sum, p) => sum + (p.volume || 0), 0);
      const computedVol =
        pointVol > 0
          ? pointVol
          : Math.round((baseDayVolume / targetCount) * uShape * spreadFactor);

      generatedCandles.push({
        time: slice[slice.length - 1].time || slice[0].time,
        open,
        high,
        low,
        close,
        isBullish,
        changePercent: candleChange,
        index: generatedCandles.length,
        volume: computedVol,
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
      ? `${lPath} L ${chartWidth} ${paddingTop + chartHeight} L 0 ${paddingTop + chartHeight
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
  }, [chartPoints, price, chartWidth, chartHeight, paddingTop, stats]);

  const scaleY = useCallback(
    (val: number) => {
      if (yMax <= yMin) return paddingTop + chartHeight / 2;
      const ratio = (val - yMin) / (yMax - yMin);
      return paddingTop + chartHeight - ratio * chartHeight;
    },
    [yMax, yMin, paddingTop, chartHeight]
  );

  const candleSlotWidth = candles.length > 0 ? chartWidth / candles.length : 0;
  const candleBodyWidth = Math.max(3, Math.min(18, candleSlotWidth * 0.65));
  const activeCandle = hoveredCandle?.candle ?? (candles.length > 0 ? candles[candles.length - 1] : null);

  const updateHoverFromClientX = useCallback(
    (clientX: number) => {
      if (!candles || candles.length === 0 || !chartContainerRef.current) return;
      const rect = chartContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const offsetX = clientX - rect.left;
      const svgX = (offsetX / rect.width) * width;
      const clampedSvgX = Math.max(0, Math.min(chartWidth, svgX));
      const ratio = clampedSvgX / chartWidth;
      const idx = Math.min(
        candles.length - 1,
        Math.max(0, Math.floor(ratio * candles.length))
      );
      const candle = candles[idx];
      if (!candle) return;

      const cx = (idx + 0.5) * candleSlotWidth;
      const closeY = scaleY(candle.close);

      setHoveredCandle({
        candle,
        x: cx,
        y: closeY,
      });
    },
    [candles, width, chartWidth, candleSlotWidth, scaleY]
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

      // If user is scrubbing horizontally, prevent native page scrolling so the line glides smoothly
      if (dx > dy || isInteractingRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
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
    setHoveredCandle(null);
  };

  const investorMetrics = useMemo(
    () => extractInvestorMetrics(stats, price, candles, movementValue),
    [stats, price, candles, movementValue]
  );

  return (
    <div className="rounded-2xl bg-[#0b121c] border border-[#1a2535] p-4 sm:p-6 shadow-2xl text-white">
      {/* Top Header: Live Indices Button (Top), Stock Identity (Below), Filters (Below) */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#182333]">
        {/* Top: Live Indices Button */}
        {/* {onBackToIndices && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBackToIndices}
              className="px-3 py-1.5 rounded-xl bg-[#111c2a] hover:bg-[#182638] border border-[#1e2e42] text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm group w-fit"
              title="Return to Live Indices (Nifty 50, 100, 200)"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              <span>{CANDLESTICK_MESSAGES.backToIndices}</span>
            </button>
          </div>
        )} */}

        {/* Just Below: Stock Name, Exchange & Title */}
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
            <p className="text-xs text-gray-400 font-medium truncate max-w-md sm:max-w-xl mt-0.5">
              {title}
            </p>
          )}
        </div>

        {/* Toolbar: Date Filters, Engine Selector (TanStack Chart vs Candlestick), and Candle/Line Mode */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {/* Timeframe Filters (Date Filter) */}
          <div className="flex items-center gap-1 bg-[#090f17] p-1 rounded-xl border border-[#162130]">
            {MINIMAL_TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedWindow(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer font-mono ${selectedWindow === tf
                  ? "bg-[#182436] text-white font-semibold shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#101825]"
                  }`}
              >
                {tf}
              </button>
            ))}
            {loading && hasData && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1 mr-1.5" title="Updating data..." />
            )}
          </div>

          {/* Chart Display Mode: Candles vs Line */}
          <div className="flex items-center gap-1 bg-[#090f17] p-1 rounded-xl border border-[#162130]">
            <button
              type="button"
              onClick={() => setChartMode("candles")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${chartMode === "candles"
                ? "bg-[#182436] text-white shadow-sm font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#101825]"
                }`}
            >
              🕯️ {CANDLESTICK_MESSAGES.candlestickMode}
            </button>
            <button
              type="button"
              onClick={() => setChartMode("line")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${chartMode === "line"
                ? "bg-[#182436] text-white shadow-sm font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#101825]"
                }`}
            >
              📈 {CANDLESTICK_MESSAGES.lineMode}
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      {loading && !hasData ? (
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${isPositive
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
            <div
              ref={chartContainerRef}
              className="mt-5 relative w-full select-none touch-pan-y"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div className="relative w-full h-[280px] sm:h-[340px]">
                <svg
                  className="w-full h-full overflow-visible pointer-events-none"
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

                </svg>

                {/* Right Y-Axis Price Labels */}
                <div
                  className="absolute top-[20px] right-0 h-[calc(100%-55px)] flex flex-col justify-between items-end text-[9px] sm:text-[11px] font-mono text-gray-400 pr-1 pointer-events-none"
                  style={{ width: `${(paddingRight / width) * 100}%` }}
                >
                  {yTicks.map((val, idx) => (
                    <span key={idx} className="truncate">
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
                        6,
                        Math.min(90, (scaleY(price) / height) * 100)
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
                {xTimeLabels.length > 0 && (
                  <div
                    className="absolute bottom-1 left-0 flex justify-between text-[9px] sm:text-[11px] font-mono text-gray-400 px-1 pointer-events-none"
                    style={{ width: `${(chartWidth / width) * 100}%` }}
                  >
                    {xTimeLabels.map((c, idx) => (
                      <span key={idx} className="truncate">{formatTimeLabel(c.time, selectedWindow)}</span>
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
                    className="absolute z-30 pointer-events-none bg-[#091018]/95 border border-[#1e2e42] rounded-xl p-2.5 sm:p-3 text-xs shadow-2xl backdrop-blur-md min-w-[155px] max-w-[220px] transition-[left,top] duration-0 sm:duration-75"
                    style={getSmartTooltipPosition(
                      hoveredCandle.x,
                      hoveredCandle.y,
                      width,
                      height,
                      {
                        rightPadding: paddingRight,
                        topPadding: paddingTop,
                        bottomPadding: paddingBottom,
                      }
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#182333]">
                      <p className="text-gray-300 text-[10.5px] font-mono font-medium">
                        {formatTimeLabel(hoveredCandle.candle.time, selectedWindow)}
                      </p>
                      <span
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${hoveredCandle.candle.changePercent >= 0
                            ? "text-emerald-400 bg-emerald-950/60"
                            : "text-rose-400 bg-rose-950/60"
                          }`}
                      >
                        {hoveredCandle.candle.changePercent >= 0 ? "+" : ""}
                        {hoveredCandle.candle.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="pt-2 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between gap-3 items-baseline">
                        <span className="text-gray-400">
                          {chartMode === "line" ? "Price:" : "Close:"}
                        </span>
                        <span className="font-bold text-white text-xs">
                          ₹{hoveredCandle.candle.close.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-[10.5px]">
                        <span className="text-gray-400">Open:</span>
                        <span className="font-medium text-gray-200">
                          ₹{hoveredCandle.candle.open.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-[10.5px]">
                        <span className="text-gray-400">High:</span>
                        <span className="font-medium text-emerald-400">
                          ₹{hoveredCandle.candle.high.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-[10.5px]">
                        <span className="text-gray-400">Low:</span>
                        <span className="font-medium text-rose-400">
                          ₹{hoveredCandle.candle.low.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 pt-1.5 mt-0.5 border-t border-[#182333] text-[10.5px]">
                        <span className="text-gray-400">Volume Traded:</span>
                        <span className="font-bold text-emerald-400">
                          {formatVolume(hoveredCandle.candle.volume)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-[10.5px]">
                        <span className="text-gray-400">Turnover:</span>
                        <span className="font-bold text-gray-200">
                          {formatTurnover(hoveredCandle.candle.close, hoveredCandle.candle.volume)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Investor Key Metrics Factsheet */}
          <div className="mt-6 pt-5 border-t border-[#162334] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Key Metrics for Investors
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Live Data &amp; Market Stats
              </span>
            </div>

            {/* Range Gauges: Day Range & 52-Week Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#080e18] p-4 rounded-xl border border-[#142030]">
              {/* Day Range Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Day Range</span>
                  <span className="text-white font-semibold">{investorMetrics.dayRangeStr}</span>
                </div>
                <div className="relative w-full h-2 bg-[#121c2c] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${investorMetrics.dayRangeProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>L: {investorMetrics.dayLow != null ? `₹${investorMetrics.dayLow.toFixed(2)}` : "—"}</span>
                  <span>H: {investorMetrics.dayHigh != null ? `₹${investorMetrics.dayHigh.toFixed(2)}` : "—"}</span>
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">52-Week Range</span>
                  <span className="text-white font-semibold">{investorMetrics.yearRangeStr}</span>
                </div>
                <div className="relative w-full h-2 bg-[#121c2c] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                    style={{ width: `${investorMetrics.yearRangeProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>52W L: {investorMetrics.yearLow != null ? `₹${investorMetrics.yearLow.toFixed(2)}` : "—"}</span>
                  <span>52W H: {investorMetrics.yearHigh != null ? `₹${investorMetrics.yearHigh.toFixed(2)}` : "—"}</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Prev Close</p>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {investorMetrics.prevClose != null ? `₹${investorMetrics.prevClose.toFixed(2)}` : "—"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Open</p>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {investorMetrics.open != null ? `₹${investorMetrics.open.toFixed(2)}` : "—"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Traded Volume</p>
                <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
                  {investorMetrics.volumeStr}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Est. Turnover</p>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {investorMetrics.turnoverStr}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">Market Cap</p>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {investorMetrics.marketCapStr}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080e18] border border-[#142030]">
                <p className="text-[10px] font-mono text-gray-400 uppercase">P/E Ratio</p>
                <p className="text-sm font-bold font-mono text-cyan-400 mt-1">
                  {investorMetrics.peRatioStr}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandlestickChart;
