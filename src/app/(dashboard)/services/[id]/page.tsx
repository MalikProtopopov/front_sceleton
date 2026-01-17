"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { ServiceForm, useService, useUpdateService, useDeleteService, useToggleServicePublished } from "@/features/services";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateServiceDto, UpdateServiceDto } from "@/entities/service";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: service, isLoading, error } = useService(id);
  const { mutate: updateService, isPending: isUpdating } = useUpdateService(id);
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const { mutate: togglePublished, isPending: isToggling } = useToggleServicePublished(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !service) {
    notFound();
  }

  const handleSubmit = (data: CreateServiceDto | UpdateServiceDto) => {
    updateService(data as UpdateServiceDto);
  };

  const handleDelete = () => {
    deleteService(id);
    setDeleteModalOpen(false);
  };

  const handleTogglePublished = () => {
    togglePublished({ isPublished: !service.is_published, version: service.version });
  };

  const getServiceTitle = (): string => {
    const ruLocale = service.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || service.locales?.[0]?.title || "Без названия";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {service.icon && <span className="text-3xl">{service.icon}</span>}
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {getServiceTitle()}
            </h1>
            <Badge variant={service.is_published ? "success" : "secondary"}>
              {service.is_published ? "Опубликовано" : "Черновик"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создана: {formatDateTime(service.created_at)} · Обновлена:{" "}
            {formatDateTime(service.updated_at)} · Версия: {service.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={service.is_published ? "secondary" : "primary"}
            onClick={handleTogglePublished}
            isLoading={isToggling}
          >
            {service.is_published ? "Снять с публикации" : "Опубликовать"}
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      {/* Form */}
      <ServiceForm service={service} onSubmit={handleSubmit} isSubmitting={isUpdating} />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить услугу?"
        description={`Вы уверены, что хотите удалить услугу "${getServiceTitle()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

