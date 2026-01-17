"use client";

import { useState } from "react";
import { Grid, List, Upload, FolderOpen } from "lucide-react";
import { useFiles, useDeleteFile, FileCard, UploadDropzone } from "@/features/media";
import { Button, Pagination, Select, Modal, ModalBody, ConfirmModal, Spinner } from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { FileAsset, FileFilterParams } from "@/entities/file";

type ViewMode = "grid" | "list";

export default function MediaPage() {
  const [filters, setFilters] = useState<FileFilterParams>({
    page: 1,
    pageSize: 24,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);

  const { data, isLoading, refetch } = useFiles(filters);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();

  const handleFiltersChange = (newFilters: Partial<FileFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleDeleteClick = (file: FileAsset) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFile) {
      deleteFile(selectedFile.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedFile(null);
        },
      });
    }
  };

  const handleUploadComplete = () => {
    refetch();
  };

  // Folder options (could be dynamic)
  const folderOptions = [
    { value: "", label: "Все папки" },
    { value: "articles", label: "Статьи" },
    { value: "team", label: "Команда" },
    { value: "services", label: "Услуги" },
    { value: "other", label: "Прочее" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Медиатека</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление файлами и изображениями
          </p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          Загрузить
        </Button>
      </div>

      {/* Filters and view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select
            value={filters.folder || ""}
            onChange={(e) => handleFiltersChange({ folder: e.target.value || undefined, page: 1 })}
            options={folderOptions}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-[var(--radius-sm)] p-2 transition-colors",
              viewMode === "grid"
                ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
            title="Сетка"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-[var(--radius-sm)] p-2 transition-colors",
              viewMode === "list"
                ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            )}
            title="Список"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                : "space-y-2",
            )}
          >
            {data.items.map((file) => (
              <FileCard key={file.id} file={file} onDelete={handleDeleteClick} />
            ))}
          </div>

          {/* Pagination */}
          {data.total > (filters.pageSize || 24) && (
            <Pagination
              page={filters.page || 1}
              pageSize={filters.pageSize || 24}
              total={data.total}
              onPageChange={(page) => handleFiltersChange({ page })}
              onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
              pageSizeOptions={[12, 24, 48, 96]}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
          <p className="text-lg font-medium text-[var(--color-text-primary)]">
            Файлы не найдены
          </p>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Загрузите первый файл, чтобы начать
          </p>
          <Button
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Upload className="h-4 w-4" />}
            className="mt-4"
          >
            Загрузить файл
          </Button>
        </div>
      )}

      {/* Upload modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Загрузка файлов"
        size="xl"
      >
        <ModalBody>
          <UploadDropzone folder={filters.folder} onUploadComplete={handleUploadComplete} />
        </ModalBody>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить файл?"
        description={`Вы уверены, что хотите удалить файл "${selectedFile?.original_filename}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

