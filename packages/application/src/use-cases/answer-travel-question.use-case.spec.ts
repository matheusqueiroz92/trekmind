import { describe, it, expect, vi } from "vitest";
import { AnswerTravelQuestionUseCase } from "./answer-travel-question.use-case";
import type { IRetrievalService } from "./services/retrieval-service";
import type { ILLMClient } from "./services/llm-client";

describe("AnswerTravelQuestionUseCase", () => {
  it("should get context and generate answer with retrieval and LLM", async () => {
    const retrieval: IRetrievalService = {
      getContext: vi.fn().mockResolvedValue("Paris has the Eiffel Tower."),
    };
    const llm: ILLMClient = {
      generate: vi.fn().mockResolvedValue("Paris is known for the Eiffel Tower."),
    };
    const sut = new AnswerTravelQuestionUseCase(retrieval, llm);

    const result = await sut.execute({ message: "What is Paris known for?" });

    expect(retrieval.getContext).toHaveBeenCalledWith("What is Paris known for?", undefined);
    expect(llm.generate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({
          role: "user",
          content: expect.stringContaining("Paris has the Eiffel Tower"),
        }),
      ]),
      "Paris has the Eiffel Tower."
    );
    expect(result).toBe("Paris is known for the Eiffel Tower.");
  });

  it("should pass location to retrieval when latitude and longitude provided", async () => {
    const retrieval: IRetrievalService = {
      getContext: vi.fn().mockResolvedValue("Nearby: Copacabana beach."),
    };
    const llm: ILLMClient = {
      generate: vi.fn().mockResolvedValue("You have Copacabana nearby."),
    };
    const sut = new AnswerTravelQuestionUseCase(retrieval, llm);

    await sut.execute({
      message: "What is near me?",
      latitude: -22.97,
      longitude: -43.18,
    });

    expect(retrieval.getContext).toHaveBeenCalledWith("What is near me?", {
      latitude: -22.97,
      longitude: -43.18,
    });
  });

  it("should not pass location when only one coordinate is provided", async () => {
    const retrieval: IRetrievalService = {
      getContext: vi.fn().mockResolvedValue("Context without location."),
    };
    const llm: ILLMClient = { generate: vi.fn().mockResolvedValue("Answer.") };
    const sut = new AnswerTravelQuestionUseCase(retrieval, llm);

    await sut.execute({
      message: "Tell me about Rio",
      latitude: -22.97,
    });

    expect(retrieval.getContext).toHaveBeenCalledWith("Tell me about Rio", undefined);
  });
});
