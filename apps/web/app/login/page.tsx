"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, type UserLoginSchema } from "@trekmind/shared";
import { authClient } from "@/lib/auth-client";
import { API_ERROR_MESSAGES } from "@/lib/api-errors";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit: rhfSubmit,
    formState: { errors },
  } = useForm<UserLoginSchema>({
    resolver: zodResolver(userLoginSchema),
  });

  async function onSubmit(data: UserLoginSchema) {
    setError("");
    setLoading(true);
    try {
      const { data: result, error: err } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });
      if (err) {
        setError(err.message ?? API_ERROR_MESSAGES.AUTH_LOGIN_FAILED);
        return;
      }
      if (result) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(API_ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    setError("");
    await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Entrar</h1>
        <form onSubmit={rhfSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <p className="text-center text-slate-500 text-sm">ou continue com</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignIn("github")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              GitHub
            </button>
          </div>
        </div>
        <p className="mt-4 text-slate-600 text-sm">
          <Link
            href="/login/magic-link"
            className="text-emerald-600 hover:underline"
          >
            Entrar com link por e-mail
          </Link>
        </p>
        <p className="mt-2 text-slate-600 text-sm">
          Não tem conta?{" "}
          <Link href="/register" className="text-emerald-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
        <Link
          href="/"
          className="block mt-4 text-slate-500 hover:underline text-sm"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
