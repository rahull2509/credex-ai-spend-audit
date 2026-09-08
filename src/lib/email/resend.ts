import { Resend } from "resend";
import type { AuditResult } from "@/lib/audit/types";
import type { LeadCaptureValues } from "@/lib/audit/schemas";
import { appConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

interface AuditEmailInput {
  lead: LeadCaptureValues;
  result: AuditResult;
  summary: string;
  shareUrl?: string;
}

export async function sendAuditEmail(input: AuditEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL ?? "Credex Audit <audit@example.com>";
  const isHighSavings = input.result.totalMonthlySavings > 500;

  await resend.emails.send({
    from,
    to: input.lead.email,
    subject: `Your AI spend audit found ${formatCurrency(
      input.result.totalMonthlySavings,
    )}/mo in savings`,
    html: renderAuditEmail(input, isHighSavings),
  });

  return { sent: true };
}

function renderAuditEmail(input: AuditEmailInput, isHighSavings: boolean) {
  const shareLink = input.shareUrl
    ? `<p><a href="${input.shareUrl}" style="color:#0f766e">View your shareable audit</a></p>`
    : "";
  const consultation = isHighSavings
    ? `<p>Your audit crossed the high-savings threshold, so Credex can help turn this into a cleanup plan. Reply to this email or contact ${appConfig.consultationEmail}.</p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.6">
      <h1 style="font-size:22px">AI spend audit for ${escapeHtml(input.lead.companyName)}</h1>
      <p>${escapeHtml(input.summary)}</p>
      <p><strong>Monthly savings:</strong> ${formatCurrency(input.result.totalMonthlySavings)}<br/>
      <strong>Annual savings:</strong> ${formatCurrency(input.result.totalAnnualSavings)}<br/>
      <strong>Optimization score:</strong> ${input.result.optimizationScore}/100</p>
      ${shareLink}
      ${consultation}
      <p style="color:#64748b;font-size:13px">Sent by Credex AI Spend Audit.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
