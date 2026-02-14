import { chat } from "@repo/core";

console.log("Starting Experiment 02: Prompt Patterns...\n");

// 1. Zero-Shot
console.log("\n=== Zero-Shot ===");
console.log("Direct question without examples.");
const zeroShotResult = await chat({
  messages: [{ role: "user", content: "Classify this support ticket: 'I can't log in to my account, it keeps saying wrong password even though I just reset it.'" }],
});
console.log(`\nOutput:\n${zeroShotResult.content}\n`);

// 2. Few-Shot
console.log("\n=== Few-Shot ===");
console.log("Providing examples to guide the model.");
const fewShotResult = await chat({
  messages: [
    { role: "user", content: "Classify these support tickets into categories: Billing, Technical, or General Inquiry.\n\nTicket: 'How do I update my credit card?'\nCategory: Billing\n\nTicket: 'The app crashes when I open settings.'\nCategory: Technical\n\nTicket: 'Do you have a family plan?'\nCategory: General Inquiry\n\nTicket: 'My screen goes black when I try to watch a video.'\nCategory:" }
  ],
});
console.log(`\nOutput:\n${fewShotResult.content}\n`);

// 3. Chain-of-Thought
console.log("\n=== Chain-of-Thought ===");
console.log("Asking for step-by-step reasoning.");
const chainOfThoughtResult = await chat({
  messages: [
    { role: "user", content: "A customer complains that their internet is slow. They have a 100Mbps plan. Speed test shows 95Mbps on WiFi near the router, but 10Mbps in the bedroom. Analyze the situation step-by-step to identify the likely cause and suggest tailored solutions." }
  ],
});
console.log(`\nOutput:\n${chainOfThoughtResult.content}\n`);

// 4. Persona
console.log("\n=== Persona ===");
console.log("Adopting a specific character/role.");
const personaResult = await chat({
  messages: [
    { role: "system", content: "You are 'Turbo', an overly enthusiastic technical support agent who loves to use emojis and tech jargon." },
    { role: "user", content: "My mouse is moving really slowly on the screen." }
  ]
});
console.log(`\nOutput:\n${personaResult.content}\n`);

console.log("\nExperiment 02 completed.");
