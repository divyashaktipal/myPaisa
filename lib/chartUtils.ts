export function formatTimeLabel(raw: string, window: string): string {
  if (!raw) return "";
  if (window === "1D") {
    const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    return match ? match[1] : raw.split(",")[1]?.trim() || raw;
  }
  const dateMatch = raw.match(/([A-Za-z]{3}\s*\d{1,2}(?:,?\s*\d{4})?)/);
  return dateMatch ? dateMatch[1] : raw.split(",")[0] || raw;
}

/**
 * Formats traded stock/index volume into clean, human-readable Indian notation.
 * e.g., 25,400,000 -> "2.54 Cr", 1,250,000 -> "12.50 L", 45,200 -> "45.2K"
 */
export function formatVolume(volume: number | string | undefined | null): string {
  if (volume == null) return "—";
  if (typeof volume === "string") {
    if (/[a-zA-Z]/.test(volume)) return volume;
    const num = parseFloat(volume.replace(/,/g, ""));
    if (isNaN(num)) return volume;
    volume = num;
  }
  if (typeof volume === "number") {
    if (isNaN(volume) || volume <= 0) return "—";
    if (volume >= 10_000_000) {
      return `${(volume / 10_000_000).toFixed(2)} Cr`;
    }
    if (volume >= 100_000) {
      return `${(volume / 100_000).toFixed(2)} L`;
    }
    if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(1)}K`;
    }
    return volume.toLocaleString("en-IN");
  }
  return "—";
}

/**
 * Calculates responsive, boundary-aware CSS positioning for chart hover tooltip cards.
 * Ensures cards never get clipped or hidden on the left (e.g. 9:25 AM), right (e.g. 3:00 PM), or top.
 */
export function getSmartTooltipPosition(
  x: number,
  y: number,
  totalWidth: number,
  totalHeight: number,
  options?: {
    rightPadding?: number;
    topPadding?: number;
    bottomPadding?: number;
  }
): React.CSSProperties {
  const rightPad = options?.rightPadding ?? 80;
  const topPad = options?.topPadding ?? 20;
  const chartWidth = Math.max(1, totalWidth - rightPad);

  // Normalized ratios in chart coordinates
  const xRatio = Math.max(0, Math.min(1, x / chartWidth));
  const yRatio = Math.max(0, Math.min(1, y / totalHeight));

  // Precise percentage relative to chart width (accounts for right-axis padding)
  const xPercent = (x / totalWidth) * 100;
  const yPercent = (y / totalHeight) * 100;

  // Boundary thresholds
  // 1. Left boundary (starting candles around 9:25 AM): open to the right of crosshair
  // 2. Right boundary (ending candles around 3:00 PM / 3:30 PM): open to the left of crosshair
  // 3. Middle: center horizontally
  const isNearLeft = xRatio < 0.22;
  const isNearRight = xRatio > 0.72;

  // 4. Top boundary (near high prices): open downwards below point to avoid clipping at the top
  const isNearTop = yRatio < 0.38 || y < topPad + 45;

  let transformX = "-50%";
  let leftAdjust = 0;
  if (isNearLeft) {
    transformX = "0%";
    leftAdjust = 12;
  } else if (isNearRight) {
    transformX = "-100%";
    leftAdjust = -12;
  }

  let transformY = "-100%";
  let topAdjust = -12;
  if (isNearTop) {
    transformY = "0%";
    topAdjust = 14;
  }

  return {
    left: `calc(${xPercent.toFixed(2)}% + ${leftAdjust}px)`,
    top: `calc(${yPercent.toFixed(2)}% + ${topAdjust}px)`,
    transform: `translate(${transformX}, ${transformY})`,
  };
}

/**
 * Calculates estimated turnover in Indian Rupee format (₹ Cr or ₹ L).
 */
export function formatTurnover(price: number | undefined | null, volume: number | undefined | null): string {
  if (price == null || volume == null || isNaN(price) || isNaN(volume) || price <= 0 || volume <= 0) {
    return "—";
  }
  const turnoverInRupees = price * volume;
  const turnoverCr = turnoverInRupees / 10_000_000;
  if (turnoverCr >= 1) {
    return `₹${turnoverCr.toFixed(2)} Cr`;
  }
  const turnoverLakh = turnoverInRupees / 100_000;
  if (turnoverLakh >= 1) {
    return `₹${turnoverLakh.toFixed(2)} L`;
  }
  return `₹${turnoverInRupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export interface InvestorKeyMetrics {
  dayLow: number | null;
  dayHigh: number | null;
  dayRangeStr: string;
  dayRangeProgress: number;
  yearLow: number | null;
  yearHigh: number | null;
  yearRangeStr: string;
  yearRangeProgress: number;
  open: number | null;
  prevClose: number | null;
  volumeStr: string;
  avgVolumeStr: string;
  turnoverStr: string;
  marketCapStr: string;
  peRatioStr: string;
  dividendYieldStr: string;
}

interface RawStatItem {
  label?: string;
  value?: string;
}

/**
 * Extracts and standardizes comprehensive investor factsheet data from
 * SerpApi key_stats, current price, and intraday candles/points.
 */
export function extractInvestorMetrics(
  stats: RawStatItem[] | undefined | null,
  currentPrice: number | null,
  candles?: Array<{ open?: number; high?: number; low?: number; close?: number; volume?: number }>,
  movementValue?: number | null
): InvestorKeyMetrics {
  const statList = stats || [];

  const findStat = (terms: string[]): string | null => {
    const found = statList.find((s) => {
      const lbl = (s?.label || "").toLowerCase();
      return terms.some((t) => lbl.includes(t));
    });
    return found?.value?.trim() || null;
  };

  // 1. Day Range: Check separate "High" / "Low" stats or combined "Day range"
  let dayLow: number | null = null;
  let dayHigh: number | null = null;
  let dayRangeStr = "—";

  const rawDayLow = statList.find((s) => (s?.label || "").toLowerCase().trim() === "low")?.value;
  const rawDayHigh = statList.find((s) => (s?.label || "").toLowerCase().trim() === "high")?.value;
  if (rawDayLow && rawDayHigh) {
    const l = parseFloat(rawDayLow.replace(/[^0-9.]/g, ""));
    const h = parseFloat(rawDayHigh.replace(/[^0-9.]/g, ""));
    if (!isNaN(l) && !isNaN(h)) {
      dayLow = Math.min(l, h);
      dayHigh = Math.max(l, h);
      dayRangeStr = `${rawDayLow} - ${rawDayHigh}`;
    }
  }

  if (dayLow == null || dayHigh == null) {
    const rawDayRange = findStat(["day range", "day's range", "intraday range"]);
    if (rawDayRange) {
      const parts = rawDayRange.split("-").map((p) => parseFloat(p.replace(/[^0-9.]/g, "")));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        dayLow = Math.min(parts[0], parts[1]);
        dayHigh = Math.max(parts[0], parts[1]);
        dayRangeStr = rawDayRange;
      }
    }
  }

  if (dayLow == null && candles && candles.length > 0) {
    const lows = candles.map((c) => c.low ?? c.close ?? 0).filter((v) => v > 0);
    const highs = candles.map((c) => c.high ?? c.close ?? 0).filter((v) => v > 0);
    if (lows.length > 0 && highs.length > 0) {
      dayLow = Math.min(...lows, currentPrice ?? Infinity);
      dayHigh = Math.max(...highs, currentPrice ?? -Infinity);
      dayRangeStr = `${dayLow.toFixed(2)} - ${dayHigh.toFixed(2)}`;
    }
  }

  const dayRangeProgress =
    dayLow != null && dayHigh != null && dayHigh > dayLow && currentPrice != null
      ? Math.max(0, Math.min(100, ((currentPrice - dayLow) / (dayHigh - dayLow)) * 100))
      : 50;

  // 2. 52-Week (Year) Range: Check separate "52-wk high" / "52-wk low" or combined range
  let yearLow: number | null = null;
  let yearHigh: number | null = null;
  let yearRangeStr = "—";

  const raw52Low = statList.find((s) => {
    const l = (s?.label || "").toLowerCase();
    return l.includes("52-wk low") || l.includes("52 week low") || l.includes("year low");
  })?.value;
  const raw52High = statList.find((s) => {
    const l = (s?.label || "").toLowerCase();
    return l.includes("52-wk high") || l.includes("52 week high") || l.includes("year high");
  })?.value;

  if (raw52Low && raw52High) {
    const l = parseFloat(raw52Low.replace(/[^0-9.]/g, ""));
    const h = parseFloat(raw52High.replace(/[^0-9.]/g, ""));
    if (!isNaN(l) && !isNaN(h)) {
      yearLow = Math.min(l, h);
      yearHigh = Math.max(l, h);
      yearRangeStr = `${raw52Low} - ${raw52High}`;
    }
  }

  if (yearLow == null || yearHigh == null) {
    const rawYearRange = statList.find((s) => {
      const l = (s?.label || "").toLowerCase();
      return (l.includes("year range") || l.includes("52-wk range") || l.includes("52 week range")) && !l.includes("high") && !l.includes("low");
    })?.value;
    if (rawYearRange) {
      const parts = rawYearRange.split("-").map((p) => parseFloat(p.replace(/[^0-9.]/g, "")));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        yearLow = Math.min(parts[0], parts[1]);
        yearHigh = Math.max(parts[0], parts[1]);
        yearRangeStr = rawYearRange;
      }
    }
  }

  const yearRangeProgress =
    yearLow != null && yearHigh != null && yearHigh > yearLow && currentPrice != null
      ? Math.max(0, Math.min(100, ((currentPrice - yearLow) / (yearHigh - yearLow)) * 100))
      : 50;

  // 3. Open
  let open: number | null = null;
  const rawOpen = findStat(["open"]);
  if (rawOpen) {
    const parsed = parseFloat(rawOpen.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) open = parsed;
  }
  if (open == null && candles && candles.length > 0 && candles[0].open != null) {
    open = candles[0].open;
  }

  // 4. Previous Close
  let prevClose: number | null = null;
  const rawPrevClose = findStat(["prev close", "previous close"]);
  if (rawPrevClose) {
    const parsed = parseFloat(rawPrevClose.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) prevClose = parsed;
  }
  if (prevClose == null && currentPrice != null && movementValue != null) {
    prevClose = currentPrice - movementValue;
  }

  // 5. Volume & Avg Volume
  const rawVol = findStat(["volume", "vol"]);
  let totalCandleVol = 0;
  if (candles && candles.length > 0) {
    totalCandleVol = candles.reduce((acc, c) => acc + (c.volume || 0), 0);
  }
  const volumeStr = rawVol || (totalCandleVol > 0 ? formatVolume(totalCandleVol) : "—");
  const avgVolumeStr = findStat(["avg vol", "avg volume", "average volume"]) || "—";

  // 6. Turnover
  let effectiveVolNumber = totalCandleVol;
  if (effectiveVolNumber <= 0 && rawVol) {
    const parsed = parseFloat(rawVol.replace(/,/g, ""));
    if (!isNaN(parsed)) {
      if (/cr|crore/i.test(rawVol)) effectiveVolNumber = parsed * 10_000_000;
      else if (/l|lakh/i.test(rawVol)) effectiveVolNumber = parsed * 100_000;
      else if (/m|million/i.test(rawVol)) effectiveVolNumber = parsed * 1_000_000;
      else effectiveVolNumber = parsed;
    }
  }
  const turnoverStr = formatTurnover(currentPrice, effectiveVolNumber);

  // 7. Market Cap, P/E, Dividend Yield
  const marketCapStr = findStat(["market cap", "mkt cap"]) || "—";
  const peRatioStr = findStat(["p/e", "pe ratio", "price to earnings"]) || "—";
  const dividendYieldStr = findStat(["div yield", "dividend yield", "yield"]) || "—";

  return {
    dayLow,
    dayHigh,
    dayRangeStr,
    dayRangeProgress,
    yearLow,
    yearHigh,
    yearRangeStr,
    yearRangeProgress,
    open,
    prevClose,
    volumeStr,
    avgVolumeStr,
    turnoverStr,
    marketCapStr,
    peRatioStr,
    dividendYieldStr,
  };
}
