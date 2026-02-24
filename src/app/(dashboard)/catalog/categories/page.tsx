"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCategoriesTree, useDeleteCategory, CategoryTree } from "@/features/catalog";
import { Button, Spinner, ConfirmModal } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Category } from "@/entities/product";

export default function CategoriesPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data, isLoading } = useCategoriesTree();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Категории</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление деревом категорий каталога
          </p>
        </div>
        {can("catalog", "create") && (
          <Button
            onClick={() => router.push(ROUTES.CATEGORY_NEW)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать категорию
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-2">
        <CategoryTree
          categories={data?.items || []}
          onDelete={can("catalog", "delete") ? handleDeleteClick : undefined}
        />
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить категорию?"
        description={`Вы уверены, что хотите удалить категорию "${selectedCategory?.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
