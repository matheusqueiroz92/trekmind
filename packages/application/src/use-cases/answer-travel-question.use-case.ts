import type { IRetrievalService } from "./services/retrieval-service";
import type { ILLMClient } from "./services/llm-client";

export interface AnswerTravelQuestionRequest {
  message: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Travel agent use case: always retrieves context via RAG (search + Wikipedia)
 * before generating an answer, to avoid hallucination.
 */
export class AnswerTravelQuestionUseCase {
  constructor(
    private retrievalService: IRetrievalService,
    private llmClient: ILLMClient
  ) {}

  async execute(request: AnswerTravelQuestionRequest): Promise<string> {
    const location =
      request.latitude != null && request.longitude != null
        ? { latitude: request.latitude, longitude: request.longitude }
        : undefined;

    const context = await this.retrievalService.getContext(
      request.message,
      location
    );

    const systemPrompt = `You are a helpful travel guide. Use ONLY the context below to answer. If the context does not contain relevant information, say so. Do not make up places or facts. Be concise and helpful.`;
    const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Context:\n${context}\n\nUser question: ${request.message}` },
    ];

    return this.llmClient.generate(messages, context);
  }
}
