"use client";

import Image from "next/image";

export type PlaceCardData = {
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  url?: string;
  imageUrl?: string;
  wikipediaTitle?: string;
};

type PlaceCardProps = {
  place: PlaceCardData;
  onSelect: (place: PlaceCardData) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurante",
  museum: "Museu",
  beach: "Praia",
  trail: "Trilha",
  hotel: "Hotel",
  lodging: "Hospedagem",
  bar: "Bar",
  nightlife: "Vida noturna",
  park: "Parque",
  waterfall: "Cachoeira",
  river: "Rio",
  shopping: "Compras",
  club: "Clube",
  water_park: "Parque aquático",
  tourist_attraction: "Ponto turístico",
  other: "Ponto de interesse",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function PlaceCard({ place, onSelect }: PlaceCardProps) {
  const categoryLabel = getCategoryLabel(place.category);
  const excerpt = place.description
    ? truncate(place.description, 120)
    : null;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(place)}
        className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-emerald-400 hover:shadow-md transition flex gap-4"
      >
        {place.imageUrl ? (
          <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden relative">
            <Image
              src={place.imageUrl}
              alt=""
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-lg flex-shrink-0 bg-slate-100 flex items-center justify-center text-slate-400 text-2xl"
            aria-hidden
          >
            —
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-800">{place.name}</h2>
          <p className="text-sm text-slate-500">{categoryLabel}</p>
          {excerpt && (
            <p className="mt-2 text-slate-600 text-sm line-clamp-2">
              {excerpt}
            </p>
          )}
          <span className="mt-2 inline-block text-sm text-emerald-600 font-medium">
            Ver mais →
          </span>
        </div>
      </button>
    </li>
  );
}
