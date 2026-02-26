import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ERROR_MESSAGES } from "@/lib/api-errors";

const PUBLIC_PATHS = ["/", "/login", "/register", "/login/magic-link"];
const API_AUTH_PREFIX = "/api/auth";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith(API_AUTH_PREFIX);
}

async function hasBetterAuthSession(request: NextRequest): Promise<boolean> {
  const origin = request.nextUrl.origin;
  const cookie = request.headers.get("cookie") ?? "";
  try {
    const res = await fetch(`${origin}/api/auth/get-session`, {
      headers: { cookie },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.data?.session != null;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API auth routes: no session required
  if (pathname.startsWith("/api/") && isAuthApiPath(pathname)) {
    return NextResponse.next();
  }

  // Other API routes: require valid Better Auth session
  if (pathname.startsWith("/api/")) {
    const hasSession = await hasBetterAuthSession(request);
    if (!hasSession) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Page routes: allow public paths; protect the rest
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = await hasBetterAuthSession(request);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
