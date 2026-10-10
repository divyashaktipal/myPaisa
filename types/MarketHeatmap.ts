export interface HeatmapStock {
  symbol: string;
  name: string;
  slug: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  turnoverCr: number;
  dayHigh?: number;
  dayLow?: number;
  sector: string;
}

export interface HeatmapSector {
  id: string;
  name: string;
  stocks: HeatmapStock[];
  totalTurnoverCr: number;
  topStock: HeatmapStock;
}

export interface MarketHeatmapResponse {
  success: boolean;
  asOf: string;
  sectors: HeatmapSector[];
  topSectorLeaders: HeatmapStock[];
  totalTurnoverCr: number;
  cached?: boolean;
}

export interface TreemapTile extends HeatmapStock {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MarketHeatmapSectionProps {
  onSelectStock?: (stock: HeatmapStock) => void;
  selectedStockSymbol?: string | null;
}

export interface TanStackStockChartProps {
  stock: HeatmapStock;
  selectedWindow?: string;
  onSelectWindow?: (window: string) => void;
  onClose?: () => void;
  onOpenFullTerminal?: (symbol: string) => void;
}
