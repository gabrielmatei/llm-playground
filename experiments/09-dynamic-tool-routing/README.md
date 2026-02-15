# Experiment 09: Dynamic Tool Routing

This experiment demonstrates a **Router Agent** pattern where a primary agent analyzes a request and routes it to a specialized toolset (toolbox).

## Scenario
The agent is given a `getToolbox(domain)` tool. Based on the user's query, it selects the appropriate domain(s) (e.g., `customer_support`, `devops`) and then executes specialized tools within those domains.

## Run
```bash
pnpm exp:09
```
