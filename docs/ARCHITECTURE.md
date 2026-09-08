# Architecture

## Product Flow

1. Landing page explains the AI spend problem and sends users to `/audit`.
2. The audit form stores state in `localStorage` so refreshes do not lose work.
3. The browser runs the pure TypeScript audit engine and opens `/audit/results`.
4. Results are shown before lead capture.
5. Lead capture posts to `/api/audits`.
6. The server validates input, recomputes the audit, generates an AI or fallback summary, persists private and public records, and sends email.
7. `/reports/[shareId]` reads only the public audit row and hides sensitive fields.

## Key Boundaries

- `src/lib/audit`: deterministic domain engine, pricing config, rules, savings math, schemas, tests.
- `src/components/audit`: form, result dashboard, share controls.
- `src/lib/ai`: Anthropic integration with retry and fallback.
- `src/lib/supabase`: server clients and public report lookup.
- `src/app/api/audits/route.ts`: backend-for-frontend endpoint.

## Security Model

Private leads live in `audit_leads`; public reports live in `public_audits`. Row level security lets anonymous users read public audits only. The service role key is used only from the server route. Public report payloads include savings, plan labels, and recommendations, but not email, company name, exact total spend, or private audit metadata.

## Abuse Protection

The lead form uses a hidden `website` honeypot and an in-memory per-IP rate limit. This was chosen over hCaptcha because the assignment product is a low-friction audit tool; the first launch risk is spam, not account takeover. A production scale-up would move rate limiting to Upstash or Supabase Edge middleware.
