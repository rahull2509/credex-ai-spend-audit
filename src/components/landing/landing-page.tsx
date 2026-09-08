"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  Gauge,
  LockKeyhole,
  Share2,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";

const trustedLogos = ["LaunchOps", "PilotDesk", "Northstar AI", "Relaybase", "Stackwell"];

const features = [
  {
    icon: TrendingDown,
    title: "Spend waste detection",
    copy: "Flags duplicated seats, plan drift, overlapping coding assistants, and API budgets that belong behind guardrails.",
  },
  {
    icon: ClipboardList,
    title: "Plan-fit recommendations",
    copy: "Compares actual spend against realistic catalog pricing and recommends better-fit plans or alternatives.",
  },
  {
    icon: Sparkles,
    title: "AI audit summary",
    copy: "Creates a concise, executive-ready summary that explains the largest savings opportunity in plain language.",
  },
  {
    icon: Share2,
    title: "Public report links",
    copy: "Generates shareable audit URLs with sensitive spend hidden behind public-safe ranges.",
  },
];

const testimonials = [
  {
    quote:
      "We found three duplicate AI tools in ten minutes. The report was clean enough to paste into our finance standup.",
    name: "Maya Shah",
    role: "COO, Relaybase",
    initials: "MS",
  },
  {
    quote:
      "The useful part was the reasoning. It did not just say cut spend; it told us which seats to keep and why.",
    name: "Evan Brooks",
    role: "Founder, PilotDesk",
    initials: "EB",
  },
  {
    quote:
      "We used the public link to align engineering and finance before renewal week. That saved a lot of back-and-forth.",
    name: "Nora Kim",
    role: "Head of Product, LaunchOps",
    initials: "NK",
  },
];

const faqs = [
  {
    q: "Does Credex connect to our billing systems?",
    a: "This internship build starts with structured inputs so teams can get value without OAuth setup. The backend schema is ready for billing integrations later.",
  },
  {
    q: "Are the recommendations AI generated?",
    a: "Savings are calculated by a deterministic TypeScript rules engine. The LLM only turns the result into a polished 100-word summary.",
  },
  {
    q: "What does the public report hide?",
    a: "Exact total spend, email, company name, and private lead fields stay out of the public report. Shared URLs show savings, plan labels, and recommendations.",
  },
  {
    q: "Why use a honeypot and rate limit?",
    a: "The form is low-friction by design. Honeypot protection catches automated submissions without making startup operators solve a challenge.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        className="flex w-full items-center justify-between p-5 text-left font-semibold hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="premium-grid relative min-h-[calc(100svh-4rem)] border-b border-border">
        <div className="hero-gradient-overlay pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge className="mb-6">
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              Built for startup operators reviewing AI spend
            </Badge>
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              Credex{" "}
              <span className="gradient-text">AI Spend</span>{" "}
              Audit
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              Find overlapping AI subscriptions, right-size seats, and turn wasted tooling
              budget into runway before your next renewal cycle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="shimmer-btn">
                <Link href="/audit">
                  Run the free audit
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#calculator">Preview savings</Link>
              </Button>
            </div>
          </motion.div>

          {/* Product preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6 }}
            className="aurora-panel mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded-xl border border-border shadow-2xl"
            aria-label="Credex product preview"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-400" />
                <span className="size-2.5 rounded-full bg-amber-300" />
                <span className="size-2.5 rounded-full bg-emerald-300" />
              </div>
              <Badge variant="secondary">Live audit preview</Badge>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                <p className="text-sm text-muted-foreground">Monthly savings found</p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-5xl font-semibold gradient-text">{formatCurrency(1284)}</span>
                  <span className="pb-2 text-sm text-emerald-400">+ $15.4k annual</span>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    ["Cursor + Copilot overlap", 72],
                    ["Unused ChatGPT Team seats", 58],
                    ["OpenAI API guardrails", 38],
                  ].map(([label, value]) => (
                    <div key={label.toString()} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{value}% confidence</span>
                      </div>
                      <Progress value={Number(value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="grid gap-3">
                  {[
                    ["ChatGPT Team", "$180/mo", "Remove 4 inactive seats"],
                    ["GitHub Copilot", "$114/mo", "Consolidate with Cursor"],
                    ["Anthropic API", "$210/mo", "Add usage caps"],
                  ].map(([tool, savings, action]) => (
                    <div
                      key={tool}
                      className="card-glow rounded-md border border-border bg-background/45 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{tool}</p>
                        <Badge variant="success">{savings}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Trusted logos ─── */}
      <section className="border-b border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            Trusted by lean teams that treat SaaS spend like product debt
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {trustedLogos.map((name) => (
              <div
                key={name}
                className="flex h-14 items-center justify-center rounded-md border border-border bg-secondary/40 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-secondary/70"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="border-b border-border bg-muted/20 py-20" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary">Why this matters</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              AI spend compounds quietly when every team picks its own tools.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Credex gives founders, finance leads, and engineering managers a shared view
              of what to keep, what to right-size, and where to place budget controls.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="card-glow bg-background/70 group">
                <CardContent className="p-5">
                  <div className="relative inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {feature.copy}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Calculator ─── */}
      <section className="border-b border-border py-20" id="calculator">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Badge variant="secondary">
              <CircleDollarSign className="mr-1 size-3" aria-hidden="true" />
              Calculator preview
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              See the savings before you give us your email.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The audit form calculates savings locally first. Lead capture appears only
              after the product has shown value.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["ChatGPT", "Claude", "Cursor", "Copilot", "Gemini", "OpenAI API"].map(
                (tool) => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ),
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Monthly spend", value: "$2,940", icon: BadgeDollarSign },
              { label: "Savings found", value: "$812", icon: TrendingDown },
              { label: "Score", value: "72/100", icon: Gauge },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="card-glow bg-card/80">
                <CardContent className="p-5">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-semibold gradient-text">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="border-b border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="card-glow bg-background/70">
                <CardContent className="p-5">
                  <p className="text-2xl font-serif text-primary/60 leading-none">&ldquo;</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {testimonial.quote}
                  </p>
                  <Separator className="my-5" />
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge>
            <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
            Ready for renewal season
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-5xl">
            Give your AI stack the finance review it deserves.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Run a private audit, generate a shareable report, and use the result to align
            founders, engineering, and finance.
          </p>
          <Button asChild size="lg" className="mt-8 shimmer-btn">
            <Link href="/audit">
              Start the audit
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20" id="faq">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <LockKeyhole className="size-6 text-primary" aria-hidden="true" />
            <h2 className="text-3xl font-semibold tracking-normal">FAQ</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" aria-hidden="true" />
              <span className="font-medium text-foreground">Credex AI Spend Audit</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                GitHub
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter / X"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Twitter
              </a>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Built for a production-grade web development internship submission.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
