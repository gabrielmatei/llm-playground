import { z } from "zod";
import { chat, Tool, ChatMessage } from "@repo/core";

const CheckUrlSchema = z.object({ url: z.string() });

const tools: Tool[] = [
  {
    name: "checkUrl",
    description: "Check if a URL is reachable and secure. Returns status and security info.",
    parameters: {
      type: "object",
      properties: { url: { type: "string", description: "The URL to check (e.g., http://google.com)" } },
      required: ["url"],
    },
  },
];

async function handleTool(name: string, args: any): Promise<string> {
  console.log(`\n[Tool Call] Executing ${name} with ${JSON.stringify(args)}`);

  switch (name) {
    case "checkUrl": {
      const { url } = CheckUrlSchema.parse(args);

      if (url.startsWith("http://")) {
        return "Error: Insecure protocol. Plain HTTP is forbidden for this system. Please use 'https://' instead.";
      }

      if (url.includes("google.com")) {
        return "Status: 200 OK, Latency: 45ms, Security: TLS 1.3 Active.";
      }

      return "Status: 404 Not Found.";
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function runAgent(prompt: string) {
  console.log(`\n=== Starting Agent Loop (Error Recovery) ===`);
  console.log(`Prompt: "${prompt}"\n`);

  let messages: ChatMessage[] = [
    { role: "system", content: "You are an autonomous agent that uses tools to solve tasks. If a tool returns an error, analyze it and immediately attempt a recovery or alternative approach using tools if possible. Do not ask for permission to try an alternative if the fix is clear from the error message." },
    { role: "user", content: prompt }
  ];

  for (let i = 0; i < 5; i++) {
    console.log(`--- Step ${i + 1} ---`);
    const res = await chat({ messages, tools });

    // Save assistant message to history
    messages.push({
      role: "assistant",
      content: res.content || "",
      toolCalls: res.toolCalls
    });

    if (res.content) {
      console.log(`Assistant: ${res.content}`);
    }

    if (res.toolCalls && res.toolCalls.length > 0) {
      for (const call of res.toolCalls) {
        try {
          const output = await handleTool(call.name, call.args);
          messages.push({
            role: "tool",
            toolCallId: call.name,
            content: output
          });

          if (output.startsWith("Error:")) {
            console.log(`\n[System] Tool returned an error. Agent needs to recover...`);
          }
        } catch (err) {
          messages.push({
            role: "tool",
            toolCallId: call.name,
            content: `Internal Error: ${err}`
          });
        }
      }
      console.log(`\n[System] Feeding tool results back to model...`);
    } else if (res.content) {
      console.log(`\n[Agent] Task completed.`);
      break;
    }

    if (i === 4) {
      console.warn(`\n[Warning] Reached max iterations (5).`);
    }
  }
}

async function main() {
  await runAgent("Check if google.com is reachable and secure.");
  console.log(`\nDone.`);
}

main().catch(console.error);
