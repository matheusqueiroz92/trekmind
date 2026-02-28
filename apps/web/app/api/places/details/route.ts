import { NextRequest, NextResponse } from "next/server";
import { GetPlaceDetailsUseCase } from "@trekmind/application";
import { WikipediaGateway } from "@trekmind/infrastructure";
import { placeDetailsQuerySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

const wikipedia = new WikipediaGateway();
const getPlaceDetails = new GetPlaceDetailsUseCase(wikipedia);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = placeDetailsQuerySchema.safeParse({
      title: searchParams.get("title") ?? undefined,
      lang: searchParams.get("lang") ?? undefined,
    });
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.DETAILS_TITLE_REQUIRED,
        400
      );
    }
    const { title, lang } = parsed.data;
    const user = await getCurrentUser(request);
    if (user) logger.info("Place details", { userId: user.id, title });

    const langToUse = lang ?? "pt";
    const details = await getPlaceDetails.execute({ title, lang: langToUse });
    if (!details) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.DETAILS_NOT_FOUND,
        404
      );
    }
    return NextResponse.json(details);
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.DETAILS_FAILED);
  }
}
