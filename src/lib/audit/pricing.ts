import type { ToolId, ToolPricing, UseCase } from "@/lib/audit/types";

export const pricingCatalog: Record<ToolId, ToolPricing> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    category: "general-ai",
    defaultPlanId: "plus",
    plans: [
      plan("free", "Free", 0, false, ["research", "content", "mixed"]),
      plan("plus", "Plus", 20, false, ["research", "content", "mixed"]),
      plan("team", "Team", 30, true, ["engineering", "support", "mixed"], 2),
      plan("pro", "Pro", 200, false, ["research", "product_api", "mixed"]),
    ],
  },
  claude: {
    id: "claude",
    name: "Claude",
    category: "general-ai",
    defaultPlanId: "pro",
    plans: [
      plan("free", "Free", 0, false, ["research", "content"]),
      plan("pro", "Pro", 20, false, ["engineering", "content", "research"]),
      plan("team", "Team", 30, true, ["engineering", "support", "mixed"], 5),
      plan("max", "Max", 100, false, ["engineering", "research"]),
    ],
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    category: "coding-assistant",
    defaultPlanId: "pro",
    plans: [
      plan("hobby", "Hobby", 0, false, ["engineering"]),
      plan("pro", "Pro", 20, false, ["engineering"]),
      plan("business", "Business", 40, true, ["engineering", "mixed"], 2),
    ],
  },
  "github-copilot": {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding-assistant",
    defaultPlanId: "business",
    plans: [
      plan("individual", "Individual", 10, false, ["engineering"]),
      plan("business", "Business", 19, true, ["engineering"], 1),
      plan("enterprise", "Enterprise", 39, true, ["engineering", "mixed"], 1),
    ],
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    category: "workspace-ai",
    defaultPlanId: "advanced",
    plans: [
      plan("free", "Free", 0, false, ["research"]),
      plan("advanced", "Advanced", 20, false, ["research", "content", "mixed"]),
      plan("workspace-business", "Workspace Business", 24, true, [
        "support",
        "content",
        "mixed",
      ]),
    ],
  },
  "openai-api": {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    defaultPlanId: "usage",
    plans: [
      {
        id: "usage",
        name: "Usage-based",
        monthlySeatPrice: 0,
        isTeamPlan: false,
        isApiPlan: true,
        bestFor: ["product_api", "support", "mixed"],
      },
    ],
  },
  "anthropic-api": {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    defaultPlanId: "usage",
    plans: [
      {
        id: "usage",
        name: "Usage-based",
        monthlySeatPrice: 0,
        isTeamPlan: false,
        isApiPlan: true,
        bestFor: ["product_api", "support", "mixed"],
      },
    ],
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    category: "coding-assistant",
    defaultPlanId: "pro",
    plans: [
      plan("free", "Free", 0, false, ["engineering"]),
      plan("pro", "Pro", 15, false, ["engineering"]),
      plan("teams", "Teams", 30, true, ["engineering", "mixed"], 2),
    ],
  },
};

function plan(
  id: string,
  name: string,
  monthlySeatPrice: number,
  isTeamPlan: boolean,
  bestFor: UseCase[],
  minSeats?: number,
) {
  return { id, name, monthlySeatPrice, isTeamPlan, bestFor, minSeats };
}

export function getToolPricing(toolId: ToolId) {
  return pricingCatalog[toolId];
}

export function getPlan(toolId: ToolId, planId: string) {
  const tool = getToolPricing(toolId);
  return (
    tool.plans.find((candidate) => candidate.id === planId) ??
    tool.plans.find((candidate) => candidate.id === tool.defaultPlanId) ??
    tool.plans[0]
  );
}

export function getCheapestPaidPlan(toolId: ToolId) {
  const tool = getToolPricing(toolId);
  return tool.plans
    .filter((candidate) => candidate.monthlySeatPrice > 0 && !candidate.isApiPlan)
    .sort((a, b) => a.monthlySeatPrice - b.monthlySeatPrice)[0];
}

export function getPlanOptions(toolId: ToolId) {
  return getToolPricing(toolId).plans.map((planItem) => ({
    id: planItem.id,
    name: planItem.name,
    label: planItem.isApiPlan
      ? planItem.name
      : `${planItem.name} - $${planItem.monthlySeatPrice}/seat`,
  }));
}
