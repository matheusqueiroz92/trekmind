import { NextRequest, NextResponse } from "next/server";
import { GetNearbyPlacesUseCase } from "@trekmind/application";
import { ExternalPlaceRepository } from "@trekmind/infrastructure";
import { placeSearchQuerySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";

const placeRepository = new ExternalPlaceRepository();
const getNearbyPlaces = new GetNearbyPlacesUseCase(placeRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = placeSearchQuerySchema.safeParse({
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
      radius: searchParams.get("radius") ?? 10,
    });
    if (!parsed.success || parsed.data.lat == null || parsed.data.lng == null) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.NEARBY_COORDS_REQUIRED,
        400
      );
    }
    const { lat, lng, radius, category } = parsed.data;
    const places = await getNearbyPlaces.execute({
      latitude: lat,
      longitude: lng,
      radiusKm: radius ?? 10,
      category,
    });
    return NextResponse.json(places);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.NEARBY_FAILED);
  }
}
