import { NextResponse } from "next/server";
import { AnswerTravelQuestionUseCase } from "@trekmind/application";
import {
  ExternalPlaceRepository,
  WikipediaGateway,
  GeocodingServiceImpl,
  TravelRetrievalService,
  OpenAILLMClient,
} from "@trekmind/infrastructure";
import { chatRequestBodySchema } from "@trekmind/shared";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { validateEnv } from "@/lib/validate-env";

const placeRepository = new ExternalPlaceRepository();
const wikiGateway = new WikipediaGateway();
const geocoding = new GeocodingServiceImpl();
const retrievalService = new TravelRetrievalService({
  placeRepository,
  wikiProvider: wikiGateway,
  geocodingService: geocoding,
});
const llmClient = new OpenAILLMClient();
const answerTravelQuestion = new AnswerTravelQuestionUseCase(
  retrievalService,
  llmClient
);

export async function POST(request: Request) {
  try {
    validateEnv();
    const id = getClientIdentifier(request);
    const limit = checkRateLimit(`chat:${id}`, { windowMs: 60_000, max: 30 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: API_ERROR_MESSAGES.RATE_LIMIT },
        { status: 429, headers: limit.retryAfterMs ? { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } : undefined }
      );
    }
    const raw = (await request.json()) as unknown;
    const parsed = chatRequestBodySchema.safeParse(raw);
    if (!parsed.success) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.CHAT_MESSAGE_REQUIRED,
        400
      );
    }
    const { message, latitude, longitude } = parsed.data;
    if (!message || message.trim().length === 0) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.CHAT_MESSAGE_REQUIRED,
        400
      );
    }

    const user = await getCurrentUser(request);
    if (user) {
      logger.info("Chat request", { userId: user.id });
    }

    const answer = await answerTravelQuestion.execute({
      message,
      latitude,
      longitude,
    });
    return NextResponse.json({ answer });
  } catch (err) {
    return handleRouteError(err, API_ERROR_MESSAGES.CHAT_FAILED);
  }
}
