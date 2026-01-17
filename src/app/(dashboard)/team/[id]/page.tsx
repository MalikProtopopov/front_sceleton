"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { EmployeeForm, useEmployee, useUpdateEmployee, useDeleteEmployee, useToggleEmployeePublished } from "@/features/employees";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateEmployeeDto, UpdateEmployeeDto } from "@/entities/employee";

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: employee, isLoading, error } = useEmployee(id);
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee(id);
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  const { mutate: togglePublished, isPending: isToggling } = useToggleEmployeePublished(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !employee) {
    notFound();
  }

  const handleSubmit = (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    updateEmployee(data as UpdateEmployeeDto);
  };

  const handleDelete = () => {
    deleteEmployee(id);
    setDeleteModalOpen(false);
  };

  const handleTogglePublished = () => {
    togglePublished({ isPublished: !employee.is_published, version: employee.version });
  };

  const getEmployeeName = (): string => {
    const ruLocale = employee.locales?.find((l) => l.locale === "ru");
    const locale = ruLocale || employee.locales?.[0];
    if (!locale) return "Без имени";
    return `${locale.first_name} ${locale.last_name}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {employee.photo_url && (
            <img
              src={employee.photo_url}
              alt={getEmployeeName()}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {getEmployeeName()}
              </h1>
              <Badge variant={employee.is_published ? "success" : "secondary"}>
                {employee.is_published ? "Опубликовано" : "Черновик"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Создан: {formatDateTime(employee.created_at)} · Обновлен:{" "}
              {formatDateTime(employee.updated_at)} · Версия: {employee.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={employee.is_published ? "secondary" : "primary"}
            onClick={handleTogglePublished}
            isLoading={isToggling}
          >
            {employee.is_published ? "Снять с публикации" : "Опубликовать"}
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      {/* Form */}
      <EmployeeForm employee={employee} onSubmit={handleSubmit} isSubmitting={isUpdating} />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить сотрудника?"
        description={`Вы уверены, что хотите удалить сотрудника "${getEmployeeName()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

