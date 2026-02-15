# Experiment 08: Tool Error Recovery

This experiment demonstrates how an agent can handle and recover from tool execution errors.

## Scenario
The agent attempts to check a URL. If it uses `http://`, the tool returns a security error suggesting `https://`. The agent must interpret this error and retry.

## Run
```bash
pnpm exp:08
```
