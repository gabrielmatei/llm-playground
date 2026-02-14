export type Provider = "google" | "openai" | "anthropic";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Tool = {
  name: string;
  description: string;
  parameters: object;
};

export type ToolCall = {
  id?: string;
  name: string;
  args: object;
};

export type ChatRequest = {
  provider?: Provider;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  responseSchema?: object;
  maxRetries?: number;
  timeout?: number;
  tools?: Tool[];
};

export type ChatResponse = {
  content: string;
  toolCalls?: ToolCall[];
  raw?: unknown;
};

export type ChatStreamResponse = AsyncGenerator<string, void, unknown>;

