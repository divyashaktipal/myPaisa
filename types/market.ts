export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  asOf: string | null;
}

export interface QuotaData {
  searchesLeft: number;
}
