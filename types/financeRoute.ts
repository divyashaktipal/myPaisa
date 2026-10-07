import type { SerpApiFinanceResponse } from "./serpapi";
import type { ErrorResponsePayload } from "./errors";

export interface FinanceRouteQueryParams {
  symbol?: string;
  window?: string;
}

export type FinanceRouteResponse = SerpApiFinanceResponse | ErrorResponsePayload;
