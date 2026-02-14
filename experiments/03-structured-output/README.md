# Experiment 03: Structured Output

This experiment demonstrates how to force the LLM to return valid JSON data based on a defined schema.

## Scenario
Processing raw customer support emails into structured ticket data.

## Schema
- **Category**: Technical, Billing, General, or Feature Request.
- **Priority**: High, Medium, Low.
- **Sentiment**: Positive, Neutral, Negative.
- **Summary**: Concise one-line summary.
- **Tags**: Array of string tags.

## Run
- Ensure `.env` is set up.
- Run: `pnpm exp:03`
