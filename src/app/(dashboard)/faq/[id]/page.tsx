"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { FAQForm, useFAQ, useUpdateFAQ, useDeleteFAQ, useToggleFAQPublished } from "@/features/faq";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateFAQDto, UpdateFAQDto } from "@/entities/faq";

export default function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: faq, isLoading, error } = useFAQ(id);
  const { mutate: updateFAQ, isPending: isUpdating } = useUpdateFAQ(id);
  const { mutate: deleteFAQ, isPending: isDeleting } = useDeleteFAQ();
  const { mutate: togglePublished, isPending: isToggling } = useToggleFAQPublished(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !faq) {
    notFound();
  }

  const handleSubmit = (data: CreateFAQDto | UpdateFAQDto) => {
    updateFAQ(data as UpdateFAQDto);
  };

  const handleDelete = () => {
    deleteFAQ(id);
    setDeleteModalOpen(false);
  };

  const handleTogglePublished = () => {
    togglePublished({ isPublished: !faq.is_published, version: faq.version });
  };

  const getFAQQuestion = (): string => {
    const ruLocale = faq.locales?.find((l) => l.locale === "ru");
    return ruLocale?.question || faq.locales?.[0]?.question || "Без вопроса";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] line-clamp-1 max-w-2xl">
              {getFAQQuestion()}
            </h1>
            <Badge variant={faq.is_published ? "success" : "secondary"}>
              {faq.is_published ? "Опубликован" : "Черновик"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создан: {formatDateTime(faq.created_at)} · Обновлен:{" "}
            {formatDateTime(faq.updated_at)} · Версия: {faq.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={faq.is_published ? "secondary" : "primary"}
            onClick={handleTogglePublished}
            isLoading={isToggling}
          >
            {faq.is_published ? "Снять с публикации" : "Опубликовать"}
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      {/* Form */}
      <FAQForm faq={faq} onSubmit={handleSubmit} isSubmitting={isUpdating} />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить FAQ?"
        description={`Вы уверены, что хотите удалить FAQ "${getFAQQuestion()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

