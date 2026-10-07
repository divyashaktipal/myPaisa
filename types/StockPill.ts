export interface StockPillData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface StockPillProps {
  stock: StockPillData;
  onHover?: () => void;
}
