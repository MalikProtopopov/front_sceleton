"use client";

import { Badge, Table } from "@/shared/ui";
import { formatDate } from "@/shared/lib";
import type { TenantModule } from "@/entities/billing";
import { sourceLabels } from "../lib/billingConstants";
import type { Column } from "@/shared/ui/Table/Table";

const sourceBadgeVariant: Record<string, "default" | "primary" | "secondary" | "info"> = {
  plan: "primary",
  addon: "secondary",
  bundle: "info",
  manual: "default",
};

const columns: Column<TenantModule>[] = [
  {
    key: "module_name_ru",
    header: "Модуль",
    render: (row) => (
      <span className="font-medium">{row.module_name_ru}</span>
    ),
  },
  {
    key: "source",
    header: "Источник",
    render: (row) => (
      <Badge variant={sourceBadgeVariant[row.source] ?? "default"}>
        {sourceLabels[row.source] ?? row.source}
      </Badge>
    ),
  },
  {
    key: "enabled",
    header: "Статус",
    render: (row) => (
      <span className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            row.enabled ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
          }`}
        />
        {row.enabled ? "Активен" : "Неактивен"}
      </span>
    ),
  },
  {
    key: "activated_at",
    header: "Подключён",
    render: (row) => formatDate(row.activated_at),
  },
  {
    key: "expires_at",
    header: "Действует до",
    render: (row) => (row.expires_at ? formatDate(row.expires_at) : "Бессрочно"),
  },
];

interface ActiveModulesListProps {
  modules: TenantModule[];
  isLoading?: boolean;
}

export function ActiveModulesList({ modules, isLoading }: ActiveModulesListProps) {
  return (
    <Table
      data={modules}
      columns={columns}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="Нет подключённых модулей"
    />
  );
}
