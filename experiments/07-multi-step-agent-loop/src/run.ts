import { z } from "zod";
import { chat, Tool, ChatMessage } from "@repo/core";

const USERS = [
  { id: "u-123", name: "Alice", email: "alice@example.com" },
  { id: "u-456", name: "Bob", email: "bob@example.com" },
];

const ORDERS = [
  { id: "o-999", userId: "u-123", items: ["Laptop", "Mouse"], date: "2024-02-10" },
  { id: "o-888", userId: "u-123", items: ["Keyboard"], date: "2024-01-15" },
  { id: "o-777", userId: "u-456", items: ["Monitor"], date: "2024-02-12" },
];

const SearchUserSchema = z.object({ query: z.string() });
const ListOrdersSchema = z.object({ userId: z.string() });
const GetOrderDetailsSchema = z.object({ orderId: z.string() });

const tools: Tool[] = [
  {
    name: "searchUser",
    description: "Search for a user by name or email. Returns user ID.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "listOrders",
    description: "List all order IDs for a given user ID.",
    parameters: {
      type: "object",
      properties: { userId: { type: "string" } },
      required: ["userId"],
    },
  },
  {
    name: "getOrderDetails",
    description: "Get detailed information about an order by its ID.",
    parameters: {
      type: "object",
      properties: { orderId: { type: "string" } },
      required: ["orderId"],
    },
  },
];

async function handleTool(name: string, args: any): Promise<string> {
  console.log(`\n[Tool Call] Executing ${name} with ${JSON.stringify(args)}`);

  switch (name) {
    case "searchUser": {
      const { query } = SearchUserSchema.parse(args);
      const user = USERS.find(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.includes(query));
      return user ? `Found user: ${JSON.stringify(user)}` : "User not found.";
    }
    case "listOrders": {
      const { userId } = ListOrdersSchema.parse(args);
      const userOrders = ORDERS.filter(o => o.userId === userId);
      return userOrders.length > 0
        ? `Orders for ${userId}: ${JSON.stringify(userOrders.map(o => ({ id: o.id, date: o.date })))}`
        : "No orders found for this user.";
    }
    case "getOrderDetails": {
      const { orderId } = GetOrderDetailsSchema.parse(args);
      const order = ORDERS.find(o => o.id === orderId);
      return order ? `Order details: ${JSON.stringify(order)}` : "Order not found.";
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function runAgent(prompt: string) {
  console.log(`\n=== Starting Agent Loop ===`);
  console.log(`Prompt: "${prompt}"\n`);

  let messages: ChatMessage[] = [
    { role: "user", content: prompt }
  ];

  for (let i = 0; i < 5; i++) {
    console.log(`--- Step ${i + 1} ---`);
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
        try {
          const output = await handleTool(call.name, call.args);
          messages.push({
            role: "tool",
            toolCallId: call.name,
            content: output
          });
        } catch (err) {
          messages.push({
            role: "tool",
            toolCallId: call.name,
            content: `Error: ${err}`
          });
        }
      }
      console.log(`[System] Feeding tool responses back to model...`);
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
  await runAgent("Find the latest order for 'Alice' and tell me what she bought.");
  console.log(`\nDone.`);
}

main().catch(console.error);
