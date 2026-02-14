import { getEnv, getOptionalEnv } from "../config.js";
import { ChatRequest, ChatResponse, ChatStreamResponse, Provider } from "./types.js";
import { geminiChat, geminiStreamChat } from "./providers/gemini.js";

async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; timeout?: number }
): Promise<T> {
  const maxRetries = options.maxRetries ?? 0;
  const timeout = options.timeout;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const promise = fn();
      if (!timeout) {
        return await promise;
      }

      // Timeout wrapper
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
      });

      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;

    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms... Error: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function chat(req: Omit<ChatRequest, "model"> & { model?: string }): Promise<ChatResponse> {
  return withRetryAndTimeout(async () => {
    const provider = req.provider ?? getOptionalEnv<Provider>("LLM_PROVIDER", "google");

    if (provider === "google") {
      const apiKey = getEnv("GEMINI_API_KEY");
      const model = req.model ?? getOptionalEnv("GEMINI_MODEL", "gemini-2.5-flash-lite");
      return geminiChat(apiKey, { ...req, model, provider });
    }

    throw new Error(`Provider ${provider} is not supported yet. Only 'google' (Gemini) is integrated.`);
  }, { maxRetries: req.maxRetries, timeout: req.timeout });
}

export function streamChat(req: Omit<ChatRequest, "model"> & { model?: string }): ChatStreamResponse {
  const provider = req.provider ?? getOptionalEnv<Provider>("LLM_PROVIDER", "google");

  if (provider === "google") {
    const apiKey = getEnv("GEMINI_API_KEY");
    const model = req.model ?? getOptionalEnv("GEMINI_MODEL", "gemini-2.5-flash-lite");
    return geminiStreamChat(apiKey, { ...req, model, provider });
  }

  throw new Error(`Provider ${provider} is not supported yet. Only 'google' (Gemini) is integrated.`);
}

