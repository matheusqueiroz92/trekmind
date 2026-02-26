export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ILLMClient {
  generate(messages: ChatMessage[], context?: string): Promise<string>;
}
