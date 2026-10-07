import { NextResponse } from "next/server";
import { HTTP_STATUS, HTTP_ERROR_MESSAGES } from "@/constants/errors";
import type { HttpStatusCode, ApiErrorResponse } from "@/types/errors";

export function createErrorResponse(
  statusCode: HttpStatusCode | number,
  customMessage?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const message =
    customMessage ||
    HTTP_ERROR_MESSAGES[statusCode] ||
    "An unexpected error occurred while processing the request.";

  return NextResponse.json(
    {
      success: false,
      statusCode,
      error: message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
