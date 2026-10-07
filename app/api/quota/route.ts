import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createErrorResponse } from "@/lib";
import { HTTP_STATUS } from "@/constants";
import { env } from "@/config";

export const dynamic = "force-dynamic";

type AccountResponse = {
  error?: string;
  total_searches_left?: number;
  plan_searches_left?: number;
};

export async function GET() {
  const session = await auth();
  if (!session) {
    return createErrorResponse(
      HTTP_STATUS.UNAUTHORIZED,
      "Authentication required to view API quota."
    );
  }

  const apiKey = env.SERPAPI_KEY;
  if (!apiKey) {
    return createErrorResponse(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "SERPAPI_KEY is not configured on the server."
    );
  }

  try {
    const url = new URL("https://serpapi.com/account");
    url.searchParams.set("api_key", apiKey);
    const response = await fetch(url, { cache: "no-store" });
    const account = (await response.json()) as AccountResponse;

    if (!response?.ok || account?.error) {
      const status = response?.ok ? HTTP_STATUS.BAD_GATEWAY : (response?.status ?? 500);
      return createErrorResponse(
        status,
        account?.error || "Could not retrieve SerpApi quota from upstream provider."
      );
    }

    const searchesLeft = account?.total_searches_left ?? account?.plan_searches_left;
    if (typeof searchesLeft !== "number") {
      return createErrorResponse(
        HTTP_STATUS.BAD_GATEWAY,
        "SerpApi quota response did not include searches left."
      );
    }

    return NextResponse.json({
      success: true,
      data: { searchesLeft },
      error: null,
      asOf: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Quota lookup failed";
    console.error("SerpApi quota retrieval error:", message);
    return createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Could not retrieve SerpApi quota."
    );
  }
}
