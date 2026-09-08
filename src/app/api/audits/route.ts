import { NextRequest, NextResponse } from "next/server";
import { generateAuditSummary } from "@/lib/ai/anthropic";
import { runAudit, toPublicAuditResult } from "@/lib/audit/engine";
import { createAuditRequestSchema } from "@/lib/audit/schemas";
import { sendAuditEmail } from "@/lib/email/resend";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createShareId, createShareUrl } from "@/lib/share";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const rateLimit = consumeRateLimit(`audit:${ip}`, { limit: 6, windowMs: 60_000 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many audit submissions. Please try again in a minute." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createAuditRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid audit payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.lead.website) {
    return NextResponse.json({ ok: true, persisted: false, honeypot: true });
  }

  const result = runAudit(parsed.data.audit);
  const publicResult = toPublicAuditResult(result);
  const { summary, source } = await generateAuditSummary({
    result,
    companyName: parsed.data.lead.companyName,
    role: parsed.data.lead.role,
  });

  let shareId: string | undefined;
  let shareUrl: string | undefined;
  let persisted = false;

  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    shareId = createShareId();

    const { data: publicAudit, error: auditError } = await supabase
      .from("public_audits")
      .insert({
        share_id: shareId,
        summary,
        public_result: publicResult,
        total_monthly_savings: result.totalMonthlySavings,
        total_annual_savings: result.totalAnnualSavings,
      })
      .select("id, share_id")
      .single();

    if (auditError) {
      console.error("Failed to create public audit", auditError);
      return NextResponse.json(
        { error: "Could not save audit. Please try again." },
        { status: 500 },
      );
    }

    const { error: leadError } = await supabase.from("audit_leads").insert({
      email: parsed.data.lead.email,
      company_name: parsed.data.lead.companyName,
      role: parsed.data.lead.role,
      team_size: parsed.data.lead.teamSize,
      audit_result: result,
      public_audit_id: publicAudit.id,
    });

    if (leadError) {
      console.error("Failed to create lead", leadError);
      return NextResponse.json(
        { error: "Could not save lead. Please try again." },
        { status: 500 },
      );
    }

    persisted = true;
    shareUrl = createShareUrl(publicAudit.share_id);
  }

  const email = await sendAuditEmail({
    lead: parsed.data.lead,
    result,
    summary,
    shareUrl,
  });

  return NextResponse.json({
    ok: true,
    persisted,
    result,
    publicResult,
    summary,
    summarySource: source,
    shareUrl,
    email,
  });
}
