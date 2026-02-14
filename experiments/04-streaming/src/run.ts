import { streamChat } from "@repo/core";

const prompt = "Explain LLMs like I'm 5";

console.log(`Prompt: "${prompt}"\n`);
process.stdout.write("Response: ");

try {
  const stream = streamChat({
    messages: [{ role: "user", content: prompt }]
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  process.stdout.write("\n\n");
} catch (error) {
  console.error(`\nError: ${error}\n`);
}