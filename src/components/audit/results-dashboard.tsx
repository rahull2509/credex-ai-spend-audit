"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { AUDIT_INPUT_STORAGE_KEY } from "@/components/audit/audit-form";
import { CopyLinkButton } from "@/components/audit/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { runAudit } from "@/lib/audit/engine";
import { auditInputSchema } from "@/lib/audit/schemas";
import type { AuditInput, AuditResult } from "@/lib/audit/types";
import { appConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type SaveResponse = {
  ok: boolean;
  persisted: boolean;
  summary: string;
  summarySource: "anthropic" | "fallback";
  shareUrl?: string;
  email?: { sent: boolean; reason?: string };
};

const leadFormSchema = z.object({
  email: z.string().email().max(255),
  companyName: z.string().min(2).max(120),
  role: z.string().min(2).max(80),
  teamSize: z.number().int().min(1).max(10000),
  website: z.string().max(0).optional(),
});

type LeadCaptureValues = z.infer<typeof leadFormSchema>;

/** Animated counter hook */
function useAnimatedNumber(target: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

/** Circular score ring */
function ScoreRing({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const animatedScore = useAnimatedNumber(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-label={`Optimization score: ${score} out of 100`}>
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="score-ring-track"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-fill"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="currentColor"
          className="fill-foreground"
        >
          {animatedScore}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">Score / 100</p>
    </div>
  );
}

export function ResultsDashboard() {
  const [auditInput] = useState<AuditInput | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const saved = window.localStorage.getItem(AUDIT_INPUT_STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = auditInputSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  });
  const [saveResponse, setSaveResponse] = useState<SaveResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const result = useMemo(() => (auditInput ? runAudit(auditInput) : null), [auditInput]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: "",
      companyName: "",
      role: "",
      teamSize: 5,
      website: "",
    },
  });

  useEffect(() => {
    if (auditInput) {
      reset((current) => ({ ...current, teamSize: auditInput.teamSize }));
    }
  }, [auditInput, reset]);

  async function onLeadSubmit(values: LeadCaptureValues) {
    if (!auditInput || !result) return;

    setSubmitError(null);
    const response = await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audit: auditInput,
        lead: { ...values, teamSize: result.teamSize },
      }),
    });

    const payload = (await response.json()) as SaveResponse | { error?: string };
    if (!response.ok) {
      setSubmitError(
        "error" in payload && payload.error ? payload.error : "Could not save audit.",
      );
      return;
    }

    setSaveResponse(payload as SaveResponse);
  }

  if (!result) {
    return (
      <main className="min-h-[calc(100svh-4rem)] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary">No audit found</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Run the intake first.
          </h1>
          <p className="mt-4 text-muted-foreground">
            The results page reads your locally saved audit input. Start with the spend form
            and this dashboard will populate automatically.
          </p>
          <Button asChild className="mt-8">
            <Link href="/audit">Go to audit form</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-4rem)]">
      <ResultsHero result={result} />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="grid gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Tool breakdown</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Each tool shows the highest-confidence recommendation to avoid
                double-counting overlapping savings.
              </p>
            </div>
            <ScoreRing score={result.optimizationScore} />
          </div>

          {result.tools.map((tool, i) => (
            <motion.div
              key={tool.toolId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="card-glow">
                <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_180px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">{tool.toolName}</h3>
                      <Badge variant={tool.health === "optimized" ? "success" : "warning"}>
                        {tool.health}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tool.currentPlan} plan, {tool.seats} seat
                      {tool.seats === 1 ? "" : "s"}.
                    </p>
                    <Separator className="my-4" />
                    <p className="font-medium">{tool.primaryRecommendation.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {tool.primaryRecommendation.reason}
                    </p>
                    <p className="mt-3 text-sm text-primary">
                      {tool.primaryRecommendation.action}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Current spend</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatCurrency(tool.currentSpend)}
                    </p>
                    <p className="mt-5 text-sm text-muted-foreground">Monthly savings</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatCurrency(tool.monthlySavings)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <aside className="space-y-4">
          {result.totalMonthlySavings > 500 ? <HighSavingsCta result={result} /> : null}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                Save and share
              </CardTitle>
              <CardDescription>
                Generate the AI summary, email confirmation, and public report URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {saveResponse ? (
                <SavedAudit response={saveResponse} />
              ) : (
                <form onSubmit={handleSubmit(onLeadSubmit)} className="space-y-4">
                  <div className="hidden">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register("website")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email ? (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company</Label>
                    <Input id="companyName" {...register("companyName")} />
                    {errors.companyName ? (
                      <p className="text-sm text-destructive">
                        {errors.companyName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      placeholder="Founder, COO, Engineering Lead"
                      {...register("role")}
                    />
                    {errors.role ? (
                      <p className="text-sm text-destructive">{errors.role.message}</p>
                    ) : null}
                  </div>
                  <input type="hidden" value={result.teamSize} {...register("teamSize")} />
                  {submitError ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {submitError}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Create share link"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function ResultsHero({ result }: { result: AuditResult }) {
  const optimized = result.totalMonthlySavings <= 50;
  const animatedSavings = useAnimatedNumber(result.totalMonthlySavings);
  const animatedAnnual = useAnimatedNumber(result.totalAnnualSavings);
  const animatedSpend = useAnimatedNumber(result.totalMonthlySpend);

  return (
    <section className="premium-grid border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant={optimized ? "success" : "default"}>
            {optimized ? "Spend is already tight" : "Savings opportunity found"}
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-6xl">
            {optimized
              ? "Your AI stack is already fairly optimized."
              : (
                <>
                  <span className="gradient-text">{formatCurrency(animatedSavings)}/mo</span>
                  {" "}in estimated savings.
                </>
              )}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {optimized
              ? "The audit found no high-confidence waste pattern. Keep the review cadence monthly as tool usage changes."
              : `Annualized, that is ${formatCurrency(animatedAnnual)} that can go back into runway, hiring, or product experiments.`}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Current monthly spend",
              value: formatCurrency(animatedSpend),
              icon: CalendarClock,
            },
            {
              label: "Monthly savings",
              value: formatCurrency(animatedSavings),
              icon: TrendingDown,
            },
            {
              label: "Annual savings",
              value: formatCurrency(animatedAnnual),
              icon: Sparkles,
            },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="card-glow bg-background/75">
              <CardContent className="p-5">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold count-animate">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighSavingsCta({ result }: { result: AuditResult }) {
  return (
    <Card className="border-primary/40 bg-primary/10">
      <CardHeader>
        <CardTitle>Credex consultation recommended</CardTitle>
        <CardDescription>
          This audit crossed the {formatCurrency(500)}/mo threshold for hands-on cleanup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          A structured review could prioritize renewals, seat ownership, and API budget
          controls worth {formatCurrency(result.totalAnnualSavings)} per year.
        </p>
        <Button asChild variant="secondary" className="w-full">
          <a href={`mailto:${appConfig.consultationEmail}`}>
            Contact Credex
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function SavedAudit({ response }: { response: SaveResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm">
        <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-emerald-300">Audit summary created</p>
          <p className="mt-1 text-emerald-300/75">
            Source:{" "}
            {response.summarySource === "anthropic" ? "Anthropic" : "fallback template"}.
          </p>
        </div>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{response.summary}</p>
      {response.shareUrl ? (
        <div className="space-y-3">
          <Input value={response.shareUrl} readOnly aria-label="Shareable audit URL" />
          <div className="flex gap-2">
            <CopyLinkButton value={response.shareUrl} />
            <Button asChild>
              <Link href={response.shareUrl}>
                Open
                <ExternalLink aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">
          <ShieldCheck className="mt-0.5 size-5" aria-hidden="true" />
          <p>
            Supabase is not configured in this local environment, so the summary was
            generated but the public URL was not persisted.
          </p>
        </div>
      )}
    </div>
  );
}
