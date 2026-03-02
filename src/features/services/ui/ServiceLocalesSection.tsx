"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Button,
  Input,
  Textarea,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardContent,
  SectionHeader,
  ModalBody,
  ModalFooter,
  LocaleManager,
  type LocaleFormRenderProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import {
  useCreateServiceLocale,
  useUpdateServiceLocale,
  useDeleteServiceLocale,
} from "../model/useServices";
import type {
  Service,
  ServiceLocale,
  CreateServiceLocaleDto,
} from "@/entities/service";
import type { CreateServiceFormValues } from "./ServiceForm";

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// =============================================
// Service Locale Form (for LocaleManager render prop)
// =============================================
interface ServiceLocaleFormData extends Omit<CreateServiceLocaleDto, "locale"> {
  locale: string;
}

function ServiceLocaleForm({
  locale,
  selectedLang,
  onSubmit,
  onCancel,
  isLoading,
  isEditing,
}: LocaleFormRenderProps<ServiceLocale & { id: string }>) {
  const [formData, setFormData] = useState<ServiceLocaleFormData>({
    locale: selectedLang,
    title: locale?.title || "",
    slug: locale?.slug || "",
    short_description: locale?.short_description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ServiceLocaleFormData, value: string | null) => {
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
      newErrors.title = "Название обязательно";
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
      short_description: formData.short_description || undefined,
    } as ServiceLocale & { id: string });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Название"
            placeholder="Введите название услуги"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Slug"
            placeholder="service-slug"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            error={errors.slug}
            required
          />

          <Textarea
            label="Краткое описание"
            placeholder="Краткое описание услуги..."
            value={formData.short_description || ""}
            onChange={(e) => handleChange("short_description", e.target.value)}
          />
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

// =============================================
// Main Export
// =============================================
interface ServiceLocalesSectionProps {
  service?: Service;
  isEditing: boolean;
  form: UseFormReturn<CreateServiceFormValues>;
}

export function ServiceLocalesSection({
  service,
  isEditing,
  form,
}: ServiceLocalesSectionProps) {
  const createLocale = useCreateServiceLocale(service?.id || "");
  const updateLocale = useUpdateServiceLocale(service?.id || "");
  const deleteLocale = useDeleteServiceLocale(service?.id || "");

  const locales = isEditing ? [] : (form.watch("locales") || []);

  const handleCreateLocale = async (data: Omit<ServiceLocale & { id: string }, "id">) => {
    const apiData: CreateServiceLocaleDto = {
      locale: data.locale,
      title: data.title,
      slug: data.slug,
      short_description: data.short_description ?? undefined,
    };
    await createLocale.mutateAsync(apiData);
  };

  const handleUpdateLocale = async (localeId: string, data: Partial<ServiceLocale>) => {
    const apiData: Partial<CreateServiceLocaleDto> = {
      locale: data.locale,
      title: data.title,
      slug: data.slug,
      short_description: data.short_description ?? undefined,
    };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateServiceLocaleDto });
  };

  const handleDeleteLocale = async (localeId: string) => {
    await deleteLocale.mutateAsync(localeId);
  };

  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      form.setValue("locales", [
        ...locales,
        {
          locale,
          title: "",
          slug: "",
          short_description: "",
        },
      ]);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length > 1) {
      form.setValue(
        "locales",
        locales.filter((_: unknown, i: number) => i !== index),
      );
    }
  };

  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !locales.map((loc) => loc.locale).includes(l.value),
  );

  if (isEditing && service) {
    return (
      <LocaleManager<ServiceLocale & { id: string }>
        locales={service.locales as (ServiceLocale & { id: string })[]}
        supportedLocales={SUPPORTED_LOCALES}
        isEditing={true}
        onCreateLocale={handleCreateLocale}
        onUpdateLocale={handleUpdateLocale}
        onDeleteLocale={handleDeleteLocale}
        isCreating={createLocale.isPending}
        isUpdating={updateLocale.isPending}
        isDeleting={deleteLocale.isPending}
        getLocaleDisplayTitle={(locale) => locale.title}
        renderLocaleForm={(props) => <ServiceLocaleForm {...props} />}
      />
    );
  }

  return (
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
                <input type="hidden" {...form.register(`locales.${index}.locale`)} />

                <Input
                  label="Название"
                  placeholder="Введите название услуги"
                  {...form.register(`locales.${index}.title`, {
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const slug = generateSlug(e.target.value);
                      form.setValue(`locales.${index}.slug`, slug);
                    },
                  })}
                  error={form.formState.errors.locales?.[index]?.title?.message}
                  required
                />

                <Input
                  label="Slug"
                  placeholder="service-slug"
                  {...form.register(`locales.${index}.slug`)}
                  error={form.formState.errors.locales?.[index]?.slug?.message}
                  required
                />

                <Textarea
                  label="Краткое описание"
                  placeholder="Краткое описание услуги..."
                  {...form.register(`locales.${index}.short_description`)}
                  error={form.formState.errors.locales?.[index]?.short_description?.message}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
