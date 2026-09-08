import { z } from "zod";
import { toolIds, useCases } from "@/lib/audit/types";

export const toolSpendInputSchema = z.object({
  toolId: z.enum(toolIds),
  planId: z.string().min(1),
  monthlySpend: z.coerce.number().min(0).max(250000),
  seats: z.coerce.number().int().min(1).max(10000),
});

export const auditInputSchema = z.object({
  teamSize: z.coerce.number().int().min(1).max(10000),
  primaryUseCase: z.enum(useCases),
  tools: z.array(toolSpendInputSchema).min(1).max(8),
});

export const leadCaptureSchema = z.object({
  email: z.string().email().max(255),
  companyName: z.string().min(2).max(120),
  role: z.string().min(2).max(80),
  teamSize: z.coerce.number().int().min(1).max(10000),
  website: z.string().max(0).optional(),
});

export const createAuditRequestSchema = z.object({
  audit: auditInputSchema,
  lead: leadCaptureSchema,
});

export type AuditInputFormValues = z.infer<typeof auditInputSchema>;
export type LeadCaptureValues = z.infer<typeof leadCaptureSchema>;
export type CreateAuditRequest = z.infer<typeof createAuditRequestSchema>;
