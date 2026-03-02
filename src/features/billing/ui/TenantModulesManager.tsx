"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, Button, Badge, Select, Table } from "@/shared/ui";
import { formatDate } from "@/shared/lib";
import type { TenantModule, PublicModule, ModuleSource } from "@/entities/billing";
import { sourceLabels } from "../lib/billingConstants";
import type { Column } from "@/shared/ui/Table/Table";

interface TenantModulesManagerProps {
  modules: TenantModule[];
  allModules: PublicModule[];
  isLoading?: boolean;
  onAdd: (moduleSlug: string, source: ModuleSource) => void;
  onRemove: (moduleSlug: string) => void;
  isAdding?: boolean;
  isRemoving?: boolean;
}

const sourceBadgeVariant: Record<string, "default" | "primary" | "secondary" | "info"> = {
  plan: "primary",
  addon: "secondary",
  bundle: "info",
  manual: "default",
};

export function TenantModulesManager({
  modules,
  allModules,
  isLoading,
  onAdd,
  onRemove,
  isAdding,
  isRemoving,
}: TenantModulesManagerProps) {
  const [selectedSlug, setSelectedSlug] = useState("");

  const activeModuleSlugs = new Set(modules.map((m) => m.module_slug));
  const availableModules = allModules.filter((m) => !activeModuleSlugs.has(m.slug));

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
      key: "actions",
      header: "",
      width: "80px",
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(row.module_slug);
          }}
          disabled={isRemoving}
          title="Удалить модуль"
        >
          <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {availableModules.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-end gap-3">
              <Select
                label="Добавить модуль"
                options={availableModules.map((m) => ({
                  value: m.slug,
                  label: m.name_ru,
                }))}
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                placeholder="Выберите модуль..."
              />
              <Button
                onClick={() => {
                  if (selectedSlug) {
                    onAdd(selectedSlug, "manual");
                    setSelectedSlug("");
                  }
                }}
                disabled={!selectedSlug || isAdding}
                isLoading={isAdding}
              >
                <Plus className="mr-1 h-4 w-4" />
                Добавить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Table
        data={modules}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Нет подключённых модулей"
      />
    </div>
  );
}
