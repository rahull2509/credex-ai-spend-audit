# Pricing Data

Pricing is stored in `src/lib/audit/pricing.ts`.

The catalog is deliberately simple and transparent. It models common public plan shapes without pretending to be a live billing oracle.

## Tools

- ChatGPT: Free, Plus `$20`, Team `$30/seat`, Pro `$200`.
- Claude: Free, Pro `$20`, Team `$30/seat`, Max `$100`.
- Cursor: Hobby, Pro `$20`, Business `$40/seat`.
- GitHub Copilot: Individual `$10`, Business `$19/seat`, Enterprise `$39/seat`.
- Gemini: Free, Advanced `$20`, Workspace Business `$24/seat`.
- OpenAI API: usage-based.
- Anthropic API: usage-based.
- Windsurf: Free, Pro `$15`, Teams `$30/seat`.

## Caveats

Actual vendor pricing can change, regional taxes vary, and API spend depends on model mix, cache hit rate, and token volume. The engine therefore treats catalog pricing as a decision aid, not an invoice replacement.
