# Credex AI Spend Audit

A production-grade SaaS web app for auditing startup spend across ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, OpenAI API, Anthropic API, and Windsurf.

The product shows value before asking for a lead: users enter their AI stack, get a deterministic rules-based savings audit, then can save the report, receive an email confirmation, and share a public URL with sensitive data removed.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui-style components, Lucide icons
- Framer Motion for subtle landing page animation
- Zod and React Hook Form for validation
- Supabase for private leads and public reports
- Anthropic Messages API for personalized summaries with fallback templates
- Resend for transactional email
- Vitest for audit engine coverage

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
RESEND_API_KEY=
RESEND_FROM_EMAIL="Credex Audit <audit@yourdomain.com>"
CREDEX_CONSULTATION_EMAIL=hello@credex.dev
```

Without Supabase, the local app still calculates audits and generates fallback summaries, but public share URLs are not persisted.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add the URL, anon key, and service role key to Vercel.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

The audit logic is intentionally pure TypeScript under `src/lib/audit`. UI calls the engine locally for instant value; the API recomputes the audit server-side before saving so persisted records cannot be tampered with from the browser.

## Theme

The app supports dark and light mode. A toggle button in the header switches themes. The preference is persisted in `localStorage` under `credex.theme`. An inline script in `layout.tsx` prevents the flash-of-wrong-theme on load.

## Documentation

All project documentation lives in `docs/`:

| File | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | System design and security model |
| `docs/DEVLOG.md` | Build decisions log |
| `docs/TESTS.md` | Test coverage notes |
| `docs/ECONOMICS.md` | Unit economics |
| `docs/GTM.md` | Go-to-market strategy |
| `docs/METRICS.md` | Success metrics |
| `docs/IMPROVEMENTS.md` | UI and code improvement plan |
| `docs/PRICING_DATA.md` | AI tool pricing reference |
| `docs/PROMPTS.md` | LLM prompt designs |
| `docs/REFLECTION.md` | Build reflection |
| `docs/USER_INTERVIEWS.md` | User research notes |
| `docs/LANDING_COPY.md` | Marketing copy |

## Deployment

Deploy to Vercel, add the environment variables above, and set `NEXT_PUBLIC_APP_URL` to the production URL. The app uses standard Next.js route handlers and does not require a custom server.
