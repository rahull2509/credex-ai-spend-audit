import {
  calculateAnnualSavings,
  calculateExpectedCatalogSpend,
  normalizeMoney,
  normalizeSeatCount,
  spendBand,
} from "@/lib/audit/calculator";
import { getPlan, getToolPricing } from "@/lib/audit/pricing";
import { optimizedRecommendation, rankRecommendations } from "@/lib/audit/recommendations";
import { evaluatePortfolioRules, evaluateToolRules } from "@/lib/audit/rules";
import type {
  AuditInput,
  AuditResult,
  PublicAuditResult,
  ToolAuditResult,
} from "@/lib/audit/types";

export function runAudit(input: AuditInput): AuditResult {
  const normalizedInput = normalizeAuditInput(input);
  const portfolioRecommendations = evaluatePortfolioRules(normalizedInput);

  const tools = normalizedInput.tools.map<ToolAuditResult>((tool) => {
    const pricing = getToolPricing(tool.toolId);
    const plan = getPlan(tool.toolId, tool.planId);
    const expectedCatalogSpend = calculateExpectedCatalogSpend(tool);
    const recommendations = rankRecommendations([
      ...evaluateToolRules({ audit: normalizedInput, tool }),
      ...(portfolioRecommendations.get(tool.toolId)
        ? [portfolioRecommendations.get(tool.toolId)!]
        : []),
    ]);
    const primaryRecommendation =
      recommendations[0] ?? optimizedRecommendation(pricing.name);
    const monthlySavings = primaryRecommendation.monthlySavings;

    return {
      toolId: tool.toolId,
      toolName: pricing.name,
      category: pricing.category,
      currentPlan: plan.name,
      currentSpend: tool.monthlySpend,
      expectedCatalogSpend,
      seats: tool.seats,
      monthlySavings,
      annualSavings: calculateAnnualSavings(monthlySavings),
      recommendations:
        recommendations.length > 0 ? recommendations : [primaryRecommendation],
      primaryRecommendation,
      health: inferToolHealth(monthlySavings, tool.monthlySpend),
    };
  });

  const totalMonthlySpend = normalizeMoney(
    tools.reduce((total, tool) => total + tool.currentSpend, 0),
  );
  const totalMonthlySavings = normalizeMoney(
    tools.reduce((total, tool) => total + tool.monthlySavings, 0),
  );
  const optimizationScore = calculateOptimizationScore(
    totalMonthlySpend,
    totalMonthlySavings,
  );

  return {
    teamSize: normalizedInput.teamSize,
    primaryUseCase: normalizedInput.primaryUseCase,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: calculateAnnualSavings(totalMonthlySavings),
    optimizationScore,
    verdict: inferVerdict(totalMonthlySavings),
    generatedAt: new Date().toISOString(),
    tools,
  };
}

export function toPublicAuditResult(result: AuditResult): PublicAuditResult {
  return {
    teamSize: result.teamSize,
    primaryUseCase: result.primaryUseCase,
    totalMonthlySpendBand: spendBand(result.totalMonthlySpend),
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    optimizationScore: result.optimizationScore,
    verdict: result.verdict,
    generatedAt: result.generatedAt,
    tools: result.tools.map((tool) => ({
      toolId: tool.toolId,
      toolName: tool.toolName,
      currentPlan: tool.currentPlan,
      monthlySavings: tool.monthlySavings,
      annualSavings: tool.annualSavings,
      health: tool.health,
      primaryRecommendation: tool.primaryRecommendation,
    })),
  };
}

function normalizeAuditInput(input: AuditInput): AuditInput {
  return {
    teamSize: normalizeSeatCount(input.teamSize),
    primaryUseCase: input.primaryUseCase,
    tools: input.tools
      .filter((tool) => tool.monthlySpend > 0)
      .map((tool) => ({
        toolId: tool.toolId,
        planId: tool.planId,
        seats: normalizeSeatCount(tool.seats),
        monthlySpend: normalizeMoney(tool.monthlySpend),
      })),
  };
}

function calculateOptimizationScore(totalSpend: number, totalSavings: number) {
  if (totalSpend <= 0) {
    return 100;
  }

  const wasteRatio = Math.min(totalSavings / totalSpend, 1);
  return Math.max(0, Math.round(100 - wasteRatio * 100));
}

function inferToolHealth(monthlySavings: number, currentSpend: number) {
  if (monthlySavings >= 250 || monthlySavings / Math.max(currentSpend, 1) >= 0.35) {
    return "waste";
  }

  if (monthlySavings > 0) {
    return "review";
  }

  return "optimized";
}

function inferVerdict(totalMonthlySavings: number): AuditResult["verdict"] {
  if (totalMonthlySavings > 500) {
    return "high_savings";
  }

  if (totalMonthlySavings > 50) {
    return "moderate_savings";
  }

  return "optimized";
}
