import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session token cookies used by NextAuth v5 and v4 (both dev and secure production)
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// Protected route prefixes that require user authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/overview",
  "/live",
  "/news",
  "/chart",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const hasSessionCookie = SESSION_COOKIE_NAMES.some((cookieName) => {
      const cookie = request.cookies.get(cookieName);
      return Boolean(cookie?.value && cookie.value.trim().length > 0);
    });

    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
      const callbackUrl = `${pathname}${search}`;
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/overview/:path*",
    "/live/:path*",
    "/news/:path*",
    "/chart/:path*",
  ],
};
