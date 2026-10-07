import type { ErrorResponsePayload } from "@/types";

export interface LiveIndexSummaryItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  source: string;
}

export interface LiveIndicesSuccessPayload {
  indices: LiveIndexSummaryItem[];
  timestamp: string;
}

export type LiveIndicesRouteResponse = LiveIndicesSuccessPayload | ErrorResponsePayload;
