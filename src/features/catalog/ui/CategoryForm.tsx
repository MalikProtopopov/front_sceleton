"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Image as ImageIcon, X } from "lucide-react";
import { Button, Input, Textarea, Select, Switch } from "@/shared/ui";
import { MediaPickerModal } from "@/features/media";
import { transliterate, getFileContentUrl, getMediaUrl } from "@/shared/lib";
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
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
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
  const imageUrl = watch("image_url");

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

      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          URL изображения
        </label>
        <div className="flex gap-2">
          <Input
            value={imageUrl || ""}
            onChange={(e) => setValue("image_url", e.target.value)}
            placeholder="https://... или выберите из медиатеки"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMediaPickerOpen(true)}
            className="shrink-0"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Выбрать
          </Button>
        </div>
        {imageUrl && (
          <div className="relative mt-2 rounded-lg border border-[var(--color-border)] p-2">
            <button
              type="button"
              onClick={() => setValue("image_url", "")}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error)] transition-colors"
              title="Удалить изображение"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={getMediaUrl(imageUrl)}
              alt=""
              className="mx-auto h-24 w-auto max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

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

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(file) => {
          setValue("image_url", getFileContentUrl(file));
          setMediaPickerOpen(false);
        }}
        imagesOnly
        title="Выбрать изображение"
      />
    </form>
  );
}
