"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import Link from "next/link";

function PlacesContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const places = useMemo(() => {
    if (!dataParam) return [];
    try {
      return JSON.parse(decodeURIComponent(dataParam)) as Array<{
        id: string;
        name: string;
        description?: string;
        category: string;
        latitude: number;
        longitude: number;
        address?: string;
      }>;
    } catch {
      return [];
    }
  }, [dataParam]);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <nav className="mb-6">
        <Link href="/search" className="text-emerald-600 hover:underline">
          Nova busca
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Lugares encontrados</h1>
      {places.length === 0 ? (
        <p className="text-slate-600">Nenhum lugar encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {places.map((p) => (
            <li
              key={p.id}
              className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <h2 className="font-semibold text-slate-800">{p.name}</h2>
              <p className="text-sm text-slate-500 capitalize">{p.category}</p>
              {p.description && (
                <p className="mt-2 text-slate-600 text-sm">{p.description}</p>
              )}
              {p.address && (
                <p className="mt-1 text-slate-500 text-xs">{p.address}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PlacesPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <PlacesContent />
    </Suspense>
  );
}
