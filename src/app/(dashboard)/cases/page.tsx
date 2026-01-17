"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import {
  useCases,
  useDeleteCase,
  usePublishCase,
  useUnpublishCase,
} from "@/features/cases";
import { useServicesList } from "@/features/services";
import { Button, Table, Pagination, StatusBadge, ConfirmModal, Select, Input, BulkActionsToolbar, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import type { Case, CaseFilterParams, CaseStatus } from "@/entities/case";

export default function CasesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CaseFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { data, isLoading } = useCases(filters);
  const { data: servicesData } = useServicesList();
  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase();
  const { mutate: publishCase } = usePublishCase();
  const { mutate: unpublishCase } = useUnpublishCase();

  const handleFiltersChange = (newFilters: Partial<CaseFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
    setSelectedRows([]);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSelectedRows([]);
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.items) {
      setSelectedRows(data.items.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCase) {
      deleteCase(selectedCase.id);
      setDeleteModalOpen(false);
      setSelectedCase(null);
    }
  };

  // Get title from first locale (ru preferred)
  const getCaseTitle = (caseItem: Case): string => {
    const ruLocale = caseItem.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || caseItem.locales?.[0]?.title || "Без названия";
  };

  // Get service names for services
  const serviceOptions = servicesData?.items.map((service) => {
    const ruLocale = service.locales?.find((l) => l.locale === "ru");
    return {
      value: service.id,
      label: ruLocale?.title || service.id,
    };
  }) || [];

  const columns: Column<Case>[] = [
    {
      key: "title",
      header: "Название",
      render: (caseItem) => (
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--color-text-primary)] line-clamp-1">
              {getCaseTitle(caseItem)}
            </p>
            {caseItem.is_featured && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          {caseItem.client_name && (
            <p className="text-sm text-[var(--color-text-muted)]">{caseItem.client_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "120px",
      render: (caseItem) => <StatusBadge status={caseItem.status} />,
    },
    {
      key: "project_year",
      header: "Год",
      width: "80px",
      render: (caseItem) => (
        <span className="text-[var(--color-text-secondary)]">
          {caseItem.project_year || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Создан",
      width: "140px",
      render: (caseItem) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(caseItem.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "140px",
      render: (caseItem) => (
        <div className="flex items-center justify-end gap-1">
          {caseItem.status === "draft" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                publishCase(caseItem.id);
              }}
              className="text-[var(--color-success)]"
            >
              Опубликовать
            </Button>
          ) : caseItem.status === "published" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                unpublishCase(caseItem.id);
              }}
            >
              Снять
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.CASE_EDIT(caseItem.id));
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(caseItem);
            }}
            className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Кейсы</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление портфолио проектов
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.CASE_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать кейс
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск"
          placeholder="Поиск..."
          value={filters.search || ""}
          onChange={(e) => handleFiltersChange({ search: e.target.value || undefined })}
          className="w-64"
        />
        <Select
          label="Статус"
          value={filters.status || ""}
          onChange={(e) => handleFiltersChange({ status: (e.target.value || undefined) as CaseStatus | undefined })}
          options={[
            { value: "", label: "Все статусы" },
            { value: "draft", label: "Черновик" },
            { value: "published", label: "Опубликовано" },
            { value: "archived", label: "В архиве" },
          ]}
          className="w-48"
        />
        <Select
          label="Выделенные"
          value={filters.featured === undefined ? "" : String(filters.featured)}
          onChange={(e) => handleFiltersChange({ featured: e.target.value === "" ? undefined : e.target.value === "true" })}
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "Выделенные" },
            { value: "false", label: "Обычные" },
          ]}
          className="w-48"
        />
        {serviceOptions.length > 0 && (
          <Select
            label="Услуга"
            value={filters.serviceId || ""}
            onChange={(e) => handleFiltersChange({ serviceId: e.target.value || undefined })}
            options={[{ value: "", label: "Все услуги" }, ...serviceOptions]}
            className="w-48"
          />
        )}
      </FilterBar>

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedIds={selectedRows}
        resourceType="cases"
        onClearSelection={() => setSelectedRows([])}
        availableActions={["publish", "unpublish", "archive", "delete"]}
      />

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(caseItem) => caseItem.id}
        isLoading={isLoading}
        emptyMessage="Кейсы не найдены"
        onRowClick={(caseItem) => router.push(ROUTES.CASE_EDIT(caseItem.id))}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
      />

      {/* Pagination */}
      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить кейс?"
        description={`Вы уверены, что хотите удалить кейс "${selectedCase ? getCaseTitle(selectedCase) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

