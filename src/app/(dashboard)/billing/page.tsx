"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { useMyPlan } from "@/features/billing";
import { PlanCard } from "@/features/billing/ui/PlanCard";
import { UsageSection } from "@/features/billing/ui/UsageSection";
import { ActiveModulesList } from "@/features/billing/ui/ActiveModulesList";

export default function BillingPage() {
  const router = useRouter();
  const { data, isLoading } = useMyPlan();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  const { plan, modules, usage } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Мой тариф</h1>
        <p className="text-[var(--color-text-secondary)]">
          Текущий план, использование ресурсов и подключённые модули
        </p>
      </div>

      <PlanCard plan={plan} onChangePlan={() => router.push(ROUTES.BILLING_PLANS)} />

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Использование ресурсов
        </h2>
        <UsageSection usage={usage} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Активные модули
        </h2>
        <ActiveModulesList modules={modules} />
      </div>
    </div>
  );
}
