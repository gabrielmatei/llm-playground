import { chat, Tool, ChatMessage } from "@repo/core";

const SupportToolbox: Tool[] = [
  {
    name: "getAccountType",
    description: "Get the account level of a user.",
    parameters: {
      type: "object",
      properties: { email: { type: "string" } },
      required: ["email"],
    },
  },
  {
    name: "refundOrder",
    description: "Issue a refund for a specific order ID.",
    parameters: {
      type: "object",
      properties: { orderId: { type: "string" }, reason: { type: "string" } },
      required: ["orderId", "reason"],
    },
  },
];

const DevOpsToolbox: Tool[] = [
  {
    name: "getServerLogs",
    description: "Retrieve recent logs from a specific server.",
    parameters: {
      type: "object",
      properties: { serverId: { type: "string" }, lines: { type: "number" } },
      required: ["serverId"],
    },
  },
  {
    name: "rebootService",
    description: "Reboot a specific service.",
    parameters: {
      type: "object",
      properties: { serviceName: { type: "string" } },
      required: ["serviceName"],
    },
  },
];

const routerTools: Tool[] = [
  {
    name: "getToolbox",
    description: "Request a specialized toolbox for a specific domain.",
    parameters: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          enum: ["customer_support", "devops"],
          description: "The domain for which tools are needed."
        }
      },
      required: ["domain"],
    },
  },
];

async function handleTool(name: string, args: any): Promise<{ output: string, newTools?: Tool[] }> {
  console.log(`\n[Tool Call] Executing ${name} with ${JSON.stringify(args)}`);

  switch (name) {
    case "getToolbox": {
      const { domain } = args;
      if (domain === "customer_support") {
        return {
          output: "Success: Customer Support Toolbox loaded.",
          newTools: SupportToolbox
        };
      }
      if (domain === "devops") {
        return {
          output: "Success: DevOps Toolbox loaded.",
          newTools: DevOpsToolbox
        };
      }
      return { output: "Error: Domain not found." };
    }
    case "getAccountType":
      return { output: "User 'alice@example.com' is a PREMIER member." };
    case "refundOrder":
      return { output: `Order ${args.orderId} has been successfully refunded. Reason: ${args.reason}` };
    case "getServerLogs":
      return { output: `Logs for ${args.serverId}: [ERROR] Database connection timed out at 19:30:05.` };
    case "rebootService":
      return { output: `Service ${args.serviceName} is rebooting...` };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function runAgent(prompt: string) {
  console.log(`\n=== Starting Router Agent Loop ===`);
  console.log(`Prompt: "${prompt}"\n`);

  let messages: ChatMessage[] = [
    { role: "system", content: "You are a universal router agent. You start with NO specialized tools. Use 'getToolbox' to request access to toolsets for specific domains (customer_support or devops) based on the user's needs. Once toolboxes are loaded, use the available tools to solve the request. You can load multiple toolboxes if needed." },
    { role: "user", content: prompt }
  ];

  let currentTools = [...routerTools];

  for (let i = 0; i < 6; i++) {
    console.log(`--- Step ${i + 1} ---`);
    const res = await chat({ messages, tools: currentTools });

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
        const { output, newTools } = await handleTool(call.name, call.args);

        if (newTools) {
          // Add newly discovered tools to the available toolset
          for (const nt of newTools) {
            if (!currentTools.find(ct => ct.name === nt.name)) {
              currentTools.push(nt);
              console.log(`[System] Activated new tool: ${nt.name}`);
            }
          }
        }

        messages.push({
          role: "tool",
          toolCallId: call.name,
          content: output
        });
      }
      console.log(`[System] Feeding tool responses back to model...`);
    } else if (res.content) {
      console.log(`\n[Agent] Task completed.`);
      break;
    }

    if (i === 5) {
      console.warn(`\n[Warning] Reached max iterations (6).`);
    }
  }
}

async function main() {
  await runAgent("I need to refund order #REC-555 because it never arrived, and I also need to see the logs for the 'auth-server' to see if there were any issues around 7:30 PM.");
  console.log(`\nDone.`);
}

main().catch(console.error);
