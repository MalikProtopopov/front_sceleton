"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Tags } from "lucide-react";
import {
  useArticles,
  useDeleteArticle,
  usePublishArticle,
  useUnpublishArticle,
  ArticleFilters,
} from "@/features/articles";
import { TopicsSidebar } from "@/features/topics";
import { Button, Table, Pagination, StatusBadge, ConfirmModal, BulkActionsToolbar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import type { Article, ArticleFilterParams } from "@/entities/article";

export default function ArticlesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ArticleFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [topicsSidebarOpen, setTopicsSidebarOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { data, isLoading } = useArticles(filters);
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();
  const { mutate: publishArticle } = usePublishArticle();
  const { mutate: unpublishArticle } = useUnpublishArticle();

  const handleFiltersChange = (newFilters: Partial<ArticleFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 on filter change
    }));
    // Clear selection on filter change
    setSelectedRows([]);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSelectedRows([]);
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedArticle) {
      deleteArticle(selectedArticle.id);
      setDeleteModalOpen(false);
      setSelectedArticle(null);
    }
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

  // Get title from first locale (ru preferred)
  const getArticleTitle = (article: Article): string => {
    const ruLocale = article.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || article.locales?.[0]?.title || "Без названия";
  };

  const columns: Column<Article>[] = [
    {
      key: "title",
      header: "Название",
      render: (article) => (
        <div className="max-w-md">
          <p className="font-medium text-[var(--color-text-primary)] line-clamp-1">
            {getArticleTitle(article)}
          </p>
          {article.locales?.[0]?.slug && (
            <p className="text-sm text-[var(--color-text-muted)]">/{article.locales[0].slug}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "120px",
      render: (article) => <StatusBadge status={article.status} />,
    },
    {
      key: "view_count",
      header: "Просмотры",
      width: "100px",
      sortable: true,
      render: (article) => (
        <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
          <Eye className="h-4 w-4" />
          {article.view_count}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Создана",
      width: "140px",
      sortable: true,
      render: (article) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(article.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "140px",
      render: (article) => (
        <div className="flex items-center justify-end gap-1">
          {article.status === "draft" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                publishArticle(article.id);
              }}
              className="text-[var(--color-success)]"
            >
              Опубликовать
            </Button>
          ) : article.status === "published" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                unpublishArticle(article.id);
              }}
            >
              Снять
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.ARTICLE_EDIT(article.id));
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
              handleDeleteClick(article);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Статьи</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление статьями блога
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setTopicsSidebarOpen(true)}
            leftIcon={<Tags className="h-4 w-4" />}
          >
            Темы
          </Button>
          <Button
            onClick={() => router.push(ROUTES.ARTICLE_NEW)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать статью
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ArticleFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedIds={selectedRows}
        resourceType="articles"
        onClearSelection={() => setSelectedRows([])}
        availableActions={["publish", "unpublish", "archive", "delete"]}
      />

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(article) => article.id}
        isLoading={isLoading}
        emptyMessage="Статьи не найдены"
        sortBy={filters.sortBy}
        sortDirection={filters.sortOrder || null}
        onSort={(column, direction) => {
          handleFiltersChange({
            sortBy: direction ? column : undefined,
            sortOrder: direction || undefined,
          });
        }}
        onRowClick={(article) => router.push(ROUTES.ARTICLE_EDIT(article.id))}
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
        title="Удалить статью?"
        description={`Вы уверены, что хотите удалить статью "${selectedArticle ? getArticleTitle(selectedArticle) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Topics Sidebar */}
      <TopicsSidebar
        isOpen={topicsSidebarOpen}
        onClose={() => setTopicsSidebarOpen(false)}
      />
    </div>
  );
}
