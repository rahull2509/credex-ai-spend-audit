import Anthropic from "@anthropic-ai/sdk";
import { buildFallbackSummary } from "@/lib/audit/summary-template";
import type { AuditResult } from "@/lib/audit/types";
import { formatCurrency } from "@/lib/format";

interface SummaryInput {
  result: AuditResult;
  companyName: string;
  role: string;
}

export async function generateAuditSummary(input: SummaryInput) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: buildFallbackSummary(input.result, input.companyName),
      source: "fallback" as const,
    };
  }

  try {
    const summary = await retry(() => requestAnthropicSummary(input), 2);
    return { summary, source: "anthropic" as const };
  } catch (error) {
    console.error("Anthropic summary generation failed", error);
    return {
      summary: buildFallbackSummary(input.result, input.companyName),
      source: "fallback" as const,
    };
  }
}

async function requestAnthropicSummary({ result, companyName, role }: SummaryInput) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
  const topFindings = result.tools
    .filter((tool) => tool.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map(
      (tool) =>
        `${tool.toolName}: ${formatCurrency(tool.monthlySavings)}/mo - ${
          tool.primaryRecommendation.reason
        }`,
    )
    .join("\n");

  const response = await anthropic.messages.create({
    model,
    max_tokens: 190,
    temperature: 0.25,
    system:
      "You write concise B2B SaaS audit summaries for startup operators. Be specific, professional, and direct. Avoid hype, filler, and generic advice.",
    messages: [
      {
        role: "user",
        content: `Write a personalized audit summary in about 100 words.

Company: ${companyName}
Reader role: ${role}
Team size: ${result.teamSize}
Primary AI use case: ${result.primaryUseCase}
Current monthly spend: ${formatCurrency(result.totalMonthlySpend)}
Monthly savings found: ${formatCurrency(result.totalMonthlySavings)}
Annual savings found: ${formatCurrency(result.totalAnnualSavings)}
Optimization score: ${result.optimizationScore}/100
Top findings:
${topFindings || "No high-confidence savings opportunities. The stack appears optimized."}

Mention the biggest overspending insight, one optimization opportunity, and why this matters for runway.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text" || textBlock.text.trim().length < 40) {
    throw new Error("Anthropic returned an empty summary.");
  }

  return textBlock.text.trim();
}

async function retry<T>(operation: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
