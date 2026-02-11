"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Search, ArrowUpDown } from "lucide-react";
import { useTenantsList, TenantCard } from "@/features/tenants";
import { Button, Pagination, Select, FilterBar, Spinner, Input } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { TenantListParams } from "@/entities/tenant";

export default function TenantsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<TenantListParams>({
    page: 1,
    pageSize: 12,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useTenantsList(filters);

  const handleFiltersChange = (newFilters: Partial<TenantListParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      handleFiltersChange({ search: value || undefined });
    }, 300);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 12, sort_by: "created_at", sort_order: "desc" });
    setSearchInput("");
  };

  const toggleSortOrder = () => {
    handleFiltersChange({
      sort_order: filters.sort_order === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Проекты</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление проектами платформы
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.TENANT_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать проект
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          placeholder="Поиск по названию..."
          value={searchInput}
          onChange={handleSearchChange}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-64"
        />
        <Select
          label="Статус"
          value={filters.is_active === undefined ? "" : String(filters.is_active)}
          onChange={(e) =>
            handleFiltersChange({
              is_active: e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
          options={[
            { value: "", label: "Все статусы" },
            { value: "true", label: "Активные" },
            { value: "false", label: "Неактивные" },
          ]}
          className="w-48"
        />
        <Select
          label="Сортировка"
          value={filters.sort_by || "created_at"}
          onChange={(e) =>
            handleFiltersChange({
              sort_by: e.target.value as "name" | "created_at",
            })
          }
          options={[
            { value: "created_at", label: "По дате создания" },
            { value: "name", label: "По названию" },
          ]}
          className="w-52"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSortOrder}
          className="mt-6 shrink-0"
          title={filters.sort_order === "asc" ? "По возрастанию" : "По убыванию"}
        >
          <ArrowUpDown className="h-4 w-4" />
          {filters.sort_order === "asc" ? "А→Я" : "Я→А"}
        </Button>
      </FilterBar>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <Building2 className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
          <h3 className="mb-2 text-lg font-medium text-[var(--color-text-primary)]">
            Проекты не найдены
          </h3>
          <p className="mb-4 text-[var(--color-text-muted)]">
            {searchInput
              ? "Попробуйте изменить параметры поиска"
              : "Создайте первый проект для начала работы"}
          </p>
          {!searchInput && (
            <Button onClick={() => router.push(ROUTES.TENANT_NEW)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать проект
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Grid of tenant cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onClick={() => router.push(ROUTES.TENANT_DETAIL(tenant.id))}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total > filters.pageSize! && (
            <Pagination
              page={filters.page || 1}
              pageSize={filters.pageSize || 12}
              total={data.total}
              onPageChange={(page) => handleFiltersChange({ page })}
              showPageSize={false}
            />
          )}
        </>
      )}
    </div>
  );
}
