import type { PublicAuditResult } from "@/lib/audit/types";
import { createSupabasePublicClient, hasSupabasePublicConfig } from "@/lib/supabase/server";

export interface PublicAuditReport {
  shareId: string;
  summary: string;
  publicResult: PublicAuditResult;
  createdAt: string;
}

interface PublicAuditRow {
  share_id: string;
  summary: string;
  public_result: PublicAuditResult;
  created_at: string;
}

export async function getPublicAuditReport(shareId: string) {
  if (!hasSupabasePublicConfig()) {
    return null;
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("public_audits")
    .select("share_id, summary, public_result, created_at")
    .eq("share_id", shareId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load public audit", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const row = data as PublicAuditRow;
  return {
    shareId: row.share_id,
    summary: row.summary,
    publicResult: row.public_result,
    createdAt: row.created_at,
  } satisfies PublicAuditReport;
}
