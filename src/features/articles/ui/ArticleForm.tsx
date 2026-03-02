"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui";
import { ArticleBasicFields } from "./ArticleBasicFields";
import { ArticleLocalesSection } from "./ArticleLocalesSection";
import type { Article, CreateArticleDto, UpdateArticleDto, Topic } from "@/entities/article";

const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Заголовок обязателен").max(200, "Максимум 200 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  excerpt: z.string().max(500, "Максимум 500 символов").optional().nullable(),
});

const createArticleSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  reading_time_minutes: z.number().min(1).max(999).optional().nullable(),
  sort_order: z.number().min(0).optional().nullable(),
  topic_ids: z.array(z.string()).optional(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

const editArticleSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  reading_time_minutes: z.number().min(1).max(999).optional().nullable(),
  sort_order: z.number().min(0).optional().nullable(),
  topic_ids: z.array(z.string()).optional(),
});

export type CreateArticleFormValues = z.infer<typeof createArticleSchema>;

interface ArticleFormProps {
  article?: Article;
  topics?: Topic[];
  onSubmit: (data: CreateArticleDto | UpdateArticleDto) => void;
  isSubmitting?: boolean;
}

export function ArticleForm({ article, topics = [], onSubmit, isSubmitting = false }: ArticleFormProps) {
  const isEditing = !!article;

  const form = useForm<CreateArticleFormValues>({
    resolver: zodResolver(isEditing ? editArticleSchema : createArticleSchema) as unknown as Resolver<CreateArticleFormValues>,
    defaultValues: isEditing
      ? { status: article?.status || "draft", reading_time_minutes: article?.reading_time_minutes || null, sort_order: article?.sort_order ?? null, topic_ids: article?.topics?.map((t) => t.topic_id) || [], locales: [] }
      : { status: "draft", reading_time_minutes: null, sort_order: null, topic_ids: [], locales: [{ locale: "ru", title: "", slug: "", excerpt: "" }] },
  });

  useEffect(() => {
    if (isEditing && article) {
      form.reset({
        status: article.status || "draft",
        reading_time_minutes: article.reading_time_minutes || null,
        sort_order: article.sort_order ?? null,
        topic_ids: article.topics?.map((t) => t.topic_id) || [],
        locales: [],
      });
    }
  }, [article, isEditing, form]);

  const handleFormSubmit = (data: CreateArticleFormValues) => {
    if (isEditing) {
      const { locales: _, ...editData } = data;
      const payload: UpdateArticleDto = {
        ...editData,
        reading_time_minutes: editData.reading_time_minutes || undefined,
        sort_order: editData.sort_order ?? undefined,
        version: article!.version,
      };
      onSubmit(payload);
    } else {
      const payload: CreateArticleDto = {
        ...data,
        reading_time_minutes: data.reading_time_minutes || undefined,
        sort_order: data.sort_order ?? undefined,
        locales: data.locales.map((l) => ({
          locale: l.locale,
          title: l.title,
          slug: l.slug,
          excerpt: l.excerpt || undefined,
        })),
      };
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <ArticleBasicFields
        form={form}
        isEditing={isEditing}
        article={article}
        topics={topics}
      />

      <ArticleLocalesSection
        isEditing={isEditing}
        article={article}
        form={form}
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}
