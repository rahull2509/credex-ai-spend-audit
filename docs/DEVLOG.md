# Devlog

## 2026-05-09

- Verified current npm versions before scaffolding: Next.js `16.2.6`, React `19.2.6`.
- Created a clean App Router project in `credex-ai-spend-audit`.
- Added core SaaS dependencies: Supabase, Resend, Anthropic SDK, Zod, React Hook Form, Framer Motion, Lucide, Vitest.
- Built a pure TypeScript audit engine with modular pricing, rules, recommendations, savings math, and public sanitization.
- Added six Vitest cases covering team-plan overkill, unused seats, coding assistant duplication, API guardrails, optimized stacks, and public report privacy.
- Replaced the starter page with a dark premium landing page and product-preview dashboard.
- Implemented persistent audit intake, results dashboard, lead capture, server persistence, dynamic public reports, and OG metadata.

## Product Decisions

- Results appear before lead capture to build trust.
- Server recomputation prevents client-side manipulation of saved audit totals.
- Public reports use spend bands rather than exact total spend.
- High-savings audits over `$500/mo` promote Credex consultation.
