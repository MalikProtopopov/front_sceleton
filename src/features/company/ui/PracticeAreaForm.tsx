"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  SectionHeader,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import type { PracticeArea, CreatePracticeAreaDto, UpdatePracticeAreaDto } from "@/entities/company";

// Validation schema
const localeSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен"),
  description: z.string().optional().nullable(),
});

const practiceAreaSchema = z.object({
  icon: z.string().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  is_active: z.boolean(),
  locales: z.array(localeSchema).min(1, "Нужна хотя бы одна локализация"),
});

type PracticeAreaFormValues = z.infer<typeof practiceAreaSchema>;

interface PracticeAreaFormProps {
  practiceArea?: PracticeArea;
  onSubmit: (data: CreatePracticeAreaDto | UpdatePracticeAreaDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export function PracticeAreaForm({ practiceArea, onSubmit, isSubmitting = false }: PracticeAreaFormProps) {
  const isEditing = !!practiceArea;

  const defaultValues: PracticeAreaFormValues = {
    icon: practiceArea?.icon || "",
    sort_order: practiceArea?.sort_order ?? 0,
    is_active: practiceArea?.is_active ?? true,
    locales: practiceArea?.locales?.map((l) => ({
      locale: l.locale,
      title: l.title,
      slug: l.slug,
      description: l.description || "",
    })) || [
      {
        locale: "ru",
        title: "",
        slug: "",
        description: "",
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
  } = useForm<PracticeAreaFormValues>({
    resolver: zodResolver(practiceAreaSchema),
    defaultValues,
  });

  const locales = watch("locales");

  // Sync form values when practiceArea loads/changes (for edit mode)
  useEffect(() => {
    if (isEditing && practiceArea) {
      reset({
        icon: practiceArea.icon || "",
        sort_order: practiceArea.sort_order ?? 0,
        is_active: practiceArea.is_active ?? true,
        locales: practiceArea.locales?.map((l) => ({
          locale: l.locale,
          title: l.title,
          slug: l.slug,
          description: l.description || "",
        })) || [
          {
            locale: "ru",
            title: "",
            slug: "",
            description: "",
          },
        ],
      });
    }
  }, [practiceArea, isEditing, reset]);

  const handleFormSubmit = (data: PracticeAreaFormValues) => {
    const payload: CreatePracticeAreaDto = {
      icon: data.icon || undefined,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active,
      locales: data.locales.map((l) => ({
        locale: l.locale,
        title: l.title,
        slug: l.slug,
        description: l.description || undefined,
      })),
    };

    if (isEditing) {
      onSubmit({ ...payload, version: practiceArea.version } as UpdatePracticeAreaDto);
    } else {
      onSubmit(payload);
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
          description: "",
        },
      ]);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length > 1) {
      setValue(
        "locales",
        locales.filter((_, i) => i !== index)
      );
    }
  };

  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !locales.map((loc) => loc.locale).includes(l.value)
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic settings */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Иконка (класс или URL)"
              placeholder="briefcase"
              {...register("icon")}
              error={errors.icon?.message}
            />
            <Input
              label="Порядок сортировки"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              error={errors.sort_order?.message}
            />
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                label="Активно"
                description="Неактивные направления не отображаются на сайте"
              />
            )}
          />
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
                        if (e.key === "Enter" || e.key === " ") {
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
                    label="Название"
                    placeholder="Корпоративное право"
                    {...register(`locales.${index}.title`, {
                      onChange: (e) => {
                        // Auto-generate slug from title
                        setValue(`locales.${index}.slug`, generateSlug(e.target.value));
                      },
                    })}
                    error={errors.locales?.[index]?.title?.message}
                    required
                  />

                  <Input
                    label="Slug"
                    placeholder="corporate-law"
                    {...register(`locales.${index}.slug`)}
                    error={errors.locales?.[index]?.slug?.message}
                    required
                  />

                  <Textarea
                    label="Описание"
                    placeholder="Описание направления деятельности..."
                    {...register(`locales.${index}.description`)}
                    error={errors.locales?.[index]?.description?.message}
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
