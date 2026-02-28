"use client";

import dynamic from "next/dynamic";
import type { PlaceMapPoint } from "./PlaceMapClient";

const PlaceMapLeaflet = dynamic(() => import("./PlaceMapClient").then((m) => m.PlaceMapClient), {
  ssr: false,
  loading: () => <PlaceMapFallback />,
});

const PlaceMapGoogle = dynamic(() => import("./PlaceMapGoogle").then((m) => m.PlaceMapGoogle), {
  ssr: false,
  loading: () => <PlaceMapFallback />,
});

function PlaceMapFallback() {
  return (
    <div
      className="bg-slate-200 rounded-lg flex items-center justify-center text-slate-500"
      style={{ height: 280 }}
    >
      Carregando mapa...
    </div>
  );
}

export type { PlaceMapPoint };

type PlaceMapProps = {
  places: PlaceMapPoint[];
  center?: { lat: number; lng: number };
  height?: string;
  className?: string;
};

function getGoogleMapsKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

export function PlaceMap({ places, center, height = "280px", className = "" }: PlaceMapProps) {
  const googleMapsKey = getGoogleMapsKey();

  if (googleMapsKey) {
    return (
      <div className={className}>
        <PlaceMapGoogle apiKey={googleMapsKey} places={places} center={center} height={height} />
      </div>
    );
  }

  return (
    <div className={className}>
      <PlaceMapLeaflet places={places} center={center} height={height} />
    </div>
  );
}
