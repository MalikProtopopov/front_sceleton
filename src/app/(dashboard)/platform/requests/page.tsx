"use client";

import { useState } from "react";
import { Select, Spinner } from "@/shared/ui";
import { usePlatformUpgradeRequests, useReviewUpgradeRequest } from "@/features/billing";
import { PlatformRequestsTable } from "@/features/billing/ui/PlatformRequestsTable";
import type { PlatformUpgradeRequestParams, UpgradeRequestStatus } from "@/entities/billing";

const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобрены" },
  { value: "rejected", label: "Отклонены" },
];

export default function PlatformRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const params: PlatformUpgradeRequestParams = statusFilter
    ? { status: statusFilter as UpgradeRequestStatus }
    : {};

  const { data, isLoading } = usePlatformUpgradeRequests(params);
  const { mutate: review, isPending: isReviewing } = useReviewUpgradeRequest();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Заявки на апгрейд</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление заявками от организаций
          </p>
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Фильтр по статусу"
        />
      </div>

      <PlatformRequestsTable
        requests={data ?? []}
        isLoading={isLoading}
        onApprove={(id) => review({ id, data: { status: "approved" } })}
        onReject={(id) => review({ id, data: { status: "rejected" } })}
        isReviewing={isReviewing}
      />
    </div>
  );
}
