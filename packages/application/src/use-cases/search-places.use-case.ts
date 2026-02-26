import { Location } from "@trekmind/domain";
import type { PlaceRepository } from "./repositories/place-repository";
import type { GeocodingService } from "./services/geocoding-service";
import type { PlaceDTO } from "../dtos/place.dto";

export interface SearchPlacesRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
}

export class SearchPlacesUseCase {
  constructor(
    private placeRepository: PlaceRepository,
    private geocodingService: GeocodingService | null
  ) {}

  async execute(request: SearchPlacesRequest): Promise<PlaceDTO[]> {
    let location: Location | null = null;

    if (request.latitude != null && request.longitude != null) {
      location = Location.fromCoordinates({
        latitude: request.latitude,
        longitude: request.longitude,
      });
    } else if (request.address ?? request.city ?? request.country) {
      const address =
        [request.address, request.city, request.country].filter(Boolean).join(", ") ||
        "";
      const coords = this.geocodingService
        ? await this.geocodingService.getCoordinatesFromAddress(address)
        : null;
      if (!coords) return [];
      location = Location.fromCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }

    const places = await this.placeRepository.searchByQuery(
      request.query,
      location
    );
    return places.map(toPlaceDTO);
  }
}

function toPlaceDTO(place: {
  id: string;
  name: string;
  description?: string;
  category: { getValue(): string };
  coordinates: { latitude: number; longitude: number };
  address?: { getValue(): string };
  source?: string;
  createdAt: Date;
}): PlaceDTO {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    category: place.category.getValue(),
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
    address: place.address?.getValue(),
    source: place.source,
    createdAt: place.createdAt,
  };
}
