export interface StockItem {
  symbol: string;
  name: string;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
}
