import { z } from "zod";
import { chat, Tool, ChatMessage } from "@repo/core";

const ParseLogLineSchema = z.object({
  logLine: z.string(),
});

const tools: Tool[] = [
  {
    name: "parseLogLine",
    description: "Parses a raw log line into structured data (timestamp, level, message).",
    parameters: {
      type: "object",
      properties: {
        logLine: { type: "string", description: "The raw log line to parse" },
      },
      required: ["logLine"],
    },
  },
  {
    name: "getTime",
    description: "Returns the current server time in ISO format.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

const messages: ChatMessage[] = [
  { role: "user", content: "I found this log: '2023-12-12 10:00:00 [CRITICAL] DB Connection Lost'. Parse it and check if it happened recently (compare with current time)." }
];

console.log(`User: "${messages[0].content}"\n`);

const res = await chat({
  messages,
  tools,
});

if (res.toolCalls && res.toolCalls.length > 0) {
  console.log("Tool Calls:", JSON.stringify(res.toolCalls, null, 2));

  const toolOutputs = [];
  for (const call of res.toolCalls) {
    let result;
    if (call.name === "parseLogLine") {
      const args = ParseLogLineSchema.parse(call.args);
      console.log(`Executing ${call.name} with args:`, args);
      const match = args.logLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.*)$/);
      if (match) {
        result = JSON.stringify({
          timestamp: match[1],
          level: match[2],
          message: match[3]
        });
      } else {
        result = "Error: Could not parse log line format.";
      }
    } else if (call.name === "getTime") {
      console.log(`Executing ${call.name}`);
      result = new Date().toISOString();
    } else {
      console.warn(`Unknown tool: ${call.name}`);
      continue;
    }

    console.log(`Tool Output: "${result}"\n`);
    toolOutputs.push(`Tool '${call.name}' output: ${result}`);
  }

  if (toolOutputs.length > 0) {
    const finalMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: `Tool Execution Results:\n${toolOutputs.join("\n")}\n\nPlease answer my original question based on these results.` }
    ];

    const finalRes = await chat({
      messages: finalMessages,
    });

    console.log("\nFinal Response:\n" + finalRes.content);
  }
} else {
  console.log("Response:", res.content);
}
