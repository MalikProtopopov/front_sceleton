"use client";

import { Spinner } from "@/shared/ui";
import { useMyLimits } from "@/features/billing";
import { UsageSection } from "@/features/billing/ui/UsageSection";

export default function BillingLimitsPage() {
  const { data, isLoading } = useMyLimits();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Лимиты</h1>
        <p className="text-[var(--color-text-secondary)]">
          Текущее использование ресурсов по вашему тарифу
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
        <UsageSection usage={data} />
      </div>
    </div>
  );
}
