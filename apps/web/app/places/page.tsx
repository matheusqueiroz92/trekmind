"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { PlaceCard, type PlaceCardData } from "../components/PlaceCard";
import { PlaceDetailModal } from "../components/PlaceDetailModal";
import { PlaceMap } from "../components/PlaceMap";

type ByCategoryData = {
  restaurant: PlaceCardData[];
  lodging: PlaceCardData[];
  tourist_attraction: PlaceCardData[];
  bar: PlaceCardData[];
};

const CATEGORY_LABELS: Record<keyof ByCategoryData, string> = {
  restaurant: "Restaurantes",
  lodging: "Hospedagem",
  tourist_attraction: "Pontos turísticos",
  bar: "Bares e vida noturna",
};

function placeFromCategory(
  item: PlaceCardData,
  category: keyof ByCategoryData
): PlaceCardData {
  return { ...item, category };
}

function PlacesContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const resolvedName = searchParams.get("name");

  const [places, setPlaces] = useState<PlaceCardData[]>([]);
  const [byCategory, setByCategory] = useState<ByCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceCardData | null>(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError("");
    setByCategory(null);
    try {
      if (q) {
        const categoryParams = new URLSearchParams({
          q: q,
          lang: "pt",
          categories: "restaurant,lodging,tourist_attraction,bar",
        });
        if (lat != null && lng != null) {
          categoryParams.set("lat", lat);
          categoryParams.set("lng", lng);
        }
        const [searchRes, categoryRes] = await Promise.all([
          lat != null && lng != null
            ? fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=15&lang=pt`)
            : fetch(`/api/places/search?q=${encodeURIComponent(q)}&lang=pt`),
          fetch(`/api/places/by-category?${categoryParams}`),
        ]);
        if (!searchRes.ok) {
          const data = await searchRes.json().catch(() => ({}));
          setError(data?.error ?? "Não foi possível buscar.");
          setPlaces([]);
          return;
        }
        const searchData = await searchRes.json();
        setPlaces(Array.isArray(searchData) ? searchData : []);

        if (categoryRes.ok) {
          const catData = await categoryRes.json();
          setByCategory({
            restaurant: (catData.restaurant ?? []).map((p: PlaceCardData) =>
              placeFromCategory(p, "restaurant")
            ),
            lodging: (catData.lodging ?? []).map((p: PlaceCardData) =>
              placeFromCategory(p, "lodging")
            ),
            tourist_attraction: (catData.tourist_attraction ?? []).map(
              (p: PlaceCardData) => placeFromCategory(p, "tourist_attraction")
            ),
            bar: (catData.bar ?? []).map((p: PlaceCardData) =>
              placeFromCategory(p, "bar")
            ),
          });
        }
      } else if (lat != null && lng != null) {
        const res = await fetch(
          `/api/places/nearby?lat=${lat}&lng=${lng}&radius=15&lang=pt`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "Não foi possível buscar lugares próximos.");
          setPlaces([]);
          return;
        }
        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      } else {
        setPlaces([]);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [q, lat, lng, resolvedName]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const hasSearch = q || (lat != null && lng != null);
  const hasResults = places.length > 0 || (byCategory && (
    byCategory.restaurant.length > 0 ||
    byCategory.lodging.length > 0 ||
    byCategory.tourist_attraction.length > 0 ||
    byCategory.bar.length > 0
  ));
  const allPointsForMap = [
    ...places,
    ...(byCategory
      ? [
          ...byCategory.restaurant,
          ...byCategory.lodging,
          ...byCategory.tourist_attraction,
          ...byCategory.bar,
        ]
      : []),
  ];

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <nav className="mb-6">
        <Link href="/search" className="text-emerald-600 hover:underline">
          Nova busca
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        {resolvedName || q || "Lugares encontrados"}
      </h1>

      {!hasSearch && (
        <p className="text-slate-600">
          Use a busca para encontrar lugares ou use sua localização.
        </p>
      )}

      {hasSearch && loading && (
        <p className="text-slate-600">Buscando...</p>
      )}

      {hasSearch && !loading && error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {hasSearch && !loading && !error && !hasResults && (
        <p className="text-slate-600">Nenhum lugar encontrado.</p>
      )}

      {hasSearch && !loading && !error && hasResults && (
        <>
          {(places.length > 0 || resolvedName || (lat != null && lng != null)) && places[0] && (
            <section className="mb-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Sobre o lugar
              </h2>
              <p className="text-slate-600 mb-4">
                {places[0].description ?? places[0].name}
              </p>
            </section>
          )}
          {allPointsForMap.length > 0 && (
            <div className="mb-6">
              <PlaceMap
                places={allPointsForMap.map((p) => ({
                  latitude: p.latitude,
                  longitude: p.longitude,
                  name: p.name,
                }))}
                height="280px"
                className="rounded-lg overflow-hidden border border-slate-200"
              />
            </div>
          )}

          {places.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                Sobre o lugar
              </h2>
              <ul className="space-y-4">
                {places.map((p) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    onSelect={setSelectedPlace}
                  />
                ))}
              </ul>
            </section>
          )}

          {byCategory &&
            (byCategory.restaurant.length > 0 ||
              byCategory.lodging.length > 0 ||
              byCategory.tourist_attraction.length > 0 ||
              byCategory.bar.length > 0) && (
              <>
                {(["restaurant", "lodging", "tourist_attraction", "bar"] as const).map(
                  (key) =>
                    byCategory[key].length > 0 && (
                      <section key={key} className="mb-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-3">
                          {CATEGORY_LABELS[key]}
                        </h2>
                        <ul className="space-y-4">
                          {byCategory[key].map((p) => (
                            <PlaceCard
                              key={p.id}
                              place={p}
                              onSelect={setSelectedPlace}
                            />
                          ))}
                        </ul>
                      </section>
                    )
                )}
              </>
            )}
        </>
      )}

      {selectedPlace && (
        <PlaceDetailModal
          title={selectedPlace.wikipediaTitle ?? selectedPlace.name}
          lang="pt"
          latitude={selectedPlace.latitude}
          longitude={selectedPlace.longitude}
          onClose={() => setSelectedPlace(null)}
        />
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
