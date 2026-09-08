import type { AuditInput } from "@/lib/audit/types";

export const demoAuditInput: AuditInput = {
  teamSize: 8,
  primaryUseCase: "engineering",
  tools: [
    { toolId: "chatgpt", planId: "team", monthlySpend: 300, seats: 10 },
    { toolId: "claude", planId: "team", monthlySpend: 240, seats: 8 },
    { toolId: "cursor", planId: "business", monthlySpend: 320, seats: 8 },
    { toolId: "github-copilot", planId: "business", monthlySpend: 152, seats: 8 },
    { toolId: "openai-api", planId: "usage", monthlySpend: 420, seats: 1 },
  ],
};
