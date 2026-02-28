import type { GeocodingService } from "./services/geocoding-service";

export interface ResolvePlaceRequest {
  query: string;
}

export interface ResolvePlaceResult {
  name: string;
  latitude: number;
  longitude: number;
}

export class ResolvePlaceUseCase {
  constructor(private geocodingService: GeocodingService) {}

  async execute(request: ResolvePlaceRequest): Promise<ResolvePlaceResult | null> {
    const query = request.query?.trim();
    if (!query) return null;

    const result = await this.geocodingService.getCoordinatesFromAddress(query);
    if (!result) return null;

    return {
      name: result.formattedAddress ?? query,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  }
}
