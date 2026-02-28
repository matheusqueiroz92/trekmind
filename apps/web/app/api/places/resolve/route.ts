import { NextRequest, NextResponse } from "next/server";
import { ResolvePlaceUseCase } from "@trekmind/application";
import { GeocodingServiceImpl } from "@trekmind/infrastructure";
import { placeResolveQuerySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

const geocoding = new GeocodingServiceImpl();
const resolvePlace = new ResolvePlaceUseCase(geocoding);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = placeResolveQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
    });
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.RESOLVE_QUERY_REQUIRED,
        400
      );
    }
    const { q } = parsed.data;
    const user = await getCurrentUser(request);
    if (user) logger.info("Place resolve", { userId: user.id, q });

    const result = await resolvePlace.execute({ query: q });
    if (!result) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.RESOLVE_NOT_FOUND,
        404
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.RESOLVE_FAILED);
  }
}
