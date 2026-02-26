/**
 * Auth utilities: session is now handled by Better Auth.
 * Use auth.api.getSession({ headers }) in API routes to get the current user.
 * @see lib/better-auth.ts
 */

import { auth } from "./better-auth";

export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}
