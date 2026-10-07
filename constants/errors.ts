import type { HttpStatusCode } from "@/types/errors";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.BAD_REQUEST]: "Bad Request: The request was invalid or missing required parameters.",
  [HTTP_STATUS.UNAUTHORIZED]: "Unauthorized: Authentication is required to access this resource.",
  [HTTP_STATUS.FORBIDDEN]: "Forbidden: You do not have permission to access this resource.",
  [HTTP_STATUS.NOT_FOUND]: "Not Found: The requested market asset or endpoint could not be found.",
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: "Method Not Allowed: HTTP method not supported for this route.",
  [HTTP_STATUS.CONFLICT]: "Conflict: The request could not be completed due to a conflict.",
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: "Unprocessable Entity: Unable to process the contained instructions.",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "Too Many Requests: Rate limit exceeded. Please wait a moment before trying again.",
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "Internal Server Error: An unexpected error occurred on the server.",
  [HTTP_STATUS.BAD_GATEWAY]: "Bad Gateway: Upstream market data provider failed to respond.",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "Service Unavailable: Service is temporarily down or unconfigured.",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "Gateway Timeout: Upstream market service timed out.",
};

export const CLIENT_ERROR_DESCRIPTIONS: Record<HttpStatusCode, { title: string; description: string }> = {
  [HTTP_STATUS.OK]: { title: "Success (200)", description: "Request completed successfully." },
  [HTTP_STATUS.CREATED]: { title: "Created (201)", description: "Resource created successfully." },
  [HTTP_STATUS.BAD_REQUEST]: {
    title: "Invalid Request (400)",
    description: "The requested symbol or timeframe is invalid. Please check your query and try again.",
  },
  [HTTP_STATUS.UNAUTHORIZED]: {
    title: "Session Expired (401)",
    description: "Please sign in with your Google account to access this market data.",
  },
  [HTTP_STATUS.FORBIDDEN]: {
    title: "Access Denied (403)",
    description: "You do not have permission to perform this market operation.",
  },
  [HTTP_STATUS.NOT_FOUND]: {
    title: "Market Data Not Found (404)",
    description: "No market data or quotes were returned for the requested ticker.",
  },
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: {
    title: "Method Not Allowed (405)",
    description: "HTTP method not allowed on this endpoint.",
  },
  [HTTP_STATUS.CONFLICT]: {
    title: "Conflict (409)",
    description: "Request conflicted with existing state.",
  },
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: {
    title: "Unprocessable (422)",
    description: "Unable to process instructions.",
  },
  [HTTP_STATUS.TOO_MANY_REQUESTS]: {
    title: "Rate Limit Exceeded (429)",
    description: "Too many market queries made in a short time. Please wait a moment.",
  },
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: {
    title: "Server Error (500)",
    description: "An unexpected error occurred while processing market intelligence.",
  },
  [HTTP_STATUS.BAD_GATEWAY]: {
    title: "Upstream Provider Unavailable (502)",
    description: "SerpApi Google Finance or Yahoo Finance is currently unreachable.",
  },
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: {
    title: "Service Temporarily Unavailable (503)",
    description: "Market intelligence service is undergoing maintenance or lacks configuration.",
  },
  [HTTP_STATUS.GATEWAY_TIMEOUT]: {
    title: "Connection Timeout (504)",
    description: "Market provider took too long to reply. Check your network connection.",
  },
};
