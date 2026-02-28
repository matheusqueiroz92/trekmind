import { Place } from "@trekmind/domain";
import type { Location } from "@trekmind/domain";

export interface PlaceRepository {
  findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    category?: string,
    lang?: string
  ): Promise<Place[]>;

  searchByQuery(
    query: string,
    location?: Location | null,
    lang?: string
  ): Promise<Place[]>;
}
