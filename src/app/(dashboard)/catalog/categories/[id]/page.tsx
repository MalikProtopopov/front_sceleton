"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { CategoryForm, useCategory, useUpdateCategory, useDeleteCategory } from "@/features/catalog";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { CreateCategoryDto, UpdateCategoryDto } from "@/entities/product";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = usePermissions();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: category, isLoading, error } = useCategory(id);
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory(id);
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !category) {
    notFound();
  }

  const handleSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    updateCategory(data as UpdateCategoryDto);
  };

  const handleDelete = () => {
    deleteCategory(id);
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {category.title}
              </h1>
              <Badge variant={category.is_active ? "success" : "secondary"}>
                {category.is_active ? "Активна" : "Скрыта"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              /{category.slug} · Версия: {category.version} · Обновлена:{" "}
              {formatDateTime(category.updated_at)}
            </p>
          </div>
        </div>
        {can("catalog", "delete") && (
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Удалить
          </Button>
        )}
      </div>

      <CategoryForm category={category} onSubmit={handleSubmit} isSubmitting={isUpdating} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить категорию?"
        description={`Вы уверены, что хотите удалить категорию "${category.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
