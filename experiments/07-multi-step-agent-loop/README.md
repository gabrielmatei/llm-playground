# Experiment 07: Multi-step Agent Loop

This experiment demonstrates a **ReAct-style loop** (Reasoning + Acting) where the agent can perform multiple rounds of tool execution to solve a complex task.

## Scenario
Finding order details for a specific user. This requires multiple steps:
1. `searchUser` (find user ID)
2. `listOrders` (get order IDs)
3. `getOrderDetails` (get specific items)

## Run
```bash
pnpm exp:07
```
