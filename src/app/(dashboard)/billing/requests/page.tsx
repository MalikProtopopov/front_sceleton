"use client";

import { Spinner } from "@/shared/ui";
import { useUpgradeRequests } from "@/features/billing";
import { UpgradeRequestsList } from "@/features/billing/ui/UpgradeRequestsList";

export default function BillingRequestsPage() {
  const { data, isLoading } = useUpgradeRequests();

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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Мои заявки</h1>
        <p className="text-[var(--color-text-secondary)]">
          История заявок на изменение тарифа и подключение модулей
        </p>
      </div>

      <UpgradeRequestsList requests={data ?? []} isLoading={isLoading} />
    </div>
  );
}
