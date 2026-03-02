"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Badge, Table, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformPlans } from "@/features/billing";
import { formatPrice } from "@/features/billing/lib/billingConstants";
import type { PlanResponse } from "@/entities/billing";
import type { Column } from "@/shared/ui/Table/Table";

const columns: Column<PlanResponse>[] = [
  {
    key: "name_ru",
    header: "Название",
    render: (row) => (
      <div>
        <span className="font-medium">{row.name_ru}</span>
        <span className="ml-2 text-xs text-[var(--color-text-muted)]">{row.slug}</span>
      </div>
    ),
  },
  {
    key: "price_monthly_kopecks",
    header: "Цена/мес",
    render: (row) =>
      row.price_monthly_kopecks > 0
        ? formatPrice(row.price_monthly_kopecks)
        : "Индивидуально",
  },
  {
    key: "modules",
    header: "Модули",
    render: (row) => row.modules.length,
  },
  {
    key: "is_active",
    header: "Статус",
    render: (row) => (
      <div className="flex gap-2">
        <Badge variant={row.is_active ? "success" : "default"}>
          {row.is_active ? "Активен" : "Неактивен"}
        </Badge>
        {row.is_default && <Badge variant="info">По умолчанию</Badge>}
      </div>
    ),
  },
  {
    key: "sort_order",
    header: "Порядок",
    sortable: true,
  },
];

export default function PlatformPlansPage() {
  const router = useRouter();
  const { data, isLoading } = usePlatformPlans();

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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Тарифные планы</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление тарифами платформы
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.PLATFORM_PLAN_NEW)}>
          <Plus className="mr-1 h-4 w-4" />
          Создать тариф
        </Button>
      </div>

      <Table
        data={data ?? []}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Нет тарифов"
        onRowClick={(row) => router.push(ROUTES.PLATFORM_PLAN_EDIT(row.id))}
      />
    </div>
  );
}
