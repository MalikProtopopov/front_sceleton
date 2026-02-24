"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Textarea, Select, Switch } from "@/shared/ui";
import { transliterate, cn } from "@/shared/lib";
import { useCategoriesTree } from "../model/useCategories";
import { useUomsList } from "../model/useUoms";
import type { Product, CreateProductDto, UpdateProductDto } from "@/entities/product";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  sku: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  description: string;
  uom_id: string;
  is_active: boolean;
  category_ids: string[];
}

export function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const [autoSlug, setAutoSlug] = useState(!product);
  const { data: categoriesData } = useCategoriesTree();
  const { data: uoms } = useUomsList();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      sku: product?.sku || "",
      slug: product?.slug || "",
      title: product?.title || "",
      brand: product?.brand || "",
      model: product?.model || "",
      description: product?.description || "",
      uom_id: product?.uom_id || "",
      is_active: product?.is_active ?? true,
      category_ids: [],
    },
  });

  const title = watch("title");

  useEffect(() => {
    if (autoSlug && title) {
      setValue("slug", transliterate(title));
    }
  }, [title, autoSlug, setValue]);

  const handleFormSubmit = (values: FormValues) => {
    if (product) {
      const dto: UpdateProductDto = {
        version: product.version,
      };
      if (values.sku !== product.sku) dto.sku = values.sku;
      if (values.slug !== product.slug) dto.slug = values.slug;
      if (values.title !== product.title) dto.title = values.title;
      if (values.brand !== (product.brand || "")) dto.brand = values.brand || null;
      if (values.model !== (product.model || "")) dto.model = values.model || null;
      if (values.description !== (product.description || ""))
        dto.description = values.description || null;
      if (values.uom_id !== (product.uom_id || "")) dto.uom_id = values.uom_id || null;
      if (values.is_active !== product.is_active) dto.is_active = values.is_active;
      onSubmit(dto);
    } else {
      const dto: CreateProductDto = {
        sku: values.sku,
        slug: values.slug,
        title: values.title,
        brand: values.brand || undefined,
        model: values.model || undefined,
        description: values.description || undefined,
        uom_id: values.uom_id || undefined,
        is_active: values.is_active,
        category_ids: values.category_ids.length ? values.category_ids : undefined,
      };
      onSubmit(dto);
    }
  };

  const categories = categoriesData?.items || [];
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.title }));
  const uomOptions = [
    { value: "", label: "Не указана" },
    ...(uoms || []).filter((u) => u.is_active).map((u) => ({ value: u.id, label: `${u.name} (${u.symbol || u.code})` })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Название *"
          placeholder="Widget Pro 2000"
          error={errors.title?.message}
          {...register("title", { required: "Введите название" })}
        />
        <Input
          label="Артикул (SKU) *"
          placeholder="WP-2000"
          error={errors.sku?.message}
          {...register("sku", { required: "Введите артикул" })}
        />
      </div>

      <Input
        label="URL Slug *"
        placeholder="widget-pro-2000"
        error={errors.slug?.message}
        {...register("slug", { required: "Введите slug" })}
        onFocus={() => setAutoSlug(false)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Бренд" placeholder="WidgetCorp" {...register("brand")} />
        <Input label="Модель" placeholder="Pro-2000" {...register("model")} />
      </div>

      <Textarea
        label="Описание"
        placeholder="Полное описание товара..."
        className="min-h-[120px]"
        {...register("description")}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Select label="Единица измерения" options={uomOptions} {...register("uom_id")} />
        {!product && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              Категории
            </label>
            <select
              multiple
              className={cn(
                "min-h-11 w-full rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)]",
                "hover:border-[var(--color-border-hover)]",
                "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
                "border-[var(--color-border)]"
              )}
              {...register("category_ids")}
              size={Math.min(categoryOptions.length, 5) || 1}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Удерживайте Ctrl/Cmd для множественного выбора
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={watch("is_active")}
          onChange={(checked: boolean) => setValue("is_active", checked)}
        />
        <span className="text-sm text-[var(--color-text-primary)]">Активен</span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {product ? "Сохранить" : "Создать товар"}
        </Button>
      </div>
    </form>
  );
}
