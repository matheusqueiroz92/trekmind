import type { PlaceDTO } from "../../dtos/place.dto";

export type PlaceCategoryType =
  | "restaurant"
  | "lodging"
  | "tourist_attraction"
  | "bar";

export interface SearchByCategoryRequest {
  query?: string;
  latitude?: number;
  longitude?: number;
  category: PlaceCategoryType;
  lang?: string;
}

/**
 * Provider that returns places for a given category (e.g. from Google Places API).
 * Used to show restaurants, lodging, bars, and tourist attractions with photos.
 */
export interface IPlacesByCategoryProvider {
  searchByCategory(request: SearchByCategoryRequest): Promise<PlaceDTO[]>;
}

export type PlacesByCategoryResult = {
  restaurant: PlaceDTO[];
  lodging: PlaceDTO[];
  tourist_attraction: PlaceDTO[];
  bar: PlaceDTO[];
};
