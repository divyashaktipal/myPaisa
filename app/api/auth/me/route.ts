import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail, createErrorResponse } from "@/lib";
import { HTTP_STATUS } from "@/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not logged in. Google login is required.",
          user: null,
          mongoData: null,
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const mongoUser = await getUserByEmail(session.user.email);

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      mongoData: mongoUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving user profile";
    console.error("Auth me error:", message);
    return createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to retrieve user profile."
    );
  }
}
