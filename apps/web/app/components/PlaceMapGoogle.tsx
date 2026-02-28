"use client";

import { useCallback, useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export type PlaceMapGooglePoint = {
  latitude: number;
  longitude: number;
  name?: string;
};

type PlaceMapGoogleProps = {
  apiKey: string;
  places: PlaceMapGooglePoint[];
  center?: { lat: number; lng: number };
  height: string;
  className?: string;
};

const DEFAULT_CENTER = { lat: -23.55, lng: -46.63 };
const DEFAULT_ZOOM = 4;

export function PlaceMapGoogle({
  apiKey,
  places,
  center,
  height,
  className = "",
}: PlaceMapGoogleProps) {
  const { isLoaded } = useJsApiLoader({
    id: "trekmind-google-map",
    googleMapsApiKey: apiKey,
  });

  const initCenter = useMemo(() => {
    if (places.length > 1) {
      const sumLat = places.reduce((s, p) => s + p.latitude, 0);
      const sumLng = places.reduce((s, p) => s + p.longitude, 0);
      return { lat: sumLat / places.length, lng: sumLng / places.length };
    }
    if (places.length === 1) {
      const p = places[0];
      return p
        ? { lat: p.latitude, lng: p.longitude }
        : DEFAULT_CENTER;
    }
    if (center) return center;
    return DEFAULT_CENTER;
  }, [places, center]);

  const zoom = places.length > 0 ? 12 : center ? 14 : DEFAULT_ZOOM;
  const hasPoints = places.length > 0;

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (hasPoints && places.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        places.forEach((p) =>
          bounds.extend({ lat: p.latitude, lng: p.longitude })
        );
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    },
    [places, hasPoints]
  );

  if (!isLoaded) {
    return (
      <div
        className={className}
        style={{
          height,
          width: "100%",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-slate-200)",
        }}
      >
        Carregando mapa...
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={initCenter}
        zoom={zoom}
        onLoad={onLoad}
        options={{
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
          scrollwheel: false,
        }}
      >
        {hasPoints &&
          places.map((p, i) => (
            <Marker
              key={i}
              position={{ lat: p.latitude, lng: p.longitude }}
              title={p?.name}
            />
          ))}
        {!hasPoints && center && (
          <Marker position={center} title="Local" />
        )}
      </GoogleMap>
    </div>
  );
}
