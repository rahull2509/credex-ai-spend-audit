export const toolIds = [
  "chatgpt",
  "claude",
  "cursor",
  "github-copilot",
  "gemini",
  "openai-api",
  "anthropic-api",
  "windsurf",
] as const;

export type ToolId = (typeof toolIds)[number];

export const useCases = [
  "engineering",
  "research",
  "content",
  "support",
  "product_api",
  "mixed",
] as const;

export type UseCase = (typeof useCases)[number];

export type ToolCategory = "general-ai" | "coding-assistant" | "api" | "workspace-ai";

export type RecommendationSeverity = "low" | "medium" | "high";

export type RecommendationType =
  | "downgrade"
  | "seat_rightsizing"
  | "billing_drift"
  | "consolidation"
  | "usage_shift"
  | "alternative"
  | "optimized";

export interface ToolPlan {
  id: string;
  name: string;
  monthlySeatPrice: number;
  isTeamPlan: boolean;
  isApiPlan?: boolean;
  minSeats?: number;
  bestFor: UseCase[];
}

export interface ToolPricing {
  id: ToolId;
  name: string;
  category: ToolCategory;
  plans: ToolPlan[];
  defaultPlanId: string;
}

export interface ToolSpendInput {
  toolId: ToolId;
  planId: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  primaryUseCase: UseCase;
  tools: ToolSpendInput[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  reason: string;
  action: string;
  monthlySavings: number;
  annualSavings: number;
  confidence: number;
}

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  category: ToolCategory;
  currentPlan: string;
  currentSpend: number;
  expectedCatalogSpend: number;
  seats: number;
  monthlySavings: number;
  annualSavings: number;
  recommendations: Recommendation[];
  primaryRecommendation: Recommendation;
  health: "optimized" | "review" | "waste";
}

export interface AuditResult {
  teamSize: number;
  primaryUseCase: UseCase;
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizationScore: number;
  verdict: "optimized" | "moderate_savings" | "high_savings";
  generatedAt: string;
  tools: ToolAuditResult[];
}

export interface PublicAuditResult {
  teamSize: number;
  primaryUseCase: UseCase;
  totalMonthlySpendBand: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizationScore: number;
  verdict: AuditResult["verdict"];
  generatedAt: string;
  tools: Array<
    Pick<
      ToolAuditResult,
      | "toolId"
      | "toolName"
      | "currentPlan"
      | "monthlySavings"
      | "annualSavings"
      | "health"
      | "primaryRecommendation"
    >
  >;
}
