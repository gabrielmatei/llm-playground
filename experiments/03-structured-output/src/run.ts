import { chat, ChatMessage } from "@repo/core";
import { z } from "zod";

const TicketSchema = z.object({
  category: z.enum(["Technical", "Billing", "General", "Feature Request"]),
  priority: z.enum(["High", "Medium", "Low"]),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]),
  summary: z.string(),
  tags: z.array(z.string()),
});

const jsonSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["Technical", "Billing", "General", "Feature Request"],
    },
    priority: {
      type: "string",
      enum: ["High", "Medium", "Low"],
    },
    sentiment: {
      type: "string",
      enum: ["Positive", "Neutral", "Negative"],
    },
    summary: {
      type: "string",
    },
    tags: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["category", "priority", "sentiment", "summary", "tags"],
};

async function processTicket(ticket: string) {
  console.log("## Processing Support Ticket");
  console.log(`> "${ticket}"`);

  let messages: ChatMessage[] = [
    { role: "user", content: `Analyze this support ticket and extract structured data:\n\n${ticket}` }
  ];

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await chat({
        messages,
        responseSchema: jsonSchema,
      });

      const parsedJson = JSON.parse(res.content);
      const validation = TicketSchema.safeParse(parsedJson);

      if (validation.success) {
        console.log("### Structured Output (Valid)");
        console.log(JSON.stringify(validation.data, null, 2));
        console.log("\n");
        return;
      } else {
        console.warn(`Attempt ${attempt} failed validation:`, validation.error.format());
        messages.push({ role: "assistant", content: res.content });
        messages.push({
          role: "user",
          content: `The output was invalid JSON or did not match the schema: ${JSON.stringify(validation.error.format())}. Please fix it.`
        });
      }
    } catch (error) {
      console.error(`**Error (Attempt ${attempt}):** ${error}`);
    }
  }
  console.error("Failed to get valid output after 3 attempts.\n");
}

const tickets = [
  "I've been trying to download my invoice for the last 3 months but the button is greyed out. This is ridiculous, I need it for my taxes immediately!",
  "Hey, just wanted to say I love the new dark mode feature! It looks amazing. One small suggestion: maybe make the accent color customizable?",
];

for (const ticket of tickets) {
  await processTicket(ticket);
}
