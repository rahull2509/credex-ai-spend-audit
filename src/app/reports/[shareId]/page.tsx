import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/audit/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPublicAuditReport } from "@/lib/supabase/reports";
import { appConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type PageProps = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const report = await getPublicAuditReport(shareId);

  if (!report) {
    return {
      title: "Audit report not found",
    };
  }

  const title = `${formatCurrency(
    report.publicResult.totalMonthlySavings,
  )}/mo AI savings report`;
  const description = `Public Credex audit showing ${formatCurrency(
    report.publicResult.totalAnnualSavings,
  )} in annual AI spend optimization opportunities.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/reports/${shareId}`,
      images: [
        {
          url: `/reports/${shareId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Credex AI Spend Audit report preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/reports/${shareId}/opengraph-image`],
    },
  };
}

export default async function PublicReportPage({ params }: PageProps) {
  const { shareId } = await params;
  const report = await getPublicAuditReport(shareId);

  if (!report) {
    notFound();
  }

  const shareUrl = `${appConfig.url.replace(/\/$/, "")}/reports/${shareId}`;

  return (
    <main className="min-h-[calc(100svh-4rem)]">
      <section className="premium-grid border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Badge variant="secondary">Public AI spend report</Badge>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
                {formatCurrency(report.publicResult.totalMonthlySavings)}/mo in AI savings
                identified.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {report.summary}
              </p>
            </div>
            <Card className="bg-background/75">
              <CardHeader>
                <CardTitle>Share this audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground break-all">{shareUrl}</p>
                <CopyLinkButton value={shareUrl} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <div className="grid gap-4 self-start">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Spend band</p>
              <p className="mt-2 text-3xl font-semibold">
                {report.publicResult.totalMonthlySpendBand}
              </p>
              <Separator className="my-5" />
              <p className="text-sm text-muted-foreground">Annual savings</p>
              <p className="mt-2 text-3xl font-semibold text-primary">
                {formatCurrency(report.publicResult.totalAnnualSavings)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Optimization score</p>
              <p className="mt-2 text-3xl font-semibold">
                {report.publicResult.optimizationScore}/100
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Public reports hide exact total spend, email, company name, and private lead
                metadata.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {report.publicResult.tools.map((tool) => (
            <Card key={tool.toolId}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{tool.toolName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tool.currentPlan} plan
                    </p>
                  </div>
                  <Badge variant={tool.health === "optimized" ? "success" : "warning"}>
                    {formatCurrency(tool.monthlySavings)}/mo
                  </Badge>
                </div>
                <Separator className="my-4" />
                <p className="font-medium">{tool.primaryRecommendation.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tool.primaryRecommendation.reason}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-primary/10">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Want your own audit?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Run the same rules engine against your AI stack.
                </p>
              </div>
              <Button asChild>
                <a href="/audit">Start free audit</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
