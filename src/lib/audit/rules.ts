import { calculateExpectedCatalogSpend, normalizeSeatCount } from "@/lib/audit/calculator";
import { getCheapestPaidPlan, getPlan, getToolPricing } from "@/lib/audit/pricing";
import { createRecommendation } from "@/lib/audit/recommendations";
import type { AuditInput, Recommendation, ToolSpendInput } from "@/lib/audit/types";

type RuleContext = {
  audit: AuditInput;
  tool: ToolSpendInput;
};

export function evaluateToolRules(context: RuleContext): Recommendation[] {
  return [
    detectBillingDrift(context),
    detectTeamPlanOverkill(context),
    detectSeatOverProvisioning(context),
    detectApiUsageMismatch(context),
    detectCheaperAlternative(context),
  ].filter((recommendation): recommendation is Recommendation => Boolean(recommendation));
}

export function evaluatePortfolioRules(audit: AuditInput) {
  return detectDuplicateCodingTools(audit);
}

function detectBillingDrift({ tool }: RuleContext) {
  const plan = getPlan(tool.toolId, tool.planId);

  if (plan.isApiPlan) {
    return null;
  }

  const expectedSpend = calculateExpectedCatalogSpend(tool);
  const drift = tool.monthlySpend - expectedSpend;

  if (expectedSpend === 0 || drift < Math.max(15, expectedSpend * 0.15)) {
    return null;
  }

  const toolPricing = getToolPricing(tool.toolId);
  return createRecommendation({
    type: "billing_drift",
    title: `Verify ${toolPricing.name} invoice drift`,
    reason: `${toolPricing.name} is entered at $${Math.round(
      tool.monthlySpend,
    )}/mo, while the catalog expectation for ${plan.name} is about $${Math.round(
      expectedSpend,
    )}/mo.`,
    action: "Check inactive seats, legacy add-ons, and annual-to-monthly allocation.",
    monthlySavings: drift,
    currentSpend: tool.monthlySpend,
    confidence: 0.86,
  });
}

function detectTeamPlanOverkill({ audit, tool }: RuleContext) {
  const plan = getPlan(tool.toolId, tool.planId);

  if (!plan.isTeamPlan || tool.seats > 2 || audit.teamSize > 2) {
    return null;
  }

  const cheaperPlan = getCheapestPaidPlan(tool.toolId);
  if (!cheaperPlan || cheaperPlan.id === plan.id) {
    return null;
  }

  const targetSpend = cheaperPlan.monthlySeatPrice * normalizeSeatCount(tool.seats);
  const savings = tool.monthlySpend - targetSpend;
  if (savings <= 0) {
    return null;
  }

  const toolPricing = getToolPricing(tool.toolId);
  return createRecommendation({
    type: "downgrade",
    title: `Move ${toolPricing.name} to ${cheaperPlan.name}`,
    reason: `${plan.name} is usually too much process for ${tool.seats} seat${
      tool.seats === 1 ? "" : "s"
    }. ${cheaperPlan.name} covers the same day-to-day workflow with lower admin overhead.`,
    action: `Downgrade to ${cheaperPlan.name} until collaboration features are clearly needed.`,
    monthlySavings: savings,
    currentSpend: tool.monthlySpend,
    confidence: 0.84,
  });
}

function detectSeatOverProvisioning({ audit, tool }: RuleContext) {
  const plan = getPlan(tool.toolId, tool.planId);

  if (plan.isApiPlan || tool.seats <= audit.teamSize) {
    return null;
  }

  const excessSeats = normalizeSeatCount(tool.seats) - normalizeSeatCount(audit.teamSize);
  if (excessSeats <= 0 || plan.monthlySeatPrice <= 0) {
    return null;
  }

  const toolPricing = getToolPricing(tool.toolId);
  return createRecommendation({
    type: "seat_rightsizing",
    title: `Remove ${excessSeats} unused ${toolPricing.name} seat${
      excessSeats === 1 ? "" : "s"
    }`,
    reason: `The audit shows ${tool.seats} paid seats for a ${audit.teamSize}-person team.`,
    action: "Reconcile your seat roster against active users before the next renewal.",
    monthlySavings: excessSeats * plan.monthlySeatPrice,
    currentSpend: tool.monthlySpend,
    confidence: 0.9,
  });
}

