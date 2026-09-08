import { getPlan } from "@/lib/audit/pricing";
import type { ToolSpendInput } from "@/lib/audit/types";

export function normalizeMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

export function normalizeSeatCount(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export function calculateExpectedCatalogSpend(input: ToolSpendInput) {
  const plan = getPlan(input.toolId, input.planId);

  if (plan.isApiPlan) {
    return normalizeMoney(input.monthlySpend);
  }

  const billableSeats = Math.max(normalizeSeatCount(input.seats), plan.minSeats ?? 1);
  return normalizeMoney(plan.monthlySeatPrice * billableSeats);
}

export function calculateAnnualSavings(monthlySavings: number) {
  return normalizeMoney(monthlySavings * 12);
}

export function capSavings(monthlySavings: number, currentSpend: number) {
  return normalizeMoney(Math.min(Math.max(monthlySavings, 0), Math.max(currentSpend, 0)));
}

export function spendBand(monthlySpend: number) {
  if (monthlySpend < 100) return "Under $100/mo";
  if (monthlySpend < 500) return "$100-$499/mo";
  if (monthlySpend < 1500) return "$500-$1.5k/mo";
  if (monthlySpend < 5000) return "$1.5k-$5k/mo";
  return "$5k+/mo";
}
