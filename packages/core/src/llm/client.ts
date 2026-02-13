import { getEnv, getOptionalEnv } from "../config.js";
import { ChatRequest, ChatResponse, Provider } from "./types.js";
import { geminiChat } from "./providers/gemini.js";

export async function chat(req: Omit<ChatRequest, "model"> & { model?: string }): Promise<ChatResponse> {
  const provider = req.provider ?? getOptionalEnv<Provider>("LLM_PROVIDER", "google");

  if (provider === "google") {
    const apiKey = getEnv("GEMINI_API_KEY");
    const model = req.model ?? getOptionalEnv("GEMINI_MODEL", "gemini-2.0-flash");
    return geminiChat(apiKey, { ...req, model, provider });
  }

  throw new Error(`Provider ${provider} is not supported yet. Only 'google' (Gemini) is integrated.`);
}

