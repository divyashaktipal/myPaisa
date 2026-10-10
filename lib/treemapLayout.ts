import type { HeatmapStock, TreemapTile } from "@/types/MarketHeatmap";

/**
 * Squarified Treemap Algorithm (Bruls, Huizing, van Wijk)
 * Generates responsive non-overlapping percentage-based bounding boxes (0-100%)
 * where area is proportional to traded turnover value.
 */
export function computeTreemapLayout(
  stocks: HeatmapStock[],
  width = 100,
  height = 100
): TreemapTile[] {
  if (!stocks || stocks.length === 0) return [];

  // Filter and ensure every stock has positive value
  const items = stocks.map((s) => ({
    ...s,
    weight: Math.max(s.turnoverCr > 0 ? s.turnoverCr : 10, 5),
  }));

  if (items.length === 1) {
    const { weight: _, ...rest } = items[0];
    return [{ ...rest, x: 0, y: 0, width, height }];
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const totalArea = width * height;

  // Normalize item areas so their sum equals width * height
  const normalizedItems = items.map((item) => ({
    ...item,
    area: (item.weight / totalWeight) * totalArea,
  }));

  // Sort descending by area
  normalizedItems.sort((a, b) => b.area - a.area);

  const results: TreemapTile[] = [];
  let remaining = [...normalizedItems];
  let curX = 0;
  let curY = 0;
  let curW = width;
  let curH = height;

  while (remaining.length > 0) {
    const isHorizontal = curW >= curH;
    const side = isHorizontal ? curH : curW;

    let row = [remaining[0]];
    let rowArea = remaining[0].area;
    let bestWorst = calcWorst(row, rowArea, side);

    for (let i = 1; i < remaining.length; i++) {
      const candidate = remaining[i];
      const nextArea = rowArea + candidate.area;
      const nextWorst = calcWorst([...row, candidate], nextArea, side);

      if (nextWorst <= bestWorst) {
        row.push(candidate);
        rowArea = nextArea;
        bestWorst = nextWorst;
      } else {
        break;
      }
    }

    // Lay out row
    const rowThickness = side === 0 ? 0 : rowArea / side;
    let offset = 0;

    for (const item of row) {
      const itemLen = rowThickness === 0 ? 0 : item.area / rowThickness;
      const { area: _, weight: __, ...cleanStock } = item;

      if (isHorizontal) {
        results.push({
          ...cleanStock,
          x: Number(curX.toFixed(2)),
          y: Number((curY + offset).toFixed(2)),
          width: Number(rowThickness.toFixed(2)),
          height: Number(itemLen.toFixed(2)),
        });
      } else {
        results.push({
          ...cleanStock,
          x: Number((curX + offset).toFixed(2)),
          y: Number(curY.toFixed(2)),
          width: Number(itemLen.toFixed(2)),
          height: Number(rowThickness.toFixed(2)),
        });
      }
      offset += itemLen;
    }

    remaining = remaining.slice(row.length);
    if (isHorizontal) {
      curX += rowThickness;
      curW -= rowThickness;
    } else {
      curY += rowThickness;
      curH -= rowThickness;
    }
  }

  function calcWorst(rowItems: Array<{ area: number }>, rowAreaSum: number, sideLength: number): number {
    if (rowAreaSum === 0 || sideLength === 0) return Infinity;
    const thickness = rowAreaSum / sideLength;
    if (thickness === 0) return Infinity;

    let maxAspect = 0;
    for (const item of rowItems) {
      const length = item.area / thickness;
      if (length === 0) continue;
      const aspect = Math.max(thickness / length, length / thickness);
      if (aspect > maxAspect) maxAspect = aspect;
    }
    return maxAspect;
  }

  return results;
}
