import type { Metadata } from "next";
import { ResultsDashboard } from "@/components/audit/results-dashboard";

export const metadata: Metadata = {
  title: "Audit Results",
  description: "Review AI spend recommendations and create a shareable report.",
};

export default function AuditResultsPage() {
  return <ResultsDashboard />;
}
