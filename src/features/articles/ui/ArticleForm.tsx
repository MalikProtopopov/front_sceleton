"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe } from "lucide-react";
import {
  Button,
  Input,
  NumberInput,
  Textarea,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  RichTextEditor,
  ImageUpload,
  SectionHeader,
  LocaleManager,
  ModalBody,
  ModalFooter,
  type LocaleFormRenderProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import { useUploadArticleCoverImage, useDeleteArticleCoverImage } from "@/features/images";
import {
  useCreateArticleLocale,
  useUpdateArticleLocale,
  useDeleteArticleLocale,
} from "../model/useArticles";
import type { Article, ArticleLocale, CreateArticleDto, UpdateArticleDto, CreateArticleLocaleDto, Topic } from "@/entities/article";

// Validation schema for create form
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Заголовок обязателен").max(200, "Максимум 200 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  excerpt: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  content: z.string().optional().nullable(),
  meta_title: z.string().max(60, "Максимум 60 символов").optional().nullable(),
  meta_description: z.string().max(160, "Максимум 160 символов").optional().nullable(),
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

type CreateArticleFormValues = z.infer<typeof createArticleSchema>;
type EditArticleFormValues = z.infer<typeof editArticleSchema>;

interface ArticleFormProps {
  article?: Article;
  topics?: Topic[];
  onSubmit: (data: CreateArticleDto | UpdateArticleDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// =============================================
// Article Locale Form Component (for LocaleManager)
// =============================================
interface ArticleLocaleFormData extends Omit<CreateArticleLocaleDto, 'locale'> {
  locale: string;
}

export function ArticleLocaleForm({
  locale,
  selectedLang,
  onSubmit,
  onCancel,
  isLoading,
  isEditing,
}: LocaleFormRenderProps<ArticleLocale & { id: string }>) {
  const [formData, setFormData] = useState<ArticleLocaleFormData>({
    locale: selectedLang,
    title: locale?.title || "",
    slug: locale?.slug || "",
    excerpt: locale?.excerpt || "",
    content: locale?.content || "",
    meta_title: locale?.meta_title || "",
    meta_description: locale?.meta_description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ArticleLocaleFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTitleChange = (value: string) => {
    handleChange("title", value);
    if (!isEditing) {
      handleChange("slug", generateSlug(value));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      newErrors.title = "Заголовок обязателен";
    }
    if (!formData.slug?.trim()) {
      newErrors.slug = "Slug обязателен";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Только a-z, 0-9 и дефис";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      locale: selectedLang,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || undefined,
      content: formData.content || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
    } as ArticleLocale & { id: string });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Заголовок"
            placeholder="Введите заголовок"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Slug"
            placeholder="article-slug"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            error={errors.slug}
            required
          />

          <Textarea
            label="Краткое описание"
            placeholder="Краткое описание статьи..."
            value={formData.excerpt || ""}
            onChange={(e) => handleChange("excerpt", e.target.value)}
          />

          <RichTextEditor
            label="Содержание"
            value={formData.content || ""}
            onChange={(val) => handleChange("content", val)}
            placeholder="Полный текст статьи..."
          />

          {/* SEO fields */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">
              SEO настройки
            </h4>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                placeholder="SEO заголовок (до 60 символов)"
                value={formData.meta_title || ""}
                onChange={(e) => handleChange("meta_title", e.target.value)}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO описание (до 160 символов)"
                value={formData.meta_description || ""}
                onChange={(e) => handleChange("meta_description", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {isEditing ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}

export function ArticleForm({ article, topics = [], onSubmit, isSubmitting = false }: ArticleFormProps) {
  const isEditing = !!article;
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(article?.cover_image_url || null);

  // Image upload hooks
  const uploadCoverImage = useUploadArticleCoverImage(article?.id || "");
  const deleteCoverImage = useDeleteArticleCoverImage(article?.id || "");

  // Locale management hooks (only for editing)
  const createLocale = useCreateArticleLocale(article?.id || "");
  const updateLocale = useUpdateArticleLocale(article?.id || "");
  const deleteLocale = useDeleteArticleLocale(article?.id || "");

  // Form for creating new article
  const createForm = useForm<CreateArticleFormValues>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      status: "draft",
      reading_time_minutes: null,
      sort_order: null,
      topic_ids: [],
      locales: [
        {
          locale: "ru",
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          meta_title: "",
          meta_description: "",
        },
      ],
    },
  });

  // Form for editing existing article
  const editForm = useForm<EditArticleFormValues>({
    resolver: zodResolver(editArticleSchema),
    defaultValues: {
      status: article?.status || "draft",
      reading_time_minutes: article?.reading_time_minutes || null,
      sort_order: article?.sort_order ?? null,
      topic_ids: article?.topics?.map((t) => t.topic_id) || [],
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEditing ? editForm : createForm) as any;
  const locales = isEditing ? [] : createForm.watch("locales");

  // Sync coverImageUrl when article changes
  useEffect(() => {
    if (article?.cover_image_url !== coverImageUrl) {
      setCoverImageUrl(article?.cover_image_url || null);
    }
  }, [article?.cover_image_url, coverImageUrl]);

  // Sync form values when article loads/changes (for edit mode)
  useEffect(() => {
    if (isEditing && article) {
      editForm.reset({
        status: article.status || "draft",
        reading_time_minutes: article.reading_time_minutes || null,
        sort_order: article.sort_order ?? null,
        topic_ids: article.topics?.map((t) => t.topic_id) || [],
      });
    }
  }, [article, isEditing, editForm]);

  const handleFormSubmit = isEditing
    ? (data: EditArticleFormValues) => {
        const payload: UpdateArticleDto = {
          ...data,
          reading_time_minutes: data.reading_time_minutes || undefined,
          sort_order: data.sort_order ?? undefined,
          version: article!.version,
        };
        onSubmit(payload);
      }
    : (data: CreateArticleFormValues) => {
        const payload: CreateArticleDto = {
          ...data,
          reading_time_minutes: data.reading_time_minutes || undefined,
          sort_order: data.sort_order ?? undefined,
          locales: data.locales.map((l) => ({
            ...l,
            excerpt: l.excerpt || undefined,
            content: l.content || undefined,
            meta_title: l.meta_title || undefined,
            meta_description: l.meta_description || undefined,
          })),
        };
        onSubmit(payload);
      };

  const handleImageUpload = async (file: File) => {
    const result = await uploadCoverImage.mutateAsync(file);
    setCoverImageUrl(result.cover_image_url);
  };

  const handleImageDelete = async () => {
    await deleteCoverImage.mutateAsync();
    setCoverImageUrl(null);
  };

  // Locale management handlers
  const handleCreateLocale = async (data: Omit<ArticleLocale & { id: string }, "id">) => {
    // Convert null to undefined for API compatibility
    const apiData: CreateArticleLocaleDto = {
      locale: data.locale,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? undefined,
      content: data.content ?? undefined,
      meta_title: data.meta_title ?? undefined,
      meta_description: data.meta_description ?? undefined,
    };
    await createLocale.mutateAsync(apiData);
  };

  const handleUpdateLocale = async (localeId: string, data: Partial<ArticleLocale>) => {
    const apiData: Partial<CreateArticleLocaleDto> = {
      locale: data.locale,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? undefined,
      content: data.content ?? undefined,
      meta_title: data.meta_title ?? undefined,
      meta_description: data.meta_description ?? undefined,
    };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateArticleLocaleDto });
  };

  const handleDeleteLocale = async (localeId: string) => {
    await deleteLocale.mutateAsync(localeId);
  };

  // For create mode
  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      createForm.setValue("locales", [
        ...locales,
        {
          locale,
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          meta_title: "",
          meta_description: "",
        },
      ]);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length > 1) {
      createForm.setValue(
        "locales",
        locales.filter((_, i) => i !== index),
      );
    }
  };

  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !locales.map((loc) => loc.locale).includes(l.value),
  );

  // Topic options
  const topicOptions = topics.map((topic) => {
    const ruLocale = topic.locales.find((l) => l.locale === "ru");
    return {
      value: topic.id,
      label: ruLocale?.name || topic.id,
    };
  });

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-6">
      {/* Basic settings */}
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

      {/* Localizations - different UI for create vs edit */}
      {isEditing ? (
        <LocaleManager<ArticleLocale & { id: string }>
          locales={article.locales as (ArticleLocale & { id: string })[]}
          supportedLocales={SUPPORTED_LOCALES}
          isEditing={true}
          onCreateLocale={handleCreateLocale}
          onUpdateLocale={handleUpdateLocale}
          onDeleteLocale={handleDeleteLocale}
          isCreating={createLocale.isPending}
          isUpdating={updateLocale.isPending}
          isDeleting={deleteLocale.isPending}
          getLocaleDisplayTitle={(locale) => locale.title}
          renderLocaleForm={(props) => <ArticleLocaleForm {...props} />}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[var(--color-text-muted)]" />
                <CardTitle>Локализации</CardTitle>
                <span className="rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                  {locales.length} {locales.length === 1 ? "язык" : "языка"}
                </span>
              </div>
              {availableLocales.length > 0 && (
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addLocale(e.target.value);
                    }
                  }}
                  options={[{ value: "", label: "Добавить язык" }, ...availableLocales]}
                  minWidth="180px"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={locales[0]?.locale || "ru"}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">Редактирование:</span>
                <TabsList>
                  {locales.map((locale, index) => (
                    <TabsTrigger key={locale.locale} value={locale.locale}>
                      <span className="font-medium">{locale.locale.toUpperCase()}</span>
                      <span className="ml-1.5 hidden sm:inline text-[var(--color-text-muted)]">
                        {SUPPORTED_LOCALES.find((l) => l.value === locale.locale)?.label}
                      </span>
                      {locales.length > 1 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocale(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              removeLocale(index);
                            }
                          }}
                          className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] cursor-pointer"
                        >
                          ×
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {locales.map((locale, index) => (
                <TabsContent key={locale.locale} value={locale.locale}>
                  <div className="space-y-4">
                    <input type="hidden" {...createForm.register(`locales.${index}.locale`)} />

                    <Input
                      label="Заголовок"
                      placeholder="Введите заголовок"
                      {...createForm.register(`locales.${index}.title`, {
                        onChange: (e) => {
                          const slug = generateSlug(e.target.value);
                          createForm.setValue(`locales.${index}.slug`, slug);
                        },
                      })}
                      error={createForm.formState.errors.locales?.[index]?.title?.message}
                      required
                    />

                    <Input
                      label="Slug"
                      placeholder="article-slug"
                      {...createForm.register(`locales.${index}.slug`)}
                      error={createForm.formState.errors.locales?.[index]?.slug?.message}
                      required
                    />

                    <Textarea
                      label="Краткое описание"
                      placeholder="Краткое описание статьи..."
                      {...createForm.register(`locales.${index}.excerpt`)}
                      error={createForm.formState.errors.locales?.[index]?.excerpt?.message}
                    />

                    <Controller
                      name={`locales.${index}.content`}
                      control={createForm.control}
                      render={({ field }) => (
                        <RichTextEditor
                          label="Содержание"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Полный текст статьи..."
                        />
                      )}
                    />

                    {/* SEO fields */}
                    <div className="border-t border-[var(--color-border)] pt-4">
                      <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">
                        SEO настройки
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Meta Title"
                          placeholder="SEO заголовок (до 60 символов)"
                          {...createForm.register(`locales.${index}.meta_title`)}
                          error={createForm.formState.errors.locales?.[index]?.meta_title?.message}
                        />
                        <Textarea
                          label="Meta Description"
                          placeholder="SEO описание (до 160 символов)"
                          {...createForm.register(`locales.${index}.meta_description`)}
                          error={createForm.formState.errors.locales?.[index]?.meta_description?.message}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Submit button */}
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
