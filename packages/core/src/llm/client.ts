import { getEnv, getOptionalEnv } from "../config.js";
import { ChatRequest, ChatResponse, ChatStreamResponse, Provider } from "./types.js";
import { geminiChat, geminiStreamChat } from "./providers/gemini.js";

export async function chat(req: Omit<ChatRequest, "model"> & { model?: string }): Promise<ChatResponse> {
  const provider = req.provider ?? getOptionalEnv<Provider>("LLM_PROVIDER", "google");

  if (provider === "google") {
    const apiKey = getEnv("GEMINI_API_KEY");
    const model = req.model ?? getOptionalEnv("GEMINI_MODEL", "gemini-2.0-flash");
    return geminiChat(apiKey, { ...req, model, provider });
  }

  throw new Error(`Provider ${provider} is not supported yet. Only 'google' (Gemini) is integrated.`);
}

export function streamChat(req: Omit<ChatRequest, "model"> & { model?: string }): ChatStreamResponse {
  const provider = req.provider ?? getOptionalEnv<Provider>("LLM_PROVIDER", "google");

  if (provider === "google") {
    const apiKey = getEnv("GEMINI_API_KEY");
    const model = req.model ?? getOptionalEnv("GEMINI_MODEL", "gemini-2.0-flash");
    return geminiStreamChat(apiKey, { ...req, model, provider });
  }

  throw new Error(`Provider ${provider} is not supported yet. Only 'google' (Gemini) is integrated.`);
}

