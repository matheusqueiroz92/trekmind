export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface GeocodingService {
  getCoordinatesFromAddress(address: string): Promise<GeocodingResult | null>;
}
