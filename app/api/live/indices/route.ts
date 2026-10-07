import { NextResponse } from "next/server";
import { auth } from "@/auth";
import YahooFinance from "yahoo-finance2";
import { createErrorResponse } from "@/lib";
import { HTTP_STATUS } from "@/constants";

export const dynamic = "force-dynamic";

type Quote = {
  symbol: string;
  shortName?: string | null;
  longName?: string | null;
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
};

const yahooFinance = new YahooFinance();

export async function GET() {
  const session = await auth();
  if (!session) {
    return createErrorResponse(
      HTTP_STATUS.UNAUTHORIZED,
      "Sign in to view real-time market data."
    );
  }

  try {
    const quotes = (await Promise.all(
      ["^NSEI", "^BSESN"].map((symbol) => yahooFinance.quote(symbol))
    )) as Quote[];

    const data = quotes
      ?.filter((quote) => typeof quote?.regularMarketPrice === "number")
      ?.map((quote) => ({
        symbol: quote?.symbol,
        name: quote?.shortName || quote?.longName || quote?.symbol,
        price: quote?.regularMarketPrice as number,
        changePercent: quote?.regularMarketChangePercent ?? null,
      })) ?? [];

    if (data?.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        error: null,
        asOf: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data,
      error: null,
      asOf: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Yahoo Finance quotes failed";
    console.error("Live indices error:", message);
    return createErrorResponse(
      HTTP_STATUS.BAD_GATEWAY,
      "Market data is temporarily unavailable from upstream provider."
    );
  }
}
