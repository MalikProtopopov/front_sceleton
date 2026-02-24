"use client";

import { CategoryForm, useCreateCategory } from "@/features/catalog";
import type { CreateCategoryDto, UpdateCategoryDto } from "@/entities/product";

export default function NewCategoryPage() {
  const { mutate: createCategory, isPending } = useCreateCategory();

  const handleSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    createCategory(data as CreateCategoryDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новая категория</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новую категорию каталога</p>
      </div>

      <CategoryForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}
