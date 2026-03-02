"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Badge, Table, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformBundles } from "@/features/billing";
import { formatPrice } from "@/features/billing/lib/billingConstants";
import type { PublicBundle } from "@/entities/billing";
import type { Column } from "@/shared/ui/Table/Table";

const columns: Column<PublicBundle>[] = [
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
    render: (row) => formatPrice(row.price_monthly_kopecks),
  },
  {
    key: "discount_percent",
    header: "Скидка",
    render: (row) =>
      row.discount_percent > 0 ? (
        <Badge variant="success">-{row.discount_percent}%</Badge>
      ) : (
        "—"
      ),
  },
  {
    key: "modules",
    header: "Модули",
    render: (row) => row.modules.map((m) => m.name_ru).join(", "),
  },
  {
    key: "is_active",
    header: "Статус",
    render: (row) => (
      <Badge variant={row.is_active ? "success" : "default"}>
        {row.is_active ? "Активен" : "Неактивен"}
      </Badge>
    ),
  },
  {
    key: "sort_order",
    header: "Порядок",
    sortable: true,
  },
];

export default function PlatformBundlesPage() {
  const router = useRouter();
  const { data, isLoading } = usePlatformBundles();

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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Пакеты модулей</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление тематическими пакетами
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.PLATFORM_BUNDLE_NEW)}>
          <Plus className="mr-1 h-4 w-4" />
          Создать пакет
        </Button>
      </div>

      <Table
        data={data ?? []}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Нет пакетов"
        onRowClick={(row) => router.push(ROUTES.PLATFORM_BUNDLE_EDIT(row.id))}
      />
    </div>
  );
}
