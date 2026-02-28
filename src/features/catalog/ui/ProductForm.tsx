"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Textarea, Select, Switch, Combobox } from "@/shared/ui";
import { transliterate } from "@/shared/lib";
import { useCategoriesTree } from "../model/useCategories";
import { useUomsList } from "../model/useUoms";
import type { Product, CreateProductDto, UpdateProductDto, ProductType } from "@/entities/product";
import { PRODUCT_TYPE_LABELS } from "@/entities/product";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => void;
  isSubmitting?: boolean;
  isVariantsEnabled?: boolean;
}

interface FormValues {
  sku: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  description: string;
  uom_id: string;
  product_type: ProductType;
  has_variants: boolean;
  is_active: boolean;
  category_ids: string[];
}

export function ProductForm({ product, onSubmit, isSubmitting, isVariantsEnabled }: ProductFormProps) {
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
      product_type: product?.product_type || "physical",
      has_variants: product?.has_variants ?? false,
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
      if (isVariantsEnabled) {
        if (values.product_type !== product.product_type) dto.product_type = values.product_type;
        if (values.has_variants !== product.has_variants) dto.has_variants = values.has_variants;
      }
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
        ...(isVariantsEnabled && {
          product_type: values.product_type,
          has_variants: values.has_variants,
        }),
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
  const productTypeOptions = Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

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
          <Combobox
            label="Категории"
            placeholder="Выберите категории..."
            searchPlaceholder="Поиск категорий"
            options={categoryOptions}
            value={watch("category_ids") || []}
            onChange={(val) => setValue("category_ids", Array.isArray(val) ? val : val ? [val] : [])}
            multiple
            searchable
            clearable
            emptyMessage="Нет категорий"
          />
        )}
      </div>

      {isVariantsEnabled && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Тип продукта"
            options={productTypeOptions}
            {...register("product_type")}
          />
          <div className="flex items-center gap-3 sm:pt-7">
            <Switch
              checked={watch("has_variants")}
              onChange={(checked: boolean) => setValue("has_variants", checked)}
            />
            <span className="text-sm text-[var(--color-text-primary)]">Товар с вариантами</span>
          </div>
        </div>
      )}

      {product && product.has_variants && product.price_from != null && (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
          <span className="text-sm text-[var(--color-text-muted)]">Диапазон цен вариантов: </span>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {product.price_from}
            {product.price_to && product.price_to !== product.price_from && ` — ${product.price_to}`}
            {" ₽"}
          </span>
        </div>
      )}

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
