import { GoogleGenAI } from "@google/genai";
import { ChatRequest, ChatResponse } from "../types.js";

export async function geminiChat(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
  const gemini = new GoogleGenAI({ apiKey });

  const response = await gemini.models.generateContent({
    model: req.model,
    contents: req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    config: {
      temperature: req.temperature,
      responseMimeType: req.responseSchema ? "application/json" : undefined,
      responseSchema: req.responseSchema,
    }
  });

  const content = response.text ?? "";
  return { content, raw: response };
}
