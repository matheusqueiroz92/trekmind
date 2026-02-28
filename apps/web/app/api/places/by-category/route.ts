import { NextRequest, NextResponse } from "next/server";
import { SearchPlacesByCategoryUseCase } from "@trekmind/application";
import { GooglePlacesGateway } from "@trekmind/infrastructure";
import { placesByCategoryQuerySchema } from "@trekmind/shared";
import type { PlaceCategoryType } from "@trekmind/application";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

const VALID_CATEGORIES: PlaceCategoryType[] = [
  "restaurant",
  "lodging",
  "tourist_attraction",
  "bar",
];

function parseCategories(categories: string[] | undefined): PlaceCategoryType[] {
  if (!categories?.length) return VALID_CATEGORIES;
  const set = new Set(
    categories.filter((c) =>
      VALID_CATEGORIES.includes(c as PlaceCategoryType)
    ) as PlaceCategoryType[]
  );
  return set.size > 0 ? Array.from(set) : VALID_CATEGORIES;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = placesByCategoryQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      lang: searchParams.get("lang") ?? undefined,
      lat: searchParams.get("lat") ?? undefined,
      lng: searchParams.get("lng") ?? undefined,
      categories: searchParams.get("categories") ?? undefined,
    });
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.BY_CATEGORY_QUERY_REQUIRED,
        400
      );
    }
    const { q, lang, lat, lng, categories } = parsed.data;
    const user = await getCurrentUser(request);
    if (user) logger.info("Places by category", { userId: user.id, q });

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const gateway = new GooglePlacesGateway(apiKey);
    const useCase = new SearchPlacesByCategoryUseCase(gateway);

    const result = await useCase.execute({
      query: q,
      latitude: lat,
      longitude: lng,
      categories: parseCategories(categories),
      lang: lang ?? "pt",
    });

    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.BY_CATEGORY_FAILED);
  }
}
