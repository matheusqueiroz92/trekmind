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
 * Compatibilidade mobile: POST /api/auth/register (name, email, password).
 * Chama Better Auth sign-up/email e devolve JWT para o app enviar em Authorization: Bearer.
 */
export async function POST(request: Request) {
  try {
    validateEnv();
    const id = getClientIdentifier(request);
    const limit = checkRateLimit(`auth:register:${id}`, { windowMs: 60_000, max: 10 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.RATE_LIMIT },
        { status: 429, headers: limit.retryAfterMs ? { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } : undefined }
      );
    }
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email) {
      return apiErrorResponse(
        "Nome e e-mail são obrigatórios.",
        400
      );
    }

    const baseURL =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const signUpRes = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: password || undefined }),
    });

    if (!signUpRes.ok) {
      const errData = (await signUpRes.json().catch(() => ({}))) as { error?: string };
      const message =
        typeof errData?.error === "string"
          ? errData.error
          : API_ERROR_MESSAGES.AUTH_REGISTER_FAILED;
      const status = signUpRes.status === 409 ? 409 : 400;
      return apiErrorResponse(message, status);
    }

    const setCookie = signUpRes.headers.get("set-cookie");
    if (!setCookie) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_REGISTER_FAILED, 500);
    }

    const sessionRes = await fetch(`${baseURL}/api/auth/get-session`, {
      headers: { cookie: setCookie },
    });
    if (!sessionRes.ok) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_REGISTER_FAILED, 500);
    }

    const sessionData = (await sessionRes.json()) as {
      data?: { user?: { id: string; name: string; email: string } };
    };
    const user = sessionData?.data?.user;
    if (!user?.id || !user?.email) {
      return apiErrorResponse(API_ERROR_MESSAGES.AUTH_REGISTER_FAILED, 500);
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
    logger.error("API auth/register failed", { message: err instanceof Error ? err.message : String(err) });
    return apiErrorResponse(API_ERROR_MESSAGES.INTERNAL, 500);
  }
}
