import type { GeocodingService as IGeocodingService, GeocodingResult } from "@trekmind/application";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export class GeocodingServiceImpl implements IGeocodingService {
  async getCoordinatesFromAddress(address: string): Promise<GeocodingResult | null> {
    if (!address?.trim()) return null;
    const params = new URLSearchParams({
      q: address.trim(),
      format: "json",
      limit: "1",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "User-Agent": "TrekMind/1.0" },
    });
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
    if (!data.length) return null;
    const first = data[0];
    return {
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
      formattedAddress: first.display_name,
    };
  }
}
