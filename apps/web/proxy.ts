import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_ERROR_MESSAGES } from "@/lib/api-errors";
import { auth } from "@/lib/better-auth";
import { getBearerPayload } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/login/magic-link", "/api-docs"];
const API_AUTH_PREFIX = "/api/auth";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith(API_AUTH_PREFIX);
}

/** Usa a mesma instância do Better Auth para validar sessão pelos headers da requisição. */
async function hasBetterAuthSession(request: NextRequest): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session != null;
  } catch {
    return false;
  }
}

/** True if request has valid session (cookie) or Bearer JWT (mobile). */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const bearer = await getBearerPayload(request);
  if (bearer) return true;
  return hasBetterAuthSession(request);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API auth routes: no session required
  if (pathname.startsWith("/api/") && isAuthApiPath(pathname)) {
    return NextResponse.next();
  }

  // Other API routes: require valid session or Bearer JWT
  if (pathname.startsWith("/api/")) {
    const ok = await isAuthenticated(request);
    if (!ok) {
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

  const ok = await isAuthenticated(request);
  if (!ok) {
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
