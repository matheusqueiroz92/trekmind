"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { API_ERROR_MESSAGES } from "@/lib/api-errors";

export default function MagicLinkLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });
      if (err) {
        setError(err.message ?? API_ERROR_MESSAGES.AUTH_MAGIC_LINK_FAILED);
        return;
      }
      setSent(true);
    } catch {
      setError(API_ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Verifique seu e-mail
          </h1>
          <p className="text-slate-600 mb-6">
            Enviamos um link de acesso para <strong>{email}</strong>. Clique no
            link para entrar.
          </p>
          <Link
            href="/login"
            className="text-emerald-600 hover:underline font-medium"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Entrar com link por e-mail
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>
        <p className="mt-4 text-slate-600 text-sm">
          <Link href="/login" className="text-emerald-600 hover:underline">
            Voltar ao login com senha
          </Link>
        </p>
      </div>
    </div>
  );
}
