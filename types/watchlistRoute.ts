import type { ErrorResponsePayload } from "@/types";

export interface WatchlistRequestBody {
  symbol?: string;
  action?: "add" | "remove";
}

export interface WatchlistSuccessPayload {
  watchlist: string[];
}

export type WatchlistRouteResponse = WatchlistSuccessPayload | ErrorResponsePayload;
