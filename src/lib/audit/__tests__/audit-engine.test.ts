import { describe, expect, it } from "vitest";
import { runAudit, toPublicAuditResult } from "@/lib/audit/engine";
import type { AuditInput } from "@/lib/audit/types";

describe("audit engine", () => {
  it("flags team plans as overkill for a two-person company", () => {
    const result = runAudit({
      teamSize: 2,
      primaryUseCase: "research",
      tools: [{ toolId: "chatgpt", planId: "team", monthlySpend: 60, seats: 2 }],
    });

    expect(result.tools[0].primaryRecommendation.type).toBe("downgrade");
    expect(result.totalMonthlySavings).toBe(20);
    expect(result.totalAnnualSavings).toBe(240);
  });

  it("detects paid seats above the actual team size", () => {
    const result = runAudit({
      teamSize: 6,
      primaryUseCase: "engineering",
      tools: [{ toolId: "cursor", planId: "business", monthlySpend: 400, seats: 10 }],
    });

    expect(result.tools[0].primaryRecommendation.type).toBe("seat_rightsizing");
    expect(result.tools[0].monthlySavings).toBe(160);
  });

  it("recommends consolidating overlapping coding assistants", () => {
    const input: AuditInput = {
      teamSize: 5,
      primaryUseCase: "engineering",
      tools: [
        { toolId: "cursor", planId: "pro", monthlySpend: 100, seats: 5 },
        {
          toolId: "github-copilot",
          planId: "business",
          monthlySpend: 95,
          seats: 5,
        },
        { toolId: "windsurf", planId: "pro", monthlySpend: 75, seats: 5 },
      ],
    };

    const result = runAudit(input);
    const consolidationTools = result.tools.filter(
      (tool) => tool.primaryRecommendation.type === "consolidation",
    );

    expect(consolidationTools.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBeGreaterThan(100);
  });

  it("treats low-spend well-matched tools as optimized", () => {
    const result = runAudit({
      teamSize: 3,
      primaryUseCase: "content",
      tools: [{ toolId: "gemini", planId: "advanced", monthlySpend: 60, seats: 3 }],
    });

    expect(result.verdict).toBe("optimized");
    expect(result.tools[0].health).toBe("optimized");
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("adds API guardrail recommendations for high product API spend", () => {
    const result = runAudit({
      teamSize: 4,
      primaryUseCase: "product_api",
      tools: [{ toolId: "anthropic-api", planId: "usage", monthlySpend: 1000, seats: 1 }],
    });

    expect(result.tools[0].primaryRecommendation.type).toBe("usage_shift");
    expect(result.tools[0].monthlySavings).toBe(150);
  });

  it("hides sensitive exact spend in public audit results", () => {
    const result = runAudit({
      teamSize: 12,
      primaryUseCase: "mixed",
      tools: [{ toolId: "chatgpt", planId: "team", monthlySpend: 720, seats: 20 }],
    });

    const publicResult = toPublicAuditResult(result);

    expect(publicResult.totalMonthlySpendBand).toBe("$500-$1.5k/mo");
    expect("currentSpend" in publicResult.tools[0]).toBe(false);
  });
});
