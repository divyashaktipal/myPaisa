import type { ErrorResponsePayload } from "@/types";

export interface QuotaAccountInfo {
  plan_searches_left?: number;
  total_searches_left?: number;
  this_month_usage?: number;
  [key: string]: unknown;
}

export interface QuotaSuccessPayload {
  account: QuotaAccountInfo;
  source: string;
}

export type QuotaRouteResponse = QuotaSuccessPayload | ErrorResponsePayload;
