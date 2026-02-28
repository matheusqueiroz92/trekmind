/**
 * Auth utilities: session (Better Auth) and Bearer JWT for mobile.
 * Use getSession(headers) in API routes to get the current user.
 * @see lib/better-auth.ts
 */

import { auth } from "./better-auth";
import { JwtTokenService } from "@trekmind/infrastructure";

const jwtService = new JwtTokenService();

export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

/** Returns payload if request has valid Authorization: Bearer <token> (e.g. mobile). */
export async function getBearerPayload(
  request: Request
): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return null;
  try {
    return await jwtService.verify(token);
  } catch {
    return null;
  }
}

/** Usuário atual para uso em rotas protegidas (auditoria, personalização). */
export interface CurrentUser {
  id: string;
  email: string;
  name?: string | null;
}

/** Obtém o usuário atual a partir da sessão (Better Auth) ou do Bearer JWT (mobile). */
export async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  const bearer = await getBearerPayload(request);
  if (bearer) {
    return { id: bearer.userId, email: bearer.email, name: null };
  }
  const session = await getSession(request.headers);
  const user = session?.user;
  if (user?.id && user?.email) {
    return { id: user.id, email: user.email, name: user.name ?? null };
  }
  return null;
}
