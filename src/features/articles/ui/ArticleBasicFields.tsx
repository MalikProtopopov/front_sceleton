"use client";

import { useState, useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Input,
  NumberInput,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ImageUpload,
} from "@/shared/ui";
import { useUploadArticleCoverImage, useDeleteArticleCoverImage } from "@/features/images";
import type { Article, Topic } from "@/entities/article";
import type { CreateArticleFormValues } from "./ArticleForm";

interface ArticleBasicFieldsProps {
  form: UseFormReturn<CreateArticleFormValues>;
  isEditing: boolean;
  article?: Article;
  topics?: Topic[];
}

export function ArticleBasicFields({ form, isEditing, article, topics = [] }: ArticleBasicFieldsProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(article?.cover_image_url || null);

  const uploadCoverImage = useUploadArticleCoverImage(article?.id || "");
  const deleteCoverImage = useDeleteArticleCoverImage(article?.id || "");

  useEffect(() => {
    if (article?.cover_image_url !== coverImageUrl) {
      setCoverImageUrl(article?.cover_image_url || null);
    }
  }, [article?.cover_image_url, coverImageUrl]);

  const handleImageUpload = async (file: File) => {
    const result = await uploadCoverImage.mutateAsync(file);
    setCoverImageUrl(result.cover_image_url);
  };

  const handleImageDelete = async () => {
    await deleteCoverImage.mutateAsync();
    setCoverImageUrl(null);
  };

  const topicOptions = topics.map((topic) => {
    const ruLocale = topic.locales.find((l) => l.locale === "ru");
    return {
      value: topic.id,
      label: ruLocale?.name || topic.id,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Основные настройки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Select
              label="Статус"
              value={field.value || "draft"}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              options={[
                { value: "draft", label: "Черновик" },
                { value: "published", label: "Опубликовано" },
                { value: "archived", label: "В архиве" },
              ]}
              className="max-w-xs"
              error={form.formState.errors.status?.message}
            />
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Время чтения (мин)"
            type="number"
            {...form.register("reading_time_minutes", { valueAsNumber: true })}
            error={form.formState.errors.reading_time_minutes?.message}
          />
          <Controller
            name="sort_order"
            control={form.control}
            render={({ field }) => (
              <NumberInput
                label="Порядок сортировки"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val === undefined ? null : val);
                }}
                min={0}
                max={1000}
                error={form.formState.errors.sort_order?.message}
              />
            )}
          />
        </div>
        {topicOptions.length > 0 && (
          <Controller
            name="topic_ids"
            control={form.control}
            render={({ field }) => (
              <Select
                label="Тема"
                value={field.value?.[0] || ""}
                onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                options={[{ value: "", label: "Без темы" }, ...topicOptions]}
              />
            )}
          />
        )}
        <ImageUpload
          label="Обложка"
          entityId={article?.id}
          currentImageUrl={coverImageUrl}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          disabled={!isEditing}
          helpText={isEditing ? undefined : "Сохраните статью, чтобы загрузить обложку"}
        />
      </CardContent>
    </Card>
  );
}
