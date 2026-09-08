import { calculateAnnualSavings, capSavings } from "@/lib/audit/calculator";
import type {
  Recommendation,
  RecommendationSeverity,
  RecommendationType,
} from "@/lib/audit/types";

interface RecommendationInput {
  type: RecommendationType;
  title: string;
  reason: string;
  action: string;
  monthlySavings: number;
  currentSpend: number;
  confidence?: number;
}

export function createRecommendation(input: RecommendationInput): Recommendation {
  const monthlySavings = capSavings(input.monthlySavings, input.currentSpend);

  return {
    id: `${input.type}-${slugify(input.title)}`,
    type: input.type,
    severity: inferSeverity(monthlySavings),
    title: input.title,
    reason: input.reason,
    action: input.action,
    monthlySavings,
    annualSavings: calculateAnnualSavings(monthlySavings),
    confidence: input.confidence ?? 0.78,
  };
}

export function optimizedRecommendation(toolName: string): Recommendation {
  return {
    id: "optimized",
    type: "optimized",
    severity: "low",
    title: `${toolName} looks well matched`,
    reason:
      "Current usage is close to catalog pricing and no higher-confidence savings rule was triggered.",
    action: "Keep the plan, but review invoices monthly as usage changes.",
    monthlySavings: 0,
    annualSavings: 0,
    confidence: 0.68,
  };
}

export function rankRecommendations(recommendations: Recommendation[]) {
  return [...recommendations].sort((a, b) => {
    if (b.monthlySavings !== a.monthlySavings) {
      return b.monthlySavings - a.monthlySavings;
    }

    return b.confidence - a.confidence;
  });
}

function inferSeverity(monthlySavings: number): RecommendationSeverity {
  if (monthlySavings >= 250) return "high";
  if (monthlySavings >= 75) return "medium";
  return "low";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
