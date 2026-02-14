import { GoogleGenAI } from "@google/genai";
import { ChatRequest, ChatResponse, ChatStreamResponse, Tool, ToolCall } from "../types.js";

export async function geminiChat(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
  const gemini = new GoogleGenAI({ apiKey });

  const customTools = req.tools ? [{
    functionDeclarations: req.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }))
  }] : undefined;

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
      tools: customTools,
    }
  });

  const toolCalls = response.functionCalls?.map((fc: any) => ({
    name: fc.name,
    args: fc.args,
  }));

  let content = "";
  if (!toolCalls || toolCalls.length === 0) {
    content = response.text ?? "";
  }

  return { content, toolCalls, raw: response };
}

export async function* geminiStreamChat(apiKey: string, req: ChatRequest): ChatStreamResponse {
  const gemini = new GoogleGenAI({ apiKey });

  const result = await gemini.models.generateContentStream({
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

  for await (const chunk of result) {
    const text = chunk.text;
    if (text) {
      yield text;
    }
  }
}
