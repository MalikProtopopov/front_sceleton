"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { usePracticeArea, useUpdatePracticeArea, useDeletePracticeArea, PracticeAreaForm } from "@/features/company";
import { Button, Spinner, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { UpdatePracticeAreaDto } from "@/entities/company";

export default function EditPracticeAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: item, isLoading, error } = usePracticeArea(id);
  const { mutate: update, isPending: isUpdating } = useUpdatePracticeArea(id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeletePracticeArea();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !item) {
    notFound();
  }

  const getTitle = () =>
    item.locales?.find((l) => l.locale === "ru")?.title || item.locales?.[0]?.title || "Направление";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{getTitle()}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создано: {formatDateTime(item.created_at)} · Версия: {item.version}
          </p>
        </div>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Удалить
        </Button>
      </div>

      <PracticeAreaForm 
        practiceArea={item} 
        onSubmit={(data) => update(data as UpdatePracticeAreaDto)} 
        isSubmitting={isUpdating} 
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteItem(id)}
        title="Удалить направление?"
        description={`Вы уверены, что хотите удалить "${getTitle()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
