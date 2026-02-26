import Link from "next/link";
import { LogoutButton } from "./components/logout-button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">TrekMind</h1>
      <p className="text-slate-600 mb-8 text-center">
        Guia turístico inteligente. Descubra lugares, gastronomia e lazer.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/search"
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          Buscar destinos
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-100 transition"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-100 transition"
        >
          Cadastrar
        </Link>
        <LogoutButton />
      </div>
      <Link
        href="/chat"
        className="mt-8 text-emerald-600 hover:underline font-medium"
      >
        Conversar com o assistente de viagens
      </Link>
    </div>
  );
}
