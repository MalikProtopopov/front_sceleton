"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Textarea, Select, Switch } from "@/shared/ui";
import { transliterate } from "@/shared/lib";
import { useCategoriesTree } from "../model/useCategories";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "@/entities/product";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  slug: string;
  parent_id: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export function CategoryForm({ category, onSubmit, isSubmitting }: CategoryFormProps) {
  const [autoSlug, setAutoSlug] = useState(!category);
  const { data: categoriesData } = useCategoriesTree();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: category?.title || "",
      slug: category?.slug || "",
      parent_id: category?.parent_id || "",
      description: category?.description || "",
      image_url: category?.image_url || "",
      is_active: category?.is_active ?? true,
      sort_order: category?.sort_order ?? 0,
    },
  });

  const title = watch("title");

  useEffect(() => {
    if (autoSlug && title) {
      setValue("slug", transliterate(title));
    }
  }, [title, autoSlug, setValue]);

  const handleFormSubmit = (values: FormValues) => {
    if (category) {
      const dto: UpdateCategoryDto = { version: category.version };
      if (values.title !== category.title) dto.title = values.title;
      if (values.slug !== category.slug) dto.slug = values.slug;
      dto.parent_id = values.parent_id || null;
      if (values.description !== (category.description || ""))
        dto.description = values.description || null;
      if (values.image_url !== (category.image_url || ""))
        dto.image_url = values.image_url || null;
      if (values.is_active !== category.is_active) dto.is_active = values.is_active;
      if (values.sort_order !== category.sort_order) dto.sort_order = values.sort_order;
      onSubmit(dto);
    } else {
      const dto: CreateCategoryDto = {
        title: values.title,
        slug: values.slug,
        parent_id: values.parent_id || null,
        description: values.description || undefined,
        image_url: values.image_url || undefined,
        is_active: values.is_active,
        sort_order: values.sort_order,
      };
      onSubmit(dto);
    }
  };

  const parentOptions = [
    { value: "", label: "Без родительской категории" },
    ...(categoriesData?.items || [])
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ value: c.id, label: c.title })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Название *"
          placeholder="Электрооборудование"
          error={errors.title?.message}
          {...register("title", { required: "Введите название" })}
        />
        <Input
          label="URL Slug *"
          placeholder="electrical"
          error={errors.slug?.message}
          {...register("slug", { required: "Введите slug" })}
          onFocus={() => setAutoSlug(false)}
        />
      </div>

      <Select
        label="Родительская категория"
        options={parentOptions}
        {...register("parent_id")}
      />

      <Textarea
        label="Описание"
        placeholder="Описание категории..."
        className="min-h-[80px]"
        {...register("description")}
      />

      <Input label="URL изображения" placeholder="https://..." {...register("image_url")} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Порядок сортировки"
          type="number"
          {...register("sort_order", { valueAsNumber: true })}
        />
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={watch("is_active")}
            onChange={(checked: boolean) => setValue("is_active", checked)}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Активна</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {category ? "Сохранить" : "Создать категорию"}
        </Button>
      </div>
    </form>
  );
}
