"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  ArticleForm,
  useArticle,
  useUpdateArticle,
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
  useTopics,
} from "@/features/articles";
import { Button, Spinner, StatusBadge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateArticleDto, UpdateArticleDto } from "@/entities/article";
import { useState } from "react";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: article, isLoading, error } = useArticle(id);
  const { data: topicsData } = useTopics();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle(id);
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();
  const { mutate: publishArticle, isPending: isPublishing } = usePublishArticle();
  const { mutate: unpublishArticle, isPending: isUnpublishing } = useUnpublishArticle();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  const handleSubmit = (data: CreateArticleDto | UpdateArticleDto) => {
    updateArticle(data as UpdateArticleDto);
  };

  const handleDelete = () => {
    deleteArticle(id);
    setDeleteModalOpen(false);
  };

  const getArticleTitle = (): string => {
    const ruLocale = article.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || article.locales?.[0]?.title || "Без названия";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {getArticleTitle()}
            </h1>
            <StatusBadge status={article.status} />
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создана: {formatDateTime(article.created_at)} · Обновлена:{" "}
            {formatDateTime(article.updated_at)} · Версия: {article.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {article.status === "draft" && (
            <Button
              variant="primary"
              onClick={() => publishArticle(id)}
              isLoading={isPublishing}
            >
              Опубликовать
            </Button>
          )}
          {article.status === "published" && (
            <Button
              variant="secondary"
              onClick={() => unpublishArticle(id)}
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
      <ArticleForm
        article={article}
        topics={topicsData?.items || []}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить статью?"
        description={`Вы уверены, что хотите удалить статью "${getArticleTitle()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

