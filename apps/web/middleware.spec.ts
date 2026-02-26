import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("proxy", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL, init?: RequestInit) => {
        const u = typeof url === "string" ? url : url.toString();
        if (u.includes("/api/auth/get-session")) {
          const cookie = (init?.headers as Record<string, string>)?.cookie ?? "";
          const hasSession = cookie.includes("better-auth.session_token");
          return Promise.resolve({
            ok: hasSession,
            json: () =>
              Promise.resolve(
                hasSession ? { data: { session: {}, user: {} } } : { data: null }
              ),
          } as Response);
        }
        return Promise.resolve(new Response());
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("allows public path / without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/"));
    const res = await proxy(req);
    expect(res?.status).toBe(200);
    expect(res?.headers.get("Location")).toBeNull();
  });

  it("allows /login without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/login"));
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("allows /login/magic-link without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/login/magic-link"));
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("allows /api/auth/* without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/api/auth/sign-in/email"), {
      method: "POST",
    });
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("redirects to /login when accessing protected page without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/search"));
    const res = await proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("Location")).toBe("http://localhost:3000/login");
  });

  it("allows protected page when session exists", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/search"), {
      headers: { cookie: "better-auth.session_token=abc" },
    });
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("returns 401 for protected API without session", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/api/chat"));
    const res = await proxy(req);
    expect(res?.status).toBe(401);
    const json = await res?.json();
    expect(json).toEqual({
      error: "Sessão inválida ou expirada. Faça login novamente.",
    });
  });

  it("allows protected API when session exists", async () => {
    const req = new NextRequest(new URL("http://localhost:3000/api/chat"), {
      headers: { cookie: "better-auth.session_token=xyz" },
    });
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });
});
