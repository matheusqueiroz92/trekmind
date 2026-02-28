"use client";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon in Next.js (paths break with bundler)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

export type PlaceMapPoint = {
  latitude: number;
  longitude: number;
  name?: string;
};

type PlaceMapClientProps = {
  places: PlaceMapPoint[];
  center?: { lat: number; lng: number };
  height: string;
};

function getInitialView(
  places: PlaceMapPoint[],
  center?: { lat: number; lng: number }
): { center: [number, number]; zoom: number } {
  if (places.length > 1) {
    const sumLat = places.reduce((s, p) => s + p.latitude, 0);
    const sumLng = places.reduce((s, p) => s + p.longitude, 0);
    return {
      center: [sumLat / places.length, sumLng / places.length],
      zoom: 12,
    };
  }
  if (places.length === 1) {
    const p = places[0];
    return {
      center: [p?.latitude ?? 0, p?.longitude ?? 0],
      zoom: 14,
    };
  }
  if (center) {
    return { center: [center.lat, center.lng], zoom: 14 };
  }
  return { center: [-23.55, -46.63], zoom: 4 };
}

export function PlaceMapClient({ places, center, height }: PlaceMapClientProps) {
  const { center: initCenter, zoom } = getInitialView(places, center);
  const hasPoints = places.length > 0;

  return (
    <div style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <MapContainer
        center={initCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPoints &&
          places.map((p, i) => (
            <Marker key={i} position={[p.latitude, p.longitude]}>
              {p.name && <Popup>{p.name}</Popup>}
            </Marker>
          ))}
        {!hasPoints && center && (
          <Marker position={[center.lat, center.lng]}>
            <Popup>Local</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
