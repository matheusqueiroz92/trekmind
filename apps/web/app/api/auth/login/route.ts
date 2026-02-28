import { NextResponse } from "next/server";
import { JwtTokenService } from "@trekmind/infrastructure";
import {
  apiErrorResponse,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { validateEnv } from "@/lib/validate-env";

const jwtService = new JwtTokenService();

/**
 * Compatibilidade mobile: POST /api/auth/login (email + password).
 * Chama Better Auth sign-in/email e devolve JWT para o app enviar em Authorization: Bearer.
 */
export async function POST(request: Request) {
  try {
    validateEnv();
    const id = getClientIdentifier(request);
    const limit = checkRateLimit(`auth:login:${id}`, { windowMs: 60_000, max: 10 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.RATE_LIMIT },
        { status: 429, headers: limit.retryAfterMs ? { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } : undefined }
      );
    }
    const body = (await request.json()) as { email?: string; password?: string };
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return apiErrorResponse(
        "E-mail e senha são obrigatórios.",
        400
      );
    }

    const baseURL =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const signInRes = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!signInRes.ok) {
      const errData = (await signInRes.json().catch(() => ({}))) as { error?: string };
      const message =
        typeof errData?.error === "string"
          ? errData.error
          : API_ERROR_MESSAGES.AUTH_LOGIN_FAILED;
      return apiErrorResponse(message, signInRes.status === 401 ? 401 : 400);
    }

    const setCookie = signInRes.headers.get("set-cookie");
    if (!setCookie) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_LOGIN_FAILED, 500);
    }

    const sessionRes = await fetch(`${baseURL}/api/auth/get-session`, {
      headers: { cookie: setCookie },
    });
    if (!sessionRes.ok) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_LOGIN_FAILED, 500);
    }

    const sessionData = (await sessionRes.json()) as {
      data?: { user?: { id: string; name: string; email: string } };
    };
    const user = sessionData?.data?.user;
    if (!user?.id || !user?.email) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_LOGIN_FAILED, 500);
    }

    const token = await jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    logger.error("API auth/login failed", { message: err instanceof Error ? err.message : String(err) });
    return apiErrorResponse(API_ERROR_MESSAGES.INTERNAL, 500);
  }
}
