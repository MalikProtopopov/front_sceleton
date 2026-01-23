"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  ImageUpload,
  SectionHeader,
} from "@/shared/ui";
import { useUploadReviewAuthorPhoto, useDeleteReviewAuthorPhoto } from "@/features/images";
import { CaseSelector } from "./CaseSelector";
import type { Review, CreateReviewDto, UpdateReviewDto } from "@/entities/review";

// Validation schema
const localeSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  content: z.string().min(10, "Текст отзыва должен содержать минимум 10 символов"),
  company_name: z.string().max(200, "Максимум 200 символов").optional().nullable(),
});

const reviewSchema = z.object({
  author_name: z.string().min(1, "Имя автора обязательно").max(200, "Максимум 200 символов"),
  author_position: z.string().max(200, "Максимум 200 символов").optional(),
  rating: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      if (typeof val === "number") return val;
      const num = parseInt(String(val), 10);
      return isNaN(num) ? undefined : num;
    },
    z.number({ required_error: "Заполните поле", invalid_type_error: "Выберите рейтинг" }).min(1, "Рейтинг должен быть от 1 до 5").max(5, "Рейтинг должен быть от 1 до 5")
  ),
  case_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  review_date: z.string().optional(),
  locales: z.array(localeSchema).min(1, "Нужна хотя бы одна локализация"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  review?: Review;
  onSubmit: (data: CreateReviewDto | UpdateReviewDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const RATING_OPTIONS = [
  { value: "5", label: "★★★★★ (5)" },
  { value: "4", label: "★★★★☆ (4)" },
  { value: "3", label: "★★★☆☆ (3)" },
  { value: "2", label: "★★☆☆☆ (2)" },
  { value: "1", label: "★☆☆☆☆ (1)" },
];

export function ReviewForm({ review, onSubmit, isSubmitting = false }: ReviewFormProps) {
  const isEditing = !!review;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(review?.author_avatar_url || null);

  // Image upload hooks
  const uploadAvatar = useUploadReviewAuthorPhoto(review?.id || "");
  const deleteAvatar = useDeleteReviewAuthorPhoto(review?.id || "");

  const defaultValues: ReviewFormValues = {
    author_name: review?.author_name || "",
    author_position: review?.author_position || "",
    rating: review?.rating ?? undefined, // Required field, undefined for new review
    case_id: review?.case_id || null,
    is_featured: review?.is_featured ?? false,
    sort_order: review?.sort_order ?? null,
    review_date: review?.review_date || "",
    locales: review?.locales?.map((l) => ({
      locale: l.locale,
      content: l.content,
      company_name: l.company_name,
    })) || [
      {
        locale: "ru",
        content: "",
        company_name: "",
      },
    ],
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
  });

  const locales = watch("locales");

  // Sync form values when review loads/changes (for edit mode)
  useEffect(() => {
    if (isEditing && review) {
      reset({
        author_name: review.author_name || "",
        author_position: review.author_position || "",
        rating: review.rating ?? undefined, // Required field, use undefined if null
        case_id: review.case_id || null,
        is_featured: review.is_featured ?? false,
        sort_order: review.sort_order ?? null,
        review_date: review.review_date || "",
        locales: review.locales?.map((l) => ({
          locale: l.locale,
          content: l.content,
          company_name: l.company_name,
        })) || [
          {
            locale: "ru",
            content: "",
            company_name: "",
          },
        ],
      });
    }
  }, [review, isEditing, reset]);

  // Sync avatarUrl when review changes
  useEffect(() => {
    if (review?.author_avatar_url !== avatarUrl) {
      setAvatarUrl(review?.author_avatar_url || null);
    }
  }, [review?.author_avatar_url, avatarUrl]);

  const handleFormSubmit = (data: ReviewFormValues) => {
    // Get content from first locale (backend requires it at top level)
    const firstLocale = data.locales[0];
    const content = firstLocale?.content || "";

    const payload: CreateReviewDto = {
      author_name: data.author_name,
      author_position: data.author_position || undefined,
      rating: data.rating, // Required field (1-5)
      case_id: data.case_id || undefined,
      is_featured: data.is_featured ?? false,
      review_date: data.review_date || undefined,
      content: content, // Backend requires content at top level (min 10 chars)
      locales: data.locales.map((l) => ({
        locale: l.locale,
        content: l.content,
        company_name: l.company_name || undefined,
      })),
    };

    // Only include sort_order if it's a number (not null)
    if (data.sort_order !== null && data.sort_order !== undefined) {
      payload.sort_order = data.sort_order;
    }

    if (isEditing) {
      const updatePayload: UpdateReviewDto = {
        ...payload,
        case_id: data.case_id, // Can be null to unlink from case
        version: review.version,
      };
      onSubmit(updatePayload);
    } else {
      onSubmit(payload);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const result = await uploadAvatar.mutateAsync(file);
    setAvatarUrl(result.author_avatar_url);
  };

  const handleAvatarDelete = async () => {
    await deleteAvatar.mutateAsync();
    setAvatarUrl(null);
  };

  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      setValue("locales", [
        ...locales,
        {
          locale,
          content: "",
          company_name: "",
        },
      ]);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length > 1) {
      setValue(
        "locales",
        locales.filter((_, i) => i !== index),
      );
    }
  };

  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !locales.map((loc) => loc.locale).includes(l.value),
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Author info */}
      <Card>
        <CardHeader>
          <CardTitle>Информация об авторе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Имя автора"
              placeholder="Иван Петров"
              {...register("author_name")}
              error={errors.author_name?.message}
              required
            />
            <Input
              label="Должность"
              placeholder="CEO, Company Inc"
              {...register("author_position")}
              error={errors.author_position?.message}
            />
          </div>
          <ImageUpload
            label="Фотография"
            entityId={review?.id}
            currentImageUrl={avatarUrl}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            disabled={!isEditing}
            helpText={isEditing ? undefined : "Сохраните отзыв, чтобы загрузить фото"}
          />
        </CardContent>
      </Card>

      {/* Review settings */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки отзыва</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select
                  label="Рейтинг"
                  value={field.value === null || field.value === undefined ? "" : field.value.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || value === null || value === undefined) {
                      field.onChange(undefined); // Set undefined to trigger validation error
                    } else {
                      const num = parseInt(value, 10);
                      field.onChange(isNaN(num) ? undefined : num);
                    }
                  }}
                  onBlur={field.onBlur}
                  options={RATING_OPTIONS}
                  error={errors.rating?.message}
                />
              )}
            />
            <Input
              label="Дата отзыва"
              type="date"
              {...register("review_date")}
              error={errors.review_date?.message}
            />
            <Select
              label="Избранный"
              {...register("is_featured", {
                setValueAs: (v: string) => v === "true",
              })}
              options={[
                { value: "false", label: "Нет" },
                { value: "true", label: "Да" },
              ]}
            />
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Порядок сортировки"
                  value={field.value}
                  onChange={(val) => field.onChange(val === undefined ? null : val)}
                  min={0}
                  max={1000}
                  error={errors.sort_order?.message}
                />
              )}
            />
          </div>
          {/* Case selector */}
          <Controller
            name="case_id"
            control={control}
            render={({ field }) => (
              <CaseSelector
                value={field.value}
                onChange={(caseId) => field.onChange(caseId)}
                error={errors.case_id?.message}
                className="max-w-md"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Localizations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Локализации"
              actions={
                availableLocales.length > 0 ? (
                  <Select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addLocale(e.target.value);
                      }
                    }}
                    options={[{ value: "", label: "Добавить язык" }, ...availableLocales]}
                    minWidth="200px"
                  />
                ) : undefined
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={locales[0]?.locale || "ru"}>
            <TabsList>
              {locales.map((locale, index) => (
                <TabsTrigger key={locale.locale} value={locale.locale}>
                  {SUPPORTED_LOCALES.find((l) => l.value === locale.locale)?.label || locale.locale}
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

            {locales.map((locale, index) => (
              <TabsContent key={locale.locale} value={locale.locale}>
                <div className="space-y-4">
                  <input type="hidden" {...register(`locales.${index}.locale`)} />

                  <Textarea
                    label="Текст отзыва"
                    placeholder="Введите текст отзыва..."
                    {...register(`locales.${index}.content`)}
                    error={errors.locales?.[index]?.content?.message}
                    required
                    className="min-h-[150px]"
                  />

                  <Input
                    label="Название компании"
                    placeholder="ООО Компания"
                    {...register(`locales.${index}.company_name`)}
                    error={errors.locales?.[index]?.company_name?.message}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

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
