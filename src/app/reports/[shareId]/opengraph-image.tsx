import { ImageResponse } from "next/og";
import { getPublicAuditReport } from "@/lib/supabase/reports";
import { formatCurrency } from "@/lib/format";

export const alt = "Credex AI Spend Audit public report";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function OpenGraphImage({ params }: ImageProps) {
  const { shareId } = await params;
  const report = await getPublicAuditReport(shareId);
  const monthlySavings = report?.publicResult.totalMonthlySavings ?? 0;
  const annualSavings = report?.publicResult.totalAnnualSavings ?? 0;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#08090b",
        color: "#f8fafc",
        padding: 64,
        fontFamily: "Arial",
      }}
    >
      <div style={{ fontSize: 30, color: "#5eead4" }}>Credex AI Spend Audit</div>
      <div>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: 0 }}>
          {formatCurrency(monthlySavings)}/mo saved
        </div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#94a3b8" }}>
          {formatCurrency(annualSavings)} annual AI spend optimization
        </div>
      </div>
      <div style={{ fontSize: 26, color: "#94a3b8" }}>
        Public report hides sensitive spend and lead data.
      </div>
    </div>,
    size,
  );
}
