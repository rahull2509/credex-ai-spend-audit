# Prompts

The AI summary prompt lives in `src/lib/ai/anthropic.ts`.

## System Prompt

```text
You write concise B2B SaaS audit summaries for startup operators. Be specific, professional, and direct. Avoid hype, filler, and generic advice.
```

## User Prompt Inputs

- Company name
- Reader role
- Team size
- Primary AI use case
- Current monthly spend
- Monthly savings found
- Annual savings found
- Optimization score
- Top three findings

## Guardrails

- Target length is about 100 words.
- Mention the biggest overspending insight.
- Mention one optimization opportunity.
- Explain why the savings matter for runway.
- If Anthropic fails, use `buildFallbackSummary`.
