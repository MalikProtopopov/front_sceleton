"use client";

import { ProductForm, useCreateProduct } from "@/features/catalog";
import type { CreateProductDto, UpdateProductDto } from "@/entities/product";

export default function NewProductPage() {
  const { mutate: createProduct, isPending } = useCreateProduct();

  const handleSubmit = (data: CreateProductDto | UpdateProductDto) => {
    createProduct(data as CreateProductDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый товар</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новый товар в каталоге</p>
      </div>

      <ProductForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}
