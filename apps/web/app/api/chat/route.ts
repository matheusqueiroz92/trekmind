import { NextResponse } from "next/server";
import { AnswerTravelQuestionUseCase } from "@trekmind/application";
import {
  ExternalPlaceRepository,
  WikipediaGateway,
  GeocodingServiceImpl,
  TravelRetrievalService,
  OpenAILLMClient,
} from "@trekmind/infrastructure";
import {
  apiErrorResponse,
  handleRouteError,
  API_ERROR_MESSAGES,
} from "@/lib/api-errors";

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
    const body = (await request.json()) as {
      message?: string;
      latitude?: number;
      longitude?: number;
    };
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return apiErrorResponse(
        API_ERROR_MESSAGES.CHAT_MESSAGE_REQUIRED,
        400
      );
    }
    const latitude =
      typeof body.latitude === "number" ? body.latitude : undefined;
    const longitude =
      typeof body.longitude === "number" ? body.longitude : undefined;

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
