"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Badge, Table, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformModules } from "@/features/billing";
import { formatPrice, categoryLabels } from "@/features/billing/lib/billingConstants";
import type { PublicModule } from "@/entities/billing";
import type { Column } from "@/shared/ui/Table/Table";

const columns: Column<PublicModule>[] = [
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
    key: "category",
    header: "Категория",
    render: (row) => categoryLabels[row.category] ?? row.category,
  },
  {
    key: "price_monthly_kopecks",
    header: "Цена/мес",
    render: (row) =>
      row.price_monthly_kopecks > 0 ? formatPrice(row.price_monthly_kopecks) : "Бесплатно",
  },
  {
    key: "is_base",
    header: "Тип",
    render: (row) => (
      <Badge variant={row.is_base ? "info" : "default"}>
        {row.is_base ? "Базовый" : "Дополнительный"}
      </Badge>
    ),
  },
  {
    key: "sort_order",
    header: "Порядок",
    sortable: true,
  },
];

export default function PlatformModulesPage() {
  const router = useRouter();
  const { data, isLoading } = usePlatformModules();

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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Модули</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление модулями платформы
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.PLATFORM_MODULE_NEW)}>
          <Plus className="mr-1 h-4 w-4" />
          Создать модуль
        </Button>
      </div>

      <Table
        data={data ?? []}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Нет модулей"
        onRowClick={(row) => router.push(ROUTES.PLATFORM_MODULE_EDIT(row.id))}
      />
    </div>
  );
}
