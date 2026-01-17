"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useServicesList, useDeleteService } from "@/features/services";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import type { Service, ServiceFilterParams } from "@/entities/service";

export default function ServicesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ServiceFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data, isLoading } = useServicesList(filters);
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const handleFiltersChange = (newFilters: Partial<ServiceFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedService) {
      deleteService(selectedService.id);
      setDeleteModalOpen(false);
      setSelectedService(null);
    }
  };

  const getServiceTitle = (service: Service): string => {
    const ruLocale = service.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || service.locales?.[0]?.title || "Без названия";
  };

  const columns: Column<Service>[] = [
    {
      key: "icon",
      header: "",
      width: "60px",
      render: (service) => (
        <span className="text-2xl">{service.icon || "📋"}</span>
      ),
    },
    {
      key: "title",
      header: "Название",
      render: (service) => (
        <div className="max-w-md">
          <p className="font-medium text-[var(--color-text-primary)]">
            {getServiceTitle(service)}
          </p>
          {service.locales?.[0]?.slug && (
            <p className="text-sm text-[var(--color-text-muted)]">/{service.locales[0].slug}</p>
          )}
        </div>
      ),
    },
    {
      key: "is_published",
      header: "Статус",
      width: "120px",
      render: (service) => (
        <Badge variant={service.is_published ? "success" : "secondary"}>
          {service.is_published ? "Опубликовано" : "Черновик"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "100px",
      render: (service) => (
        <span className="text-[var(--color-text-secondary)]">{service.sort_order}</span>
      ),
    },
    {
      key: "created_at",
      header: "Создана",
      width: "120px",
      render: (service) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(service.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (service) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.SERVICE_EDIT(service.id));
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
              handleDeleteClick(service);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Услуги</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление услугами компании
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.SERVICE_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать услугу
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Select
          label="Статус"
          value={filters.isPublished === undefined ? "" : String(filters.isPublished)}
          onChange={(e) => 
            handleFiltersChange({ 
              isPublished: e.target.value === "" ? undefined : e.target.value === "true" 
            })
          }
          options={[
            { value: "", label: "Все статусы" },
            { value: "true", label: "Опубликовано" },
            { value: "false", label: "Черновик" },
          ]}
          className="w-48"
        />
      </FilterBar>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(service) => service.id}
        isLoading={isLoading}
        emptyMessage="Услуги не найдены"
        onRowClick={(service) => router.push(ROUTES.SERVICE_EDIT(service.id))}
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
        title="Удалить услугу?"
        description={`Вы уверены, что хотите удалить услугу "${selectedService ? getServiceTitle(selectedService) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
