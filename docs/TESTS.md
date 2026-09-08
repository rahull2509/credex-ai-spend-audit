# Tests

The audit engine is covered with Vitest because that is the highest-risk logic in the application.

Run:

```bash
npm test
npm run test:coverage
```

Current meaningful cases:

- Team plan for a two-person company recommends a downgrade.
- Paid seats above team size are treated as removable waste.
- Cursor, GitHub Copilot, and Windsurf overlap triggers consolidation.
- Low-spend, well-matched Gemini usage is marked optimized.
- High product API spend recommends budget guardrails.
- Public report conversion hides exact current spend.

UI testing is not yet automated. For a production team, the next layer would be Playwright coverage for `/audit`, `/audit/results`, and `/reports/[shareId]` with mocked Supabase and Resend responses.
