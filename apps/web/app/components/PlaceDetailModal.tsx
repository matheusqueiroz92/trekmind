"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlaceMap } from "./PlaceMap";

export type PlaceDetailsData = {
  title: string;
  extract: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
  pageId?: number;
  /** Indica que o conteúdo está em inglês (fallback PT→EN). */
  lang?: string;
};

type PlaceDetailModalProps = {
  title: string;
  lang?: string;
  latitude?: number;
  longitude?: number;
  onClose: () => void;
};

function buildMapsUrl(title: string, lat?: number, lng?: number): string {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}`;
}

export function PlaceDetailModal({
  title,
  lang = "pt",
  latitude: propLat,
  longitude: propLng,
  onClose,
}: PlaceDetailModalProps) {
  const [details, setDetails] = useState<PlaceDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(
      `/api/places/details?title=${encodeURIComponent(title)}&lang=${encodeURIComponent(lang)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar detalhes");
        return res.json();
      })
      .then((data: PlaceDetailsData) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os detalhes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [title, lang]);

  const mapsUrl =
    details &&
    buildMapsUrl(details.title, details.latitude, details.longitude);

  const mapCenter =
    details?.latitude != null && details?.longitude != null
      ? { lat: details.latitude, lng: details.longitude }
      : propLat != null && propLng != null
        ? { lat: propLat, lng: propLng }
        : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-detail-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col min-h-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 relative bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center rounded-t-xl">
          <h2 id="place-detail-title" className="font-semibold text-slate-800 truncate pr-10">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          {loading && (
            <p className="text-slate-500 py-8 text-center">
              Carregando detalhes...
            </p>
          )}
          {error && (
            <p className="text-red-600 py-4">{error}</p>
          )}
          {!loading && !error && details && (
            <>
              {details.lang === "en" && (
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-sm">
                  Conteúdo disponível em inglês.
                </p>
              )}
              {details.thumbnailUrl && (
                <div className="w-full h-48 relative rounded-lg overflow-hidden mb-4">
                  <Image
                    src={details.thumbnailUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {details.description && (
                <p className="text-sm text-slate-500 mb-2">
                  {details.description}
                </p>
              )}
              <p className="text-slate-700 whitespace-pre-wrap">
                {details.extract}
              </p>
              {mapCenter && (
                <div className="my-4 h-[200px] min-h-[200px] max-h-[200px] w-full overflow-hidden rounded-lg border border-slate-200 shrink-0">
                  <PlaceMap
                    places={[]}
                    center={mapCenter}
                    height="200px"
                    className="rounded-lg overflow-hidden border-0 h-full w-full"
                  />
                </div>
              )}
              <p className="text-sm text-slate-500 mt-2">
                Veja fotos e publicações sobre este lugar nas redes:
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={details.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm"
                >
                  Ver na Wikipedia
                </a>
                <a
                  href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(details.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 font-medium text-sm"
                >
                  Ver no Instagram
                </a>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
                  >
                    Ver no mapa
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 -z-10"
        aria-label="Fechar overlay"
      />
    </div>
  );
}
