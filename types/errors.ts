export type HttpStatusCode =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

export interface ClientErrorDescription {
  title: string;
  description: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  details?: unknown;
  timestamp: string;
}

export type ErrorResponsePayload = ApiErrorResponse;
