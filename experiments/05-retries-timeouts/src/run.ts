import { chat } from "@repo/core";

console.log("Starting Experiment 05: Retries & Timeouts...\n");

async function runWithTimeout(label: string, timeoutMs: number, retries: number) {
  console.log(`=== ${label} (Timeout: ${timeoutMs}ms, Retries: ${retries}) ===`);
  const startTime = Date.now();

  try {
    const res = await chat({
      messages: [{ role: "user", content: "Explain how LLMs work in a few words" }],
      timeout: timeoutMs,
      maxRetries: retries,
    });
    console.log(`Success! Response length: ${res.content.length}`);
    console.log(`Total time: ${Date.now() - startTime}ms\n`);
  } catch (error) {
    console.error(`Failed! Error: ${error}`);
    console.log(`Total time: ${Date.now() - startTime}ms\n`);
  }
}

// 1. Successful call (long timeout)
await runWithTimeout("Standard Call", 10000, 0);

// 2. Failure call (short timeout, no retries)
await runWithTimeout("Short Timeout (No Retry)", 1, 0);

// 3. Failure call with retries (short timeout) - should take longer as it retries multiple times
await runWithTimeout("Short Timeout (With Retries)", 1, 3);
