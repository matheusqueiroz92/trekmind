import type { PlaceRepository } from "./repositories/place-repository";
import type { PlaceDTO } from "../dtos/place.dto";

export interface GetNearbyPlacesRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: string;
  lang?: string;
}

export class GetNearbyPlacesUseCase {
  constructor(private placeRepository: PlaceRepository) {}

  async execute(request: GetNearbyPlacesRequest): Promise<PlaceDTO[]> {
    const places = await this.placeRepository.findNearby(
      request.latitude,
      request.longitude,
      request.radiusKm,
      request.category,
      request.lang
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
  url?: string;
  imageUrl?: string;
  wikipediaTitle?: string;
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
    url: place.url,
    imageUrl: place.imageUrl,
    wikipediaTitle: place.wikipediaTitle,
    createdAt: place.createdAt,
  };
}
