import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWatchlist, toggleWatchlist, createErrorResponse } from "@/lib";
import { HTTP_STATUS } from "@/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required: Sign in to access your watchlist."
      );
    }

    const symbols = await getWatchlist(session.user.email);
    // Strictly omit personal email/userId from client JSON payload
    return NextResponse.json({ success: true, symbols });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch watchlist";
    console.error("Watchlist GET error:", message);
    return createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to retrieve watchlist data."
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required: Sign in to update your watchlist."
      );
    }

    let body: { symbol?: unknown };
    try {
      body = (await req.json()) as { symbol?: unknown };
    } catch {
      return createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        "Invalid JSON request body."
      );
    }

    if (!body || typeof body?.symbol !== "string" || (body?.symbol as string)?.trim?.()?.length === 0) {
      return createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        "Field 'symbol' is required and must be a non-empty string."
      );
    }

    const cleanSymbol = (body?.symbol as string)?.trim?.()?.toUpperCase?.() ?? "";
    if (cleanSymbol.length > 25) {
      return createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        "Symbol exceeds maximum length of 25 characters."
      );
    }

    const result = await toggleWatchlist(cleanSymbol, session.user.email);
    return NextResponse.json({
      success: true,
      ...result,
      symbol: cleanSymbol,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update watchlist";
    console.error("Watchlist POST error:", message);
    return createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to update watchlist."
    );
  }
}
