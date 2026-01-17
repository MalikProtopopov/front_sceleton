"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import {
  CaseForm,
  useCase,
  useUpdateCase,
  useDeleteCase,
  usePublishCase,
  useUnpublishCase,
} from "@/features/cases";
import { useServicesList } from "@/features/services";
import { Button, Spinner, StatusBadge, ConfirmModal, Badge } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateCaseDto, UpdateCaseDto } from "@/entities/case";

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: caseItem, isLoading, error } = useCase(id);
  const { data: servicesData } = useServicesList();
  const { mutate: updateCase, isPending: isUpdating } = useUpdateCase(id);
  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase();
  const { mutate: publishCase, isPending: isPublishing } = usePublishCase();
  const { mutate: unpublishCase, isPending: isUnpublishing } = useUnpublishCase();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !caseItem) {
    notFound();
  }

  const handleSubmit = (data: CreateCaseDto | UpdateCaseDto) => {
    updateCase(data as UpdateCaseDto);
  };

  const handleDelete = () => {
    deleteCase(id);
    setDeleteModalOpen(false);
  };

  const getCaseTitle = (): string => {
    const ruLocale = caseItem.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || caseItem.locales?.[0]?.title || "Без названия";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {getCaseTitle()}
            </h1>
            <StatusBadge status={caseItem.status} />
            {caseItem.is_featured && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Выделенный
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создан: {formatDateTime(caseItem.created_at)} · Обновлен:{" "}
            {formatDateTime(caseItem.updated_at)} · Версия: {caseItem.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {caseItem.status === "draft" && (
            <Button
              variant="primary"
              onClick={() => publishCase(id)}
              isLoading={isPublishing}
            >
              Опубликовать
            </Button>
          )}
          {caseItem.status === "published" && (
            <Button
              variant="secondary"
              onClick={() => unpublishCase(id)}
              isLoading={isUnpublishing}
            >
              Снять с публикации
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      {/* Form */}
      <CaseForm
        caseItem={caseItem}
        services={servicesData?.items || []}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить кейс?"
        description={`Вы уверены, что хотите удалить кейс "${getCaseTitle()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

