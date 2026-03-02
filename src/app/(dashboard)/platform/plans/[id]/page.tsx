"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformPlans, usePlatformModules, useUpdatePlan } from "@/features/billing";
import { PlanForm } from "@/features/billing/ui/PlanForm";

export default function PlatformPlanEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: plans, isLoading: plansLoading } = usePlatformPlans();
  const { data: modules, isLoading: modulesLoading } = usePlatformModules();
  const { mutate: updatePlan, isPending } = useUpdatePlan(id);

  const isLoading = plansLoading || modulesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const plan = plans?.find((p) => p.id === id);
  if (!plan) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Редактирование: {plan.name_ru}
        </h1>
        <p className="text-[var(--color-text-secondary)]">Изменение тарифного плана</p>
      </div>

      <PlanForm
        plan={plan}
        allModules={modules ?? []}
        onSubmit={(data) =>
          updatePlan(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_PLANS),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
