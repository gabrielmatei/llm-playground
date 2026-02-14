# Experiment 06: Single Tool Calling

This experiment demonstrates how to give the LLM the ability to "call" client-side tools (functions) to retrieve information.

## Scenario
A small agent that can inspect logs or fetch system state (time).

## Tools
- `parseLogLine`: Parses a raw log line into structured data (timestamp, level, message).
- `getTime`: Get current server time.

## Run
- Ensure `.env` is set up.
- Run: `pnpm exp:06`
