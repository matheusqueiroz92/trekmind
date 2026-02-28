import { NextRequest, NextResponse } from "next/server";
import { GetNearbyPlacesUseCase } from "@trekmind/application";
import { ExternalPlaceRepository } from "@trekmind/infrastructure";
import { placeSearchQuerySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

const placeRepository = new ExternalPlaceRepository();
const getNearbyPlaces = new GetNearbyPlacesUseCase(placeRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");
    if (latRaw == null || latRaw === "" || lngRaw == null || lngRaw === "") {
      return apiErrorResponse(
        API_ERROR_MESSAGES.NEARBY_COORDS_REQUIRED,
        400
      );
    }
    const parsed = placeSearchQuerySchema.safeParse({
      lat: latRaw,
      lng: lngRaw,
      radius: searchParams.get("radius") ?? 10,
      lang: searchParams.get("lang") ?? undefined,
    });
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.NEARBY_COORDS_REQUIRED,
        400
      );
    }
    const { lat, lng, radius, category, lang } = parsed.data;
    const langToUse = lang ?? "pt";
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.NEARBY_COORDS_REQUIRED,
        400
      );
    }
    const user = await getCurrentUser(request);
    if (user) logger.info("Places nearby", { userId: user.id });

    const places = await getNearbyPlaces.execute({
      latitude: lat,
      longitude: lng,
      radiusKm: radius ?? 10,
      category,
      lang: langToUse,
    });
    return NextResponse.json(places);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.NEARBY_FAILED);
  }
}
