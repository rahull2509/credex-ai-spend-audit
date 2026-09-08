# Reflection

This project is intentionally closer to a small startup product than a classroom CRUD app. The hard part was not making a form; it was deciding where trust should live.

The audit engine is deterministic because financial recommendations need repeatability. The LLM is used only for narrative packaging, and a fallback summary keeps the product usable when the API is unavailable. That separation makes the app easier to test and safer to explain.

The strongest product choice is showing value before lead capture. Many SaaS calculators hide the result until an email is submitted. Credex does the opposite: it gives the user the dashboard first, then asks for email only when saving, sharing, or receiving the summary becomes useful.

Given more time, I would add OAuth billing imports for Google Workspace, GitHub, OpenAI, and Anthropic, then compare invoices against seat rosters automatically. I would also add organization accounts so finance teams can track savings over multiple audits.
