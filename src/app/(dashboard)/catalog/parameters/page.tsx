"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useParametersList, useDeleteParameter } from "@/features/catalog";
import {
  Button,
  Table,
  Pagination,
  Badge,
  ConfirmModal,
  Select,
  Input,
  FilterBar,
  type Column,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Parameter, ParameterFilterParams } from "@/entities/product";
import { PARAMETER_VALUE_TYPE_LABELS, PARAMETER_SCOPE_LABELS } from "@/entities/product";

export default function ParametersPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const [filters, setFilters] = useState<ParameterFilterParams>({
    page: 1,
    page_size: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useParametersList(filters);
  const { mutate: deleteParameter, isPending: isDeleting } = useDeleteParameter();

  const handleFiltersChange = (newFilters: Partial<ParameterFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const handleSearch = () => {
    handleFiltersChange({ search: search || undefined });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, page_size: 20 });
    setSearch("");
  };

  const handleDeleteClick = (param: Parameter) => {
    setSelectedParam(param);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedParam) {
      deleteParameter(selectedParam.id);
      setDeleteModalOpen(false);
      setSelectedParam(null);
    }
  };

  const columns: Column<Parameter>[] = [
    {
      key: "name",
      header: "Название",
      render: (param) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{param.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{param.slug}</p>
        </div>
      ),
    },
    {
      key: "value_type",
      header: "Тип",
      width: "110px",
      render: (param) => (
        <Badge variant="outline">{PARAMETER_VALUE_TYPE_LABELS[param.value_type]}</Badge>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      width: "120px",
      render: (param) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {PARAMETER_SCOPE_LABELS[param.scope]}
        </span>
      ),
    },
    {
      key: "is_filterable",
      header: "Фильтр",
      width: "80px",
      render: (param) => (
        <span className={`text-sm ${param.is_filterable ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}`}>
          {param.is_filterable ? "Да" : "—"}
        </span>
      ),
    },
    {
      key: "values_count",
      header: "Значений",
      width: "90px",
      render: (param) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {param.value_type === "enum" ? param.values?.length || 0 : "—"}
        </span>
      ),
    },
    {
      key: "categories_count",
      header: "Категорий",
      width: "100px",
      render: (param) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {param.category_ids?.length || 0}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "100px",
      render: (param) => (
        <Badge variant={param.is_active ? "success" : "secondary"}>
          {param.is_active ? "Активен" : "Скрыт"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (param) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.PARAMETER_EDIT(param.id));
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {can("catalog", "delete") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(param);
              }}
              className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Параметры</h1>
          <p className="text-[var(--color-text-secondary)]">
            Словарь характеристик товаров
          </p>
        </div>
        {can("catalog", "create") && (
          <Button
            onClick={() => router.push(ROUTES.PARAMETER_NEW)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать параметр
          </Button>
        )}
      </div>

      <FilterBar onReset={handleResetFilters}>
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearch}
          className="w-64"
        />
        <Select
          value={filters.valueType || ""}
          onChange={(e) =>
            handleFiltersChange({
              valueType: (e.target.value || undefined) as ParameterFilterParams["valueType"],
            })
          }
          options={[
            { value: "", label: "Все типы" },
            ...Object.entries(PARAMETER_VALUE_TYPE_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
          className="w-40"
        />
        <Select
          value={filters.scope || ""}
          onChange={(e) =>
            handleFiltersChange({
              scope: (e.target.value || undefined) as ParameterFilterParams["scope"],
            })
          }
          options={[
            { value: "", label: "Все scope" },
            ...Object.entries(PARAMETER_SCOPE_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
          className="w-40"
        />
      </FilterBar>

      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(param) => param.id}
        isLoading={isLoading}
        emptyMessage="Параметры не найдены"
        onRowClick={(param) => router.push(ROUTES.PARAMETER_EDIT(param.id))}
      />

      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.page_size || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(page_size) => handleFiltersChange({ page_size, page: 1 })}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Деактивировать параметр?"
        description={`Вы уверены, что хотите деактивировать параметр "${selectedParam?.name}"? Параметр будет скрыт из фильтров.`}
        confirmText="Деактивировать"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
