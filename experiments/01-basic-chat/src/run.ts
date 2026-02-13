import { chat } from "@repo/core";

const prompt = process.argv.slice(2).join(" ");
if (!prompt) {
  console.error("Please provide a prompt. Usage: pnpm exp:01 \"<your prompt>\"");
  process.exit(1);
}

const t0 = Date.now();
const res = await chat({
  messages: [
    { role: "system", content: "You are a helpful assistant. Keep answers concise." },
    { role: "user", content: prompt }
  ],
  temperature: 0.3
});
const ms = Date.now() - t0;

console.log("\n---\n");
console.log(res.content.trim());
console.log("\n---\n");
console.log(`Latency: ${ms}ms`);
