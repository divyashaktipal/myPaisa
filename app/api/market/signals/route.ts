import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  INITIAL_ALL_SIGNALS,
  INITIAL_TOP_HIGHLIGHTS,
  INITIAL_SIGNALS_SUMMARY,
} from "@/constants/Signals";
import type { SignalsApiResponse } from "@/types/Signals";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Sign in required to access market signals." },
      { status: 401 }
    );
  }

  try {
    const response: SignalsApiResponse = {
      success: true,
      summary: INITIAL_SIGNALS_SUMMARY,
      highlights: INITIAL_TOP_HIGHLIGHTS,
      signals: INITIAL_ALL_SIGNALS,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Signals API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load market signals",
        summary: INITIAL_SIGNALS_SUMMARY,
        highlights: INITIAL_TOP_HIGHLIGHTS,
        signals: INITIAL_ALL_SIGNALS,
      },
      { status: 500 }
    );
  }
}