function detectApiUsageMismatch({ audit, tool }: RuleContext) {
  const plan = getPlan(tool.toolId, tool.planId);
  if (!plan.isApiPlan || tool.monthlySpend < 120) {
    return null;
  }

  const toolPricing = getToolPricing(tool.toolId);

  if (audit.primaryUseCase === "product_api") {
    const savings = tool.monthlySpend * 0.15;
    return createRecommendation({
      type: "usage_shift",
      title: `Add budget guardrails to ${toolPricing.name}`,
      reason:
        "Product API workloads are valid, but spend this high usually benefits from per-environment caps, prompt caching, and model routing.",
      action:
        "Split production, staging, and experimentation keys with hard monthly limits.",
      monthlySavings: savings,
      currentSpend: tool.monthlySpend,
      confidence: 0.7,
    });
  }

  const subscriptionEquivalent = audit.teamSize * 30;
  const savings = Math.min(
    tool.monthlySpend * 0.35,
    tool.monthlySpend - subscriptionEquivalent,
  );

  if (savings <= 0) {
    return null;
  }

  return createRecommendation({
    type: "usage_shift",
    title: `Shift exploratory ${toolPricing.name} usage to seats`,
    reason:
      "The primary use case is not product API delivery, so some API experimentation is probably replacing fixed-price subscriptions.",
    action:
      "Keep API keys for automation, but move human prompting to managed per-seat plans.",
    monthlySavings: savings,
    currentSpend: tool.monthlySpend,
    confidence: 0.73,
  });
}

function detectCheaperAlternative({ audit, tool }: RuleContext) {
  const plan = getPlan(tool.toolId, tool.planId);

  if (
    plan.isApiPlan ||
    !["research", "content", "support"].includes(audit.primaryUseCase)
  ) {
    return null;
  }

  if (!["chatgpt", "claude"].includes(tool.toolId) || tool.monthlySpend < 150) {
    return null;
  }

  const comparableGeminiSpend = audit.teamSize * 20;
  const savings = tool.monthlySpend - comparableGeminiSpend;

  if (savings < 25) {
    return null;
  }

  const toolPricing = getToolPricing(tool.toolId);
  return createRecommendation({
    type: "alternative",
    title: `Benchmark Gemini for ${audit.primaryUseCase.replace("_", " ")}`,
    reason: `${toolPricing.name} is useful, but the use case is broad enough that Gemini Advanced can cover a portion of the workload at a lower seat cost.`,
    action:
      "Pilot Gemini with 20% of non-sensitive research and writing work for two weeks.",
    monthlySavings: savings * 0.5,
    currentSpend: tool.monthlySpend,
    confidence: 0.62,
  });
}

function detectDuplicateCodingTools(audit: AuditInput) {
  const codingTools = audit.tools.filter(
    (tool) => getToolPricing(tool.toolId).category === "coding-assistant",
  );

  if (codingTools.length < 2) {
    return new Map<string, Recommendation>();
  }

  const preferred = [...codingTools].sort(
    (a, b) => scoreCodingTool(b) - scoreCodingTool(a),
  )[0];
  const recommendations = new Map<string, Recommendation>();

  for (const tool of codingTools) {
    if (tool.toolId === preferred.toolId) {
      continue;
    }

    const toolPricing = getToolPricing(tool.toolId);
    const preferredPricing = getToolPricing(preferred.toolId);
    recommendations.set(
      tool.toolId,
      createRecommendation({
        type: "consolidation",
        title: `Consolidate ${toolPricing.name} into ${preferredPricing.name}`,
        reason: `${toolPricing.name} overlaps heavily with ${preferredPricing.name}. Running multiple coding assistants across the same team usually creates duplicated seat cost rather than proportional productivity.`,
        action: `Keep ${preferredPricing.name} as the default coding assistant and retain ${toolPricing.name} only for named exceptions.`,
        monthlySavings: tool.monthlySpend * 0.75,
        currentSpend: tool.monthlySpend,
        confidence: 0.8,
      }),
    );
  }

  return recommendations;
}

function scoreCodingTool(tool: ToolSpendInput) {
  const toolPricing = getToolPricing(tool.toolId);
  const plan = getPlan(tool.toolId, tool.planId);
  const categoryFit =
    toolPricing.id === "cursor" ? 3 : toolPricing.id === "github-copilot" ? 2 : 1;
  const paidFit = plan.monthlySeatPrice > 0 ? 1 : 0;
  return categoryFit + paidFit + Math.min(tool.monthlySpend / 100, 2);
}
