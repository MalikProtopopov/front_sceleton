"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Star, Check, X, User, Briefcase } from "lucide-react";
import { useReviewsList, useDeleteReview, useApproveReview, useRejectReview } from "@/features/reviews";
import { useCases } from "@/features/cases";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, BulkActionsToolbar, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate, getMediaUrl } from "@/shared/lib";
import type { Review, ReviewFilterParams, ReviewStatus } from "@/entities/review";

const STATUS_BADGES: Record<ReviewStatus, { variant: "secondary" | "success" | "warning" | "error"; label: string }> = {
  pending: { variant: "warning", label: "На модерации" },
  approved: { variant: "success", label: "Одобрен" },
  rejected: { variant: "error", label: "Отклонен" },
};

export default function ReviewsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ReviewFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { data, isLoading } = useReviewsList(filters);
  const { data: casesData } = useCases({ pageSize: 100 });
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: approveReview, isPending: isApproving } = useApproveReview();
  const { mutate: rejectReview, isPending: isRejecting } = useRejectReview();

  // Generate case options for filter
  const caseOptions = useMemo(() => {
    if (!casesData?.items) return [];
    return casesData.items.map((caseItem) => {
      const ruLocale = caseItem.locales?.find((l) => l.locale === "ru");
      const title = ruLocale?.title || caseItem.locales?.[0]?.title || "Без названия";
      const slug = ruLocale?.slug || caseItem.locales?.[0]?.slug || "";
      return { value: slug, label: title };
    });
  }, [casesData?.items]);

  const handleFiltersChange = (newFilters: Partial<ReviewFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
    setSelectedRows([]);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSelectedRows([]);
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.items) {
      setSelectedRows(data.items.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReview) {
      deleteReview(selectedReview.id);
      setDeleteModalOpen(false);
      setSelectedReview(null);
    }
  };

  const getReviewContent = (review: Review): string => {
    const ruLocale = review.locales?.find((l) => l.locale === "ru");
    return ruLocale?.content || review.locales?.[0]?.content || "Без текста";
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-[var(--color-text-muted)]">—</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--color-text-muted)]"}`}
          />
        ))}
      </div>
    );
  };

  const columns: Column<Review>[] = [
    {
      key: "avatar",
      header: "",
      width: "60px",
      render: (review) => (
        review.author_avatar_url ? (
          <img
            src={review.author_avatar_url}
            alt={review.author_name}
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
      key: "author",
      header: "Автор",
      render: (review) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">
            {review.author_name}
          </p>
          {review.author_position && (
            <p className="text-sm text-[var(--color-text-muted)]">{review.author_position}</p>
          )}
        </div>
      ),
    },
    {
      key: "content",
      header: "Отзыв",
      render: (review) => (
        <p className="max-w-md text-[var(--color-text-secondary)] line-clamp-2">
          {getReviewContent(review)}
        </p>
      ),
    },
    {
      key: "rating",
      header: "Рейтинг",
      width: "120px",
      render: (review) => renderRating(review.rating),
    },
    {
      key: "status",
      header: "Статус",
      width: "140px",
      render: (review) => {
        const badge = STATUS_BADGES[review.status];
        return (
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {review.is_featured && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
        );
      },
    },
    {
      key: "case",
      header: "Кейс",
      width: "180px",
      render: (review) => {
        if (!review.case) {
          return <span className="text-[var(--color-text-muted)]">—</span>;
        }
        return (
          <Link
            href={ROUTES.CASE_EDIT(review.case.id)}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-[var(--color-accent-primary)] transition-colors"
          >
            {review.case.cover_image_url ? (
              <img
                src={getMediaUrl(review.case.cover_image_url)}
                alt={review.case.title}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-bg-secondary)] flex-shrink-0">
                <Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />
              </div>
            )}
            <span className="text-sm line-clamp-1">{review.case.title}</span>
          </Link>
        );
      },
    },
    {
      key: "review_date",
      header: "Дата",
      width: "100px",
      render: (review) => (
        <span className="text-[var(--color-text-secondary)]">
          {review.review_date ? formatDate(review.review_date) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "160px",
      render: (review) => (
        <div className="flex items-center justify-end gap-1">
          {review.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  approveReview(review.id);
                }}
                className="h-8 w-8 text-[var(--color-success)] hover:text-[var(--color-success)]"
                title="Одобрить"
                disabled={isApproving}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  rejectReview(review.id);
                }}
                className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
                title="Отклонить"
                disabled={isRejecting}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.REVIEW_EDIT(review.id));
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
              handleDeleteClick(review);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Отзывы</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление отзывами клиентов
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.REVIEW_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить отзыв
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Select
          label="Статус"
          value={filters.status || ""}
          onChange={(e) => handleFiltersChange({ status: (e.target.value || undefined) as ReviewStatus | undefined })}
          options={[
            { value: "", label: "Все статусы" },
            { value: "pending", label: "На модерации" },
            { value: "approved", label: "Одобрен" },
            { value: "rejected", label: "Отклонен" },
          ]}
          className="w-48"
        />
        <Select
          label="Тип"
          value={filters.featured === undefined ? "" : String(filters.featured)}
          onChange={(e) => 
            handleFiltersChange({ 
              featured: e.target.value === "" ? undefined : e.target.value === "true" 
            })
          }
          options={[
            { value: "", label: "Все отзывы" },
            { value: "true", label: "Только избранные" },
          ]}
          className="w-48"
        />
        {caseOptions.length > 0 && (
          <Select
            label="Кейс"
            value={filters.caseSlug || ""}
            onChange={(e) => handleFiltersChange({ caseSlug: e.target.value || undefined })}
            options={[
              { value: "", label: "Все кейсы" },
              ...caseOptions,
            ]}
            className="w-56"
          />
        )}
      </FilterBar>

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedIds={selectedRows}
        resourceType="reviews"
        onClearSelection={() => setSelectedRows([])}
        availableActions={["delete"]}
      />

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(review) => review.id}
        isLoading={isLoading}
        emptyMessage="Отзывы не найдены"
        onRowClick={(review) => router.push(ROUTES.REVIEW_EDIT(review.id))}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
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
        title="Удалить отзыв?"
        description={`Вы уверены, что хотите удалить отзыв от "${selectedReview?.author_name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
