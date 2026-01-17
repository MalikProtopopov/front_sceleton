"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, User, Search, Download } from "lucide-react";
import { useEmployeesList, useDeleteEmployee } from "@/features/employees";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, Input, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate, downloadExport } from "@/shared/lib";
import type { Employee, EmployeeFilterParams } from "@/entities/employee";

export default function TeamPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<EmployeeFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useEmployeesList(filters);
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();

  const handleFiltersChange = (newFilters: Partial<EmployeeFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport("team", "csv");
    } finally {
      setIsExporting(false);
    }
  };

  const getEmployeeName = (employee: Employee): string => {
    const ruLocale = employee.locales?.find((l) => l.locale === "ru");
    const locale = ruLocale || employee.locales?.[0];
    if (!locale) return "Без имени";
    return `${locale.first_name} ${locale.last_name}`;
  };

  const getEmployeePosition = (employee: Employee): string => {
    const ruLocale = employee.locales?.find((l) => l.locale === "ru");
    return ruLocale?.position || employee.locales?.[0]?.position || "";
  };

  const columns: Column<Employee>[] = [
    {
      key: "photo",
      header: "",
      width: "60px",
      render: (employee) => (
        employee.photo_url ? (
          <img
            src={employee.photo_url}
            alt={getEmployeeName(employee)}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
            <User className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        )
      ),
    },
    {
      key: "name",
      header: "ФИО",
      render: (employee) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">
            {getEmployeeName(employee)}
          </p>
          {employee.locales?.[0]?.slug && (
            <p className="text-sm text-[var(--color-text-muted)]">/{employee.locales[0].slug}</p>
          )}
        </div>
      ),
    },
    {
      key: "position",
      header: "Должность",
      render: (employee) => (
        <span className="text-[var(--color-text-secondary)]">
          {getEmployeePosition(employee) || "—"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (employee) => (
        <span className="text-[var(--color-text-secondary)]">
          {employee.email || "—"}
        </span>
      ),
    },
    {
      key: "is_published",
      header: "Статус",
      width: "120px",
      render: (employee) => (
        <Badge variant={employee.is_published ? "success" : "secondary"}>
          {employee.is_published ? "Опубликовано" : "Черновик"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "100px",
      render: (employee) => (
        <span className="text-[var(--color-text-secondary)]">{employee.sort_order}</span>
      ),
    },
    {
      key: "created_at",
      header: "Создан",
      width: "120px",
      render: (employee) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(employee.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (employee) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.TEAM_EDIT(employee.id));
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
              handleDeleteClick(employee);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Команда</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление сотрудниками компании
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            isLoading={isExporting}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Экспорт CSV
          </Button>
          <Button
            onClick={() => router.push(ROUTES.TEAM_NEW)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Добавить сотрудника
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск"
          type="search"
          placeholder="Поиск по имени, должности..."
          value={filters.search || ""}
          onChange={(e) => handleFiltersChange({ search: e.target.value || undefined })}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-64"
        />
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
        keyExtractor={(employee) => employee.id}
        isLoading={isLoading}
        emptyMessage="Сотрудники не найдены"
        onRowClick={(employee) => router.push(ROUTES.TEAM_EDIT(employee.id))}
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
        title="Удалить сотрудника?"
        description={`Вы уверены, что хотите удалить сотрудника "${selectedEmployee ? getEmployeeName(selectedEmployee) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
