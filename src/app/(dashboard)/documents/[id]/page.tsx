"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  DocumentForm,
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  usePublishDocument,
  useUnpublishDocument,
} from "@/features/documents";
import { Button, Spinner, StatusBadge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import type { CreateDocumentDto, UpdateDocumentDto } from "@/entities/document";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: document, isLoading, error } = useDocument(id);
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutate: publishDocument, isPending: isPublishing } = usePublishDocument();
  const { mutate: unpublishDocument, isPending: isUnpublishing } = useUnpublishDocument();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    notFound();
  }

  const handleSubmit = (data: CreateDocumentDto | UpdateDocumentDto) => {
    updateDocument({ id, data: data as UpdateDocumentDto });
  };

  const handleDelete = () => {
    deleteDocument(id, {
      onSuccess: () => {
        router.push(ROUTES.DOCUMENTS);
      },
    });
    setDeleteModalOpen(false);
  };

  const getDocumentTitle = (): string => {
    const ruLocale = document.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || document.locales?.[0]?.title || "Без названия";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {getDocumentTitle()}
            </h1>
            <StatusBadge status={document.status} />
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создан: {formatDateTime(document.created_at)} · Обновлён:{" "}
            {formatDateTime(document.updated_at)} · Версия: {document.version}
            {document.document_version && ` · Версия документа: ${document.document_version}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {document.status === "draft" && (
            <Button
              variant="primary"
              onClick={() => publishDocument(id)}
              isLoading={isPublishing}
            >
              Опубликовать
            </Button>
          )}
          {document.status === "published" && (
            <Button
              variant="secondary"
              onClick={() => unpublishDocument(id)}
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
      <DocumentForm
        document={document}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить документ?"
        description={`Вы уверены, что хотите удалить документ "${getDocumentTitle()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

