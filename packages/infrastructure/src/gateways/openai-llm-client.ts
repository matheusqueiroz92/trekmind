import OpenAI from "openai";
import type { ILLMClient, ChatMessage } from "@trekmind/application";

export class OpenAILLMClient implements ILLMClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY ?? "",
    });
  }

  async generate(
    messages: ChatMessage[],
    _context?: string
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      max_tokens: 1024,
    });
    const choice = response.choices[0];
    return choice?.message?.content ?? "";
  }
}
