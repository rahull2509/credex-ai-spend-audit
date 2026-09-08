import type { AuditResult } from "@/lib/audit/types";
import { formatCurrency } from "@/lib/format";

export function buildFallbackSummary(result: AuditResult, companyName?: string) {
  const topFinding = result.tools
    .filter((tool) => tool.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const name = companyName ? `${companyName}'s` : "Your";

  if (!topFinding) {
    return `${name} AI stack looks unusually disciplined. The audit found ${formatCurrency(
      result.totalMonthlySpend,
    )} in monthly spend and no high-confidence waste patterns. Keep reviewing seats, API keys, and plan tiers each month because fast-growing teams often accumulate duplicate AI tools during hiring or product experiments.`;
  }

  return `${name} AI stack has a clear optimization path. The audit found ${formatCurrency(
    result.totalMonthlySavings,
  )} in monthly savings, led by ${topFinding.toolName}: ${
    topFinding.primaryRecommendation.reason
  } The strongest next step is to ${
    topFinding.primaryRecommendation.action
  } Annualized, this could free up ${formatCurrency(
    result.totalAnnualSavings,
  )} for runway, hiring, or product experiments.`;
}
