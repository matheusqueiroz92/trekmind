import { NextRequest, NextResponse } from "next/server";
import { SearchPlacesUseCase } from "@trekmind/application";
import { ExternalPlaceRepository, GeocodingServiceImpl } from "@trekmind/infrastructure";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";

const placeRepository = new ExternalPlaceRepository();
const geocoding = new GeocodingServiceImpl();
const searchPlaces = new SearchPlacesUseCase(placeRepository, geocoding);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.SEARCH_QUERY_REQUIRED,
        400
      );
    }
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const address = searchParams.get("address") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const country = searchParams.get("country") ?? undefined;

    const places = await searchPlaces.execute({
      query: q,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
    });
    return NextResponse.json(places);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.SEARCH_FAILED);
  }
}
