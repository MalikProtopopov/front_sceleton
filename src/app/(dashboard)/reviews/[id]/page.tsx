"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Star, User } from "lucide-react";
import { ReviewForm, useReview, useUpdateReview, useDeleteReview, useApproveReview, useRejectReview, useToggleReviewFeatured } from "@/features/reviews";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateReviewDto, UpdateReviewDto, ReviewStatus } from "@/entities/review";

const STATUS_BADGES: Record<ReviewStatus, { variant: "secondary" | "success" | "warning" | "error"; label: string }> = {
  pending: { variant: "warning", label: "На модерации" },
  approved: { variant: "success", label: "Одобрен" },
  rejected: { variant: "error", label: "Отклонен" },
};

export default function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: review, isLoading, error } = useReview(id);
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview(id);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: approveReview, isPending: isApproving } = useApproveReview();
  const { mutate: rejectReview, isPending: isRejecting } = useRejectReview();
  const { mutate: toggleFeatured, isPending: isTogglingFeatured } = useToggleReviewFeatured(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !review) {
    notFound();
  }

  const handleSubmit = (data: CreateReviewDto | UpdateReviewDto) => {
    updateReview(data as UpdateReviewDto);
  };

  const handleDelete = () => {
    deleteReview(id);
    setDeleteModalOpen(false);
  };

  const handleToggleFeatured = () => {
    toggleFeatured({ isFeatured: !review.is_featured, version: review.version });
  };

  const badge = STATUS_BADGES[review.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {review.author_avatar_url ? (
            <img
              src={review.author_avatar_url}
              alt={review.author_name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
              <User className="h-8 w-8 text-[var(--color-text-muted)]" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {review.author_name}
              </h1>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {review.is_featured && (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Создан: {formatDateTime(review.created_at)} · Обновлен:{" "}
              {formatDateTime(review.updated_at)} · Версия: {review.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.status === "pending" && (
            <>
              <Button
                variant="primary"
                onClick={() => approveReview(id)}
                isLoading={isApproving}
              >
                Одобрить
              </Button>
              <Button
                variant="secondary"
                onClick={() => rejectReview(id)}
                isLoading={isRejecting}
              >
                Отклонить
              </Button>
            </>
          )}
          {review.status === "approved" && (
            <Button
              variant={review.is_featured ? "secondary" : "primary"}
              onClick={handleToggleFeatured}
              isLoading={isTogglingFeatured}
              leftIcon={<Star className={`h-4 w-4 ${review.is_featured ? "fill-current" : ""}`} />}
            >
              {review.is_featured ? "Убрать из избранного" : "В избранное"}
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Удалить
          </Button>
        </div>
      </div>

      {/* Form */}
      <ReviewForm review={review} onSubmit={handleSubmit} isSubmitting={isUpdating} />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить отзыв?"
        description={`Вы уверены, что хотите удалить отзыв от "${review.author_name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

