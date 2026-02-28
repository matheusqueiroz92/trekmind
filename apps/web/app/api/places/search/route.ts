import { NextRequest, NextResponse } from "next/server";
import { SearchPlacesUseCase } from "@trekmind/application";
import { ExternalPlaceRepository, GeocodingServiceImpl } from "@trekmind/infrastructure";
import { placesSearchQuerySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

const placeRepository = new ExternalPlaceRepository();
const geocoding = new GeocodingServiceImpl();
const searchPlaces = new SearchPlacesUseCase(placeRepository, geocoding);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = placesSearchQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      lat: searchParams.get("lat") ?? undefined,
      lng: searchParams.get("lng") ?? undefined,
      address: searchParams.get("address") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      lang: searchParams.get("lang") ?? undefined,
    });
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.SEARCH_QUERY_REQUIRED,
        400
      );
    }
    const { q, lat, lng, address, city, country, lang } = parsed.data;
    const user = await getCurrentUser(request);
    if (user) logger.info("Places search", { userId: user.id });

    const langToUse = lang ?? "pt";
    const places = await searchPlaces.execute({
      query: q,
      latitude: lat,
      longitude: lng,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      lang: langToUse,
    });
    return NextResponse.json(places);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.SEARCH_FAILED);
  }
}
