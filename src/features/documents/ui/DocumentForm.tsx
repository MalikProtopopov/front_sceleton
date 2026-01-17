"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Upload, Trash2, Download } from "lucide-react";
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
  SectionHeader,
} from "@/shared/ui";
import { generateSlug, getMediaUrl } from "@/shared/lib";
import { useUploadDocumentFile, useDeleteDocumentFile } from "../model/useDocuments";
import type { Document, CreateDocumentDto, UpdateDocumentDto } from "@/entities/document";

// Validation schema
const localeSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Заголовок обязателен").max(200, "Максимум 200 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  excerpt: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  full_description: z.string().optional().nullable(),
  meta_title: z.string().max(60, "Максимум 60 символов").optional().nullable(),
  meta_description: z.string().max(160, "Максимум 160 символов").optional().nullable(),
});

const documentSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  document_version: z.string().max(50, "Максимум 50 символов").optional().nullable(),
  document_date: z.string().optional().nullable(),
  sort_order: z.number().min(0).optional().nullable(),
  locales: z.array(localeSchema).min(1, "Нужна хотя бы одна локализация"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  document?: Document;
  onSubmit: (data: CreateDocumentDto | UpdateDocumentDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export function DocumentForm({ document, onSubmit, isSubmitting = false }: DocumentFormProps) {
  const isEditing = !!document;
  const [fileUrl, setFileUrl] = useState<string | null>(document?.file_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload hooks
  const uploadFile = useUploadDocumentFile();
  const deleteFile = useDeleteDocumentFile();

  const defaultValues: DocumentFormValues = {
    status: document?.status || "draft",
    document_version: document?.document_version || null,
    document_date: document?.document_date?.split("T")[0] || null,
    sort_order: document?.sort_order ?? null,
    locales: document?.locales?.map((l) => ({
      locale: l.locale,
      title: l.title,
      slug: l.slug,
      excerpt: l.excerpt,
      full_description: l.full_description,
      meta_title: l.meta_title,
      meta_description: l.meta_description,
    })) || [
      {
        locale: "ru",
        title: "",
        slug: "",
        excerpt: "",
        full_description: "",
        meta_title: "",
        meta_description: "",
      },
    ],
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues,
  });

  const locales = watch("locales");

  // Sync fileUrl when document changes
  useEffect(() => {
    if (document?.file_url !== fileUrl) {
      setFileUrl(document?.file_url || null);
    }
  }, [document?.file_url, fileUrl]);

  const handleFormSubmit = (data: DocumentFormValues) => {
    const payload = {
      ...data,
      document_version: data.document_version || undefined,
      document_date: data.document_date || undefined,
      sort_order: data.sort_order ?? undefined,
      locales: data.locales.map((l) => ({
        ...l,
        excerpt: l.excerpt || undefined,
        full_description: l.full_description || undefined,
        meta_title: l.meta_title || undefined,
        meta_description: l.meta_description || undefined,
      })),
    };

    if (isEditing) {
      onSubmit({ ...payload, version: document.version } as UpdateDocumentDto);
    } else {
      onSubmit(payload as CreateDocumentDto);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && document?.id) {
      const result = await uploadFile.mutateAsync({ id: document.id, file });
      setFileUrl(result.file_url);
    }
  };

  const handleFileDelete = async () => {
    if (document?.id) {
      await deleteFile.mutateAsync(document.id);
      setFileUrl(null);
    }
  };

  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      setValue("locales", [
        ...locales,
        {
          locale,
          title: "",
          slug: "",
          excerpt: "",
          full_description: "",
          meta_title: "",
          meta_description: "",
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

  // Get available locales that haven't been added yet
  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !locales.map((loc) => loc.locale).includes(l.value),
  );

  // Get file name from URL
  const getFileName = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "document";
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic settings */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Статус"
            {...register("status")}
            options={[
              { value: "draft", label: "Черновик" },
              { value: "published", label: "Опубликовано" },
              { value: "archived", label: "В архиве" },
            ]}
            className="max-w-xs"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Версия документа"
              placeholder="1.0"
              {...register("document_version")}
              error={errors.document_version?.message}
            />
            <Input
              label="Дата документа"
              type="date"
              {...register("document_date")}
              error={errors.document_date?.message}
            />
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Порядок сортировки"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val === undefined ? null : val);
                  }}
                  min={0}
                  max={1000}
                  error={errors.sort_order?.message}
                />
              )}
            />
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Файл документа
            </label>
            {fileUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                <FileText className="h-8 w-8 text-[var(--color-accent-primary)]" />
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {getFileName(fileUrl)}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Файл загружен
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(getMediaUrl(fileUrl), "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleFileDelete}
                    isLoading={deleteFile.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isEditing
                    ? "cursor-pointer border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-secondary)]"
                    : "cursor-not-allowed border-[var(--color-border)] opacity-50"
                }`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                <Upload className="mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {isEditing
                    ? "Нажмите для загрузки файла (PDF, DOC, DOCX)"
                    : "Сохраните документ, чтобы загрузить файл"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={!isEditing || uploadFile.isPending}
                />
              </div>
            )}
            {uploadFile.isPending && (
              <p className="text-sm text-[var(--color-text-muted)]">Загрузка...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Localizations */}
      <Card>
        <CardHeader>
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

                  <Input
                    label="Заголовок"
                    placeholder="Введите заголовок"
                    {...register(`locales.${index}.title`, {
                      onChange: (e) => {
                        // Auto-generate slug from title
                        const slug = generateSlug(e.target.value);
                        setValue(`locales.${index}.slug`, slug);
                      },
                    })}
                    error={errors.locales?.[index]?.title?.message}
                    required
                  />

                  <Input
                    label="Slug"
                    placeholder="document-slug"
                    {...register(`locales.${index}.slug`)}
                    error={errors.locales?.[index]?.slug?.message}
                    required
                  />

                  <Textarea
                    label="Краткое описание"
                    placeholder="Краткое описание документа..."
                    {...register(`locales.${index}.excerpt`)}
                    error={errors.locales?.[index]?.excerpt?.message}
                  />

                  <Controller
                    name={`locales.${index}.full_description`}
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        label="Полное описание"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Полное описание документа..."
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
                        {...register(`locales.${index}.meta_title`)}
                        error={errors.locales?.[index]?.meta_title?.message}
                      />
                      <Textarea
                        label="Meta Description"
                        placeholder="SEO описание (до 160 символов)"
                        {...register(`locales.${index}.meta_description`)}
                        error={errors.locales?.[index]?.meta_description?.message}
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

