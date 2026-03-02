"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { useCreatePlan, usePlatformModules } from "@/features/billing";
import { PlanForm } from "@/features/billing/ui/PlanForm";

export default function PlatformPlanNewPage() {
  const router = useRouter();
  const { data: modules, isLoading: modulesLoading } = usePlatformModules();
  const { mutate: createPlan, isPending } = useCreatePlan();

  if (modulesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый тариф</h1>
        <p className="text-[var(--color-text-secondary)]">Создание нового тарифного плана</p>
      </div>

      <PlanForm
        allModules={modules ?? []}
        onSubmit={(data) =>
          createPlan(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_PLANS),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
