"use client";

import { Spinner } from "@/shared/ui";
import { useMyModules } from "@/features/billing";
import { ActiveModulesList } from "@/features/billing/ui/ActiveModulesList";

export default function BillingModulesPage() {
  const { data, isLoading } = useMyModules();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Мои модули</h1>
        <p className="text-[var(--color-text-secondary)]">
          Все подключённые модули вашей организации
        </p>
      </div>

      <ActiveModulesList modules={data?.items ?? []} isLoading={isLoading} />
    </div>
  );
}
