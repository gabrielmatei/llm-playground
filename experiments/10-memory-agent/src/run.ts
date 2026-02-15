import { chat, Tool, ChatMessage } from "@repo/core";

const memoryStore: Record<string, string> = {};

const tools: Tool[] = [
  {
    name: "saveFact",
    description: "Save a fact or piece of information to long-term memory.",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "The unique identifier for the fact (e.g., project_name)" },
        value: { type: "string", description: "The content of the fact to store" },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "getFacts",
    description: "Retrieve all saved facts from long-term memory.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

async function handleTool(name: string, args: any): Promise<string> {
  console.log(`\n[Tool Call] Executing ${name} with ${JSON.stringify(args)}`);

  switch (name) {
    case "saveFact": {
      const { key, value } = args;
      memoryStore[key] = value;
      return `Fact saved: ${key} = ${value}`;
    }
    case "getFacts": {
      return Object.keys(memoryStore).length > 0
        ? `Current Memory: ${JSON.stringify(memoryStore)}`
        : "Memory is currently empty.";
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function runAgent(turns: string[]) {
  console.log(`\n=== Starting Memory Agent Loop ===`);

  let messages: ChatMessage[] = [
    { role: "system", content: "You are a memory-augmented agent. Use 'saveFact' to remember important details mentioned by the user, and 'getFacts' to recall them when relevant. This memory persists across the entire conversation." }
  ];

  for (const prompt of turns) {
    console.log(`\n--- User: "${prompt}" ---`);
    messages.push({ role: "user", content: prompt });

    for (let i = 0; i < 5; i++) {
      const res = await chat({ messages, tools });

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
          const output = await handleTool(call.name, call.args);
          messages.push({
            role: "tool",
            toolCallId: call.name,
            content: output
          });
        }
        console.log(`[System] Feeding tool responses back to model...`);
      } else if (res.content) {
        break;
      }
    }
  }
}

async function main() {
  const conversation = [
    "Let's track Project Phoenix. The deadline is December 1st and the lead developer is Sarah.",
    "Remind me about the details of the project we are tracking."
  ];

  await runAgent(conversation);
}

main().catch(console.error);
