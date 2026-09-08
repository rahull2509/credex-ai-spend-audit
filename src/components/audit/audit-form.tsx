"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPlanOptions, pricingCatalog } from "@/lib/audit/pricing";
import { toolIds, useCases, type AuditInput, type ToolId } from "@/lib/audit/types";
import { formatCurrency } from "@/lib/format";

const STORAGE_KEY = "credex.audit.form";
export const AUDIT_INPUT_STORAGE_KEY = "credex.audit.input";

const formSchema = z
  .object({
    teamSize: z.number().int().min(1).max(10000),
    primaryUseCase: z.enum(useCases),
    tools: z.array(
      z.object({
        toolId: z.enum(toolIds),
        planId: z.string().min(1),
        monthlySpend: z.number().min(0).max(250000),
        seats: z.number().int().min(1).max(10000),
        enabled: z.boolean(),
      }),
    ),
  })
  .superRefine((value, context) => {
    const activeTools = value.tools.filter(
      (tool) => tool.enabled && Number(tool.monthlySpend) > 0,
    );

    if (activeTools.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["tools"],
        message: "Select at least one tool with monthly spend.",
      });
    }
  });

type AuditFormValues = z.infer<typeof formSchema>;

const useCaseLabels: Record<(typeof useCases)[number], string> = {
  engineering: "Engineering and coding",
  research: "Research and analysis",
  content: "Content and marketing",
  support: "Customer support",
  product_api: "Product API usage",
  mixed: "Mixed company-wide usage",
};

const startingSpend: Partial<Record<ToolId, number>> = {
  chatgpt: 90,
  claude: 60,
  cursor: 100,
  "github-copilot": 95,
};

export function AuditForm() {
  const router = useRouter();
  const defaultValues = useMemo(() => buildDefaultValues(), []);
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const watchedValues = useWatch({ control }) as AuditFormValues;
  const watchedTools = watchedValues.tools ?? defaultValues.tools;
  const selectedSpend = watchedTools
    .filter((tool) => tool.enabled)
    .reduce((total, tool) => total + Number(tool.monthlySpend || 0), 0);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = formSchema.safeParse(JSON.parse(saved));
    if (parsed.success) {
      reset(parsed.data);
    }
  }, [reset]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  function onSubmit(values: AuditFormValues) {
    const auditInput: AuditInput = {
      teamSize: values.teamSize,
      primaryUseCase: values.primaryUseCase,
      tools: values.tools
        .filter((tool) => tool.enabled && Number(tool.monthlySpend) > 0)
        .map((tool) => ({
          toolId: tool.toolId,
          planId: tool.planId,
          monthlySpend: Number(tool.monthlySpend),
          seats: Number(tool.seats),
        })),
    };

    window.localStorage.setItem(AUDIT_INPUT_STORAGE_KEY, JSON.stringify(auditInput));
    router.push("/audit/results");
  }

  function resetForm() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(AUDIT_INPUT_STORAGE_KEY);
    reset(defaultValues);
  }

  return (
    <section className="py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:px-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Company context</CardTitle>
            <CardDescription>
              These inputs help the rules engine distinguish real scale from waste.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="teamSize">Team size</Label>
              <Input
                id="teamSize"
                type="number"
                min={1}
                max={10000}
                {...register("teamSize", { valueAsNumber: true })}
              />
              {errors.teamSize ? (
                <p className="text-sm text-destructive">{errors.teamSize.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Primary use case</Label>
              <Controller
                control={control}
                name="primaryUseCase"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase} value={useCase}>
                          {useCaseLabels[useCase]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">AI tools</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the tools you pay for and enter realistic monthly spend.
              </p>
            </div>
            <Badge variant="secondary">
              Selected spend: {formatCurrency(selectedSpend)}
            </Badge>
          </div>

          {errors.tools?.message ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-rose-200">
              {errors.tools.message}
            </p>
          ) : null}

          <div className="grid gap-4">
            {watchedTools.map((tool, index) => {
              const toolConfig = pricingCatalog[tool.toolId];
              const planOptions = getPlanOptions(tool.toolId);
              const isEnabled = watchedTools[index]?.enabled;

              return (
                <Card key={tool.toolId} className={isEnabled ? "bg-card" : "bg-card/55"}>
                  <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_0.7fr_0.7fr] lg:items-end">
                    <div className="flex items-start gap-3">
                      <Controller
                        control={control}
                        name={`tools.${index}.enabled`}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={`Select ${toolConfig.name}`}
                            className="mt-1"
                          />
                        )}
                      />
                      <div>
                        <h3 className="font-semibold">{toolConfig.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {toolConfig.category.replace("-", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Plan</Label>
                      <Controller
                        control={control}
                        name={`tools.${index}.planId`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!isEnabled}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {planOptions.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`monthlySpend-${tool.toolId}`}>Monthly spend</Label>
                      <Input
                        id={`monthlySpend-${tool.toolId}`}
                        type="number"
                        min={0}
                        step={1}
                        disabled={!isEnabled}
                        {...register(`tools.${index}.monthlySpend`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`seats-${tool.toolId}`}>Seats</Label>
                      <Input
                        id={`seats-${tool.toolId}`}
                        type="number"
                        min={1}
                        step={1}
                        disabled={!isEnabled}
                        {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <span>
              Results are calculated locally first. Lead capture only appears after the
              dashboard shows your estimated savings.
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={resetForm}>
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Generate audit
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function buildDefaultValues(): AuditFormValues {
  return {
    teamSize: 5,
    primaryUseCase: "engineering",
    tools: toolIds.map((toolId) => {
      const config = pricingCatalog[toolId];
      const enabled = ["chatgpt", "cursor", "github-copilot"].includes(toolId);

      return {
        enabled,
        toolId,
        planId: config.defaultPlanId,
        monthlySpend: enabled ? (startingSpend[toolId] ?? 50) : 0,
        seats: config.category === "api" ? 1 : 5,
      };
    }),
  };
}
