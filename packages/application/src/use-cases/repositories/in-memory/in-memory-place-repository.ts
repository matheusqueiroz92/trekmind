import { Place } from "@trekmind/domain";
import type { Location } from "@trekmind/domain";
import type { PlaceRepository } from "../place-repository";

export class InMemoryPlaceRepository implements PlaceRepository {
  private places: Place[] = [];

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    category?: string
  ): Promise<Place[]> {
    return this.places.filter((p) => {
      if (category && p.category.getValue() !== category) return false;
      const dist = haversineKm(
        latitude,
        longitude,
        p.coordinates.latitude,
        p.coordinates.longitude
      );
      return dist <= radiusKm;
    });
  }

  async searchByQuery(query: string, _location?: Location | null): Promise<Place[]> {
    const q = query.toLowerCase();
    return this.places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false)
    );
  }

  add(place: Place): void {
    this.places.push(place);
  }

  clear(): void {
    this.places = [];
  }
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
