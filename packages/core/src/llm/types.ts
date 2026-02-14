export type Provider = "google" | "openai" | "anthropic";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  provider?: Provider;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  responseSchema?: object;
  maxRetries?: number;
  timeout?: number;
};

export type ChatResponse = {
  content: string;
  raw?: unknown;
};

export type ChatStreamResponse = AsyncGenerator<string, void, unknown>;

