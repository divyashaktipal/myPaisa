export interface SectorMoveData {
  id: string;
  name: string;
  changePercent: number;
  upCount: number;
  downCount: number;
  totalCount: number;
  bestStock: string;
  bestStockChange: number;
}

export interface SectorMovesSectionProps {
  className?: string;
  onSelectStock?: (symbol: string) => void;
}
