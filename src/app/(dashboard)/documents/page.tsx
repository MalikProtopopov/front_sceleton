"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import {
  useDocuments,
  useDeleteDocument,
  usePublishDocument,
  useUnpublishDocument,
} from "@/features/documents";
import { Button, Table, Pagination, StatusBadge, ConfirmModal, Select, Input, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate, getMediaUrl } from "@/shared/lib";
import type { Document, DocumentFilterParams } from "@/entities/document";

export default function DocumentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<DocumentFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data, isLoading } = useDocuments(filters);
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutate: publishDocument } = usePublishDocument();
  const { mutate: unpublishDocument } = useUnpublishDocument();

  const handleFiltersChange = (newFilters: Partial<DocumentFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (doc: Document) => {
    setSelectedDocument(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDocument) {
      deleteDocument(selectedDocument.id);
      setDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  // Get title from first locale (ru preferred)
  const getDocumentTitle = (doc: Document): string => {
    const ruLocale = doc.locales?.find((l) => l.locale === "ru");
    return ruLocale?.title || doc.locales?.[0]?.title || "Без названия";
  };

  const columns: Column<Document>[] = [
    {
      key: "title",
      header: "Название",
      render: (doc) => (
        <div className="max-w-md">
          <p className="font-medium text-[var(--color-text-primary)] line-clamp-1">
            {getDocumentTitle(doc)}
          </p>
          {doc.locales?.[0]?.slug && (
            <p className="text-sm text-[var(--color-text-muted)]">/{doc.locales[0].slug}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "120px",
      render: (doc) => <StatusBadge status={doc.status} />,
    },
    {
      key: "document_version",
      header: "Версия",
      width: "100px",
      render: (doc) => (
        <span className="text-[var(--color-text-secondary)]">
          {doc.document_version || "—"}
        </span>
      ),
    },
    {
      key: "document_date",
      header: "Дата документа",
      width: "140px",
      sortable: true,
      render: (doc) => (
        <span className="text-[var(--color-text-secondary)]">
          {doc.document_date ? formatDate(doc.document_date) : "—"}
        </span>
      ),
    },
    {
      key: "file",
      header: "Файл",
      width: "80px",
      render: (doc) =>
        doc.file_url ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.open(getMediaUrl(doc.file_url!), "_blank");
            }}
            className="h-8 w-8 text-[var(--color-accent-primary)]"
          >
            <Download className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-[var(--color-text-muted)]">—</span>
        ),
    },
    {
      key: "created_at",
      header: "Создан",
      width: "140px",
      sortable: true,
      render: (doc) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(doc.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "140px",
      render: (doc) => (
        <div className="flex items-center justify-end gap-1">
          {doc.status === "draft" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                publishDocument(doc.id);
              }}
              className="text-[var(--color-success)]"
            >
              Опубликовать
            </Button>
          ) : doc.status === "published" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                unpublishDocument(doc.id);
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
              router.push(ROUTES.DOCUMENT_EDIT(doc.id));
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
              handleDeleteClick(doc);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Документы</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление документами и файлами
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.DOCUMENT_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать документ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
        <div className="min-w-[200px]">
          <Select
            label="Статус"
            value={filters.status || ""}
            onChange={(e) =>
              handleFiltersChange({
                status: e.target.value as DocumentFilterParams["status"] || undefined,
              })
            }
            options={[
              { value: "", label: "Все статусы" },
              { value: "draft", label: "Черновик" },
              { value: "published", label: "Опубликовано" },
              { value: "archived", label: "В архиве" },
            ]}
          />
        </div>
        <div className="min-w-[200px]">
          <Input
            label="Поиск"
            placeholder="Поиск по названию..."
            value={filters.search || ""}
            onChange={(e) => handleFiltersChange({ search: e.target.value || undefined })}
          />
        </div>
        {(filters.status || filters.search) && (
          <Button variant="ghost" onClick={handleResetFilters}>
            Сбросить
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(doc) => doc.id}
        isLoading={isLoading}
        emptyMessage="Документы не найдены"
        sortBy={filters.sortBy}
        sortDirection={filters.sortDirection || null}
        onSort={(column, direction) => {
          handleFiltersChange({
            sortBy: direction ? column : undefined,
            sortDirection: direction || undefined,
          });
        }}
        onRowClick={(doc) => router.push(ROUTES.DOCUMENT_EDIT(doc.id))}
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
        title="Удалить документ?"
        description={`Вы уверены, что хотите удалить документ "${selectedDocument ? getDocumentTitle(selectedDocument) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

