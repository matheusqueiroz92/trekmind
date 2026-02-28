"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  parseApiErrorFromResponse,
  parseApiError,
} from "@/lib/parse-api-error";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    const term = query.trim();
    try {
      const resolveRes = await fetch(
        `/api/places/resolve?q=${encodeURIComponent(term)}`
      );
      if (resolveRes.ok) {
        const resolved = await resolveRes.json() as { name: string; latitude: number; longitude: number };
        router.push(
          `/places?lat=${resolved.latitude}&lng=${resolved.longitude}&q=${encodeURIComponent(term)}&name=${encodeURIComponent(resolved.name)}`
        );
        return;
      }
      const searchRes = await fetch(
        `/api/places/search?q=${encodeURIComponent(term)}&lang=pt`
      );
      if (!searchRes.ok) {
        const parsed = await parseApiErrorFromResponse(searchRes);
        setError(parsed.message);
        return;
      }
      router.push(`/places?q=${encodeURIComponent(term)}`);
    } catch {
      setError(parseApiError(null).message);
    } finally {
      setLoading(false);
    }
  }

  async function useMyLocation() {
    setLoading(true);
    setError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=15`
      );
      if (!res.ok) {
        const parsed = await parseApiErrorFromResponse(res);
        setError(parsed.message);
        return;
      }
      router.push(`/places?lat=${latitude}&lng=${longitude}`);
    } catch {
      setError(parseApiError(null).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <nav className="mb-8">
        <Link href="/" className="text-emerald-600 hover:underline">
          Voltar
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Onde você quer explorar?
      </h1>
      <form onSubmit={handleSearch} className="space-y-4 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cidade, endereço ou ponto de interesse"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>
      <div className="mt-4 max-w-md">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={loading}
          className="w-full px-4 py-3 border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 disabled:opacity-50"
        >
          Usar minha localização
        </button>
      </div>
      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
