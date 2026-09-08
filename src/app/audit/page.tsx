import type { Metadata } from "next";
import { AuditForm } from "@/components/audit/audit-form";

export const metadata: Metadata = {
  title: "Run Audit",
  description:
    "Enter your AI tool stack and get a savings audit for subscriptions, seats, and API spend.",
};

export default function AuditPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background">
      <section className="border-b border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-primary">AI spend intake</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            Tell us what your team pays for.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            The audit runs before lead capture, so you can see estimated savings first. Your
            form state is saved locally as you work.
          </p>
        </div>
      </section>
      <AuditForm />
    </main>
  );
}
