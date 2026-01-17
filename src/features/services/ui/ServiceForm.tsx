"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, X } from "lucide-react";
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
  Modal,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  LocaleManager,
  type LocaleFormRenderProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import { useUploadServiceImage, useDeleteServiceImage } from "@/features/images";
import {
  useAddServicePrice,
  useUpdateServicePrice,
  useDeleteServicePrice,
  useAddServiceTag,
  useDeleteServiceTag,
  useCreateServiceLocale,
  useUpdateServiceLocale,
  useDeleteServiceLocale,
} from "../model/useServices";
import type {
  Service,
  ServiceLocale,
  CreateServiceDto,
  UpdateServiceDto,
  CreateServiceLocaleDto,
  ServicePrice,
  ServiceTag,
  ServiceCurrency,
} from "@/entities/service";

// Validation schema for create form (minimal locale)
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Название обязательно").max(255, "Максимум 255 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  short_description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  description: z.string().optional().nullable(),
  meta_title: z.string().max(70, "Максимум 70 символов").optional().nullable(),
  meta_description: z.string().max(160, "Максимум 160 символов").optional().nullable(),
  meta_keywords: z.string().max(255, "Максимум 255 символов").optional().nullable(),
});

const createServiceSchema = z.object({
  icon: z.string().max(10, "Максимум 10 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

// Validation schema for edit form (no locales in form - managed separately)
const editServiceSchema = z.object({
  icon: z.string().max(10, "Максимум 10 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
type EditServiceFormValues = z.infer<typeof editServiceSchema>;

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: CreateServiceDto | UpdateServiceDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const SUPPORTED_CURRENCIES: { value: ServiceCurrency; label: string }[] = [
  { value: "RUB", label: "RUB" },
  { value: "USD", label: "USD" },
];

// =============================================
// Service Locale Form Component (for LocaleManager)
// =============================================
interface ServiceLocaleFormData extends Omit<CreateServiceLocaleDto, 'locale'> {
  locale: string;
}

export function ServiceLocaleForm({
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
    description: locale?.description || "",
    meta_title: locale?.meta_title || "",
    meta_description: locale?.meta_description || "",
    meta_keywords: locale?.meta_keywords || "",
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
      description: formData.description || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      meta_keywords: formData.meta_keywords || undefined,
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

          <RichTextEditor
            label="Полное описание"
            value={formData.description || ""}
            onChange={(val) => handleChange("description", val)}
            placeholder="Подробное описание услуги..."
          />

          {/* SEO fields */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">
              SEO настройки
            </h4>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                placeholder="SEO заголовок (до 70 символов)"
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
              <Input
                label="Meta Keywords"
                placeholder="ключевые, слова, через, запятую"
                value={formData.meta_keywords || ""}
                onChange={(e) => handleChange("meta_keywords", e.target.value)}
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

// =============================================
// Price Modal Component
// =============================================
interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { locale: string; price: number; currency: ServiceCurrency }) => void;
  price?: ServicePrice | null;
  isLoading?: boolean;
  existingLocales: string[];
}

function PriceModal({ isOpen, onClose, onSubmit, price, isLoading, existingLocales }: PriceModalProps) {
  const [locale, setLocale] = useState(price?.locale || existingLocales[0] || "ru");
  const [priceValue, setPriceValue] = useState(price?.price?.toString() || "");
  const [currency, setCurrency] = useState<ServiceCurrency>(price?.currency || "RUB");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const numValue = parseFloat(priceValue);
    if (isNaN(numValue) || numValue < 0) {
      setError("Введите корректную цену");
      return;
    }
    setError("");
    onSubmit({ locale, price: numValue, currency });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={price ? "Редактировать цену" : "Добавить цену"}
      size="sm"
    >
      <ModalBody>
        <div className="space-y-4">
          <Select
            label="Локаль"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            options={SUPPORTED_LOCALES.filter((l) => existingLocales.includes(l.value))}
            disabled={!!price}
          />
          <Input
            label="Цена"
            type="number"
            step="0.01"
            min="0"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            error={error}
            required
          />
          <Select
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as ServiceCurrency)}
            options={SUPPORTED_CURRENCIES}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {price ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// =============================================
// Prices Section Component
// =============================================
interface PricesSectionProps {
  serviceId: string;
  prices: ServicePrice[];
  existingLocales: string[];
}

function PricesSection({ serviceId, prices, existingLocales }: PricesSectionProps) {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);
  const [deletingPrice, setDeletingPrice] = useState<ServicePrice | null>(null);

  const addPrice = useAddServicePrice(serviceId);
  const updatePrice = useUpdateServicePrice(serviceId);
  const deletePrice = useDeleteServicePrice(serviceId);

  const handleAddPrice = (data: { locale: string; price: number; currency: ServiceCurrency }) => {
    addPrice.mutate(data, {
      onSuccess: () => {
        setPriceModalOpen(false);
      },
    });
  };

  const handleUpdatePrice = (data: { locale: string; price: number; currency: ServiceCurrency }) => {
    if (!editingPrice) return;
    updatePrice.mutate(
      { priceId: editingPrice.id, data: { price: data.price, currency: data.currency } },
      {
        onSuccess: () => {
          setEditingPrice(null);
        },
      }
    );
  };

  const handleDeletePrice = () => {
    if (!deletingPrice) return;
    deletePrice.mutate(deletingPrice.id, {
      onSuccess: () => {
        setDeletingPrice(null);
      },
    });
  };

  // Group prices by locale
  const pricesByLocale = prices.reduce<Record<string, ServicePrice[]>>((acc, price) => {
    const existing = acc[price.locale] ?? [];
    acc[price.locale] = [...existing, price];
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-4">
        {existingLocales.map((locale) => {
          const localePrices = pricesByLocale[locale] || [];
          const localeLabel = SUPPORTED_LOCALES.find((l) => l.value === locale)?.label || locale;
          
          return (
            <div key={locale} className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                {localeLabel}
              </div>
              {localePrices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {localePrices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
                    >
                      <span className="font-medium">
                        {price.price.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} {price.currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPrice(price)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPrice(price)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-text-muted)]">
                  Цены не заданы
                </div>
              )}
            </div>
          );
        })}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setPriceModalOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить цену
        </Button>
      </div>

      {/* Add Price Modal */}
      <PriceModal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        onSubmit={handleAddPrice}
        isLoading={addPrice.isPending}
        existingLocales={existingLocales}
      />

      {/* Edit Price Modal */}
      <PriceModal
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        onSubmit={handleUpdatePrice}
        price={editingPrice}
        isLoading={updatePrice.isPending}
        existingLocales={existingLocales}
      />

      {/* Delete Price Confirmation */}
      <ConfirmModal
        isOpen={!!deletingPrice}
        onClose={() => setDeletingPrice(null)}
        onConfirm={handleDeletePrice}
        title="Удалить цену?"
        description={`Вы уверены, что хотите удалить цену ${deletingPrice?.price} ${deletingPrice?.currency}?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deletePrice.isPending}
      />
    </>
  );
}

// =============================================
// Tags Section Component
// =============================================
interface TagsSectionProps {
  serviceId: string;
  tags: ServiceTag[];
  existingLocales: string[];
}

function TagsSection({ serviceId, tags, existingLocales }: TagsSectionProps) {
  const [newTag, setNewTag] = useState("");
  const [selectedLocale, setSelectedLocale] = useState(existingLocales[0] || "ru");
  const [deletingTag, setDeletingTag] = useState<ServiceTag | null>(null);

  const addTag = useAddServiceTag(serviceId);
  const deleteTag = useDeleteServiceTag(serviceId);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    addTag.mutate(
      { locale: selectedLocale, tag: trimmedTag },
      {
        onSuccess: () => {
          setNewTag("");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = () => {
    if (!deletingTag) return;
    deleteTag.mutate(deletingTag.id, {
      onSuccess: () => {
        setDeletingTag(null);
      },
    });
  };

  // Group tags by locale
  const tagsByLocale = tags.reduce<Record<string, ServiceTag[]>>((acc, tag) => {
    const existing = acc[tag.locale] ?? [];
    acc[tag.locale] = [...existing, tag];
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-4">
        {existingLocales.map((locale) => {
          const localeTags = tagsByLocale[locale] || [];
          const localeLabel = SUPPORTED_LOCALES.find((l) => l.value === locale)?.label || locale;
          
          return (
            <div key={locale} className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                {localeLabel}
              </div>
              {localeTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {localeTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)]/10 px-3 py-1 text-sm text-[var(--color-accent-primary)]"
                    >
                      {tag.tag}
                      <button
                        type="button"
                        onClick={() => setDeletingTag(tag)}
                        className="rounded-full hover:bg-[var(--color-accent-primary)]/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-text-muted)]">
                  Теги не заданы
                </div>
              )}
            </div>
          );
        })}
        
        {/* Add tag input */}
        <div className="flex items-end gap-2">
          <Select
            label="Локаль"
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            options={SUPPORTED_LOCALES.filter((l) => existingLocales.includes(l.value))}
            className="w-32"
          />
          <Input
            label="Новый тег"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите тег и нажмите Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTag}
            disabled={!newTag.trim() || addTag.isPending}
            isLoading={addTag.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Delete Tag Confirmation */}
      <ConfirmModal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleDeleteTag}
        title="Удалить тег?"
        description={`Вы уверены, что хотите удалить тег "${deletingTag?.tag}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deleteTag.isPending}
      />
    </>
  );
}

// =============================================
// Main ServiceForm Component
// =============================================
export function ServiceForm({ service, onSubmit, isSubmitting = false }: ServiceFormProps) {
  const isEditing = !!service;
  const [imageUrl, setImageUrl] = useState<string | null>(service?.cover_image_url || null);

  // Image upload hooks
  const uploadImage = useUploadServiceImage(service?.id || "");
  const deleteImage = useDeleteServiceImage(service?.id || "");

  // Locale management hooks (only for editing)
  const createLocale = useCreateServiceLocale(service?.id || "");
  const updateLocale = useUpdateServiceLocale(service?.id || "");
  const deleteLocale = useDeleteServiceLocale(service?.id || "");

  // Form for creating new service (with initial locale)
  const createForm = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      icon: "",
      is_published: false,
      sort_order: null,
      locales: [
        {
          locale: "ru",
          title: "",
          slug: "",
          short_description: "",
          description: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
        },
      ],
    },
  });

  // Form for editing existing service (no locales - managed separately)
  const editForm = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      icon: service?.icon || "",
      is_published: service?.is_published ?? false,
      sort_order: service?.sort_order ?? null,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEditing ? editForm : createForm) as any;
  const locales = isEditing ? [] : createForm.watch("locales");

  const handleFormSubmit = isEditing
    ? (data: EditServiceFormValues) => {
        const payload: UpdateServiceDto = {
          ...data,
          icon: data.icon || undefined,
          sort_order: data.sort_order ?? undefined,
          version: service!.version,
        };
        onSubmit(payload);
      }
    : (data: CreateServiceFormValues) => {
        const payload: CreateServiceDto = {
          ...data,
          icon: data.icon || undefined,
          sort_order: data.sort_order ?? undefined,
          locales: data.locales.map((l) => ({
            ...l,
            short_description: l.short_description || undefined,
            description: l.description || undefined,
            meta_title: l.meta_title || undefined,
            meta_description: l.meta_description || undefined,
            meta_keywords: l.meta_keywords || undefined,
          })),
        };
        onSubmit(payload);
      };

  const handleImageUpload = async (file: File) => {
    const result = await uploadImage.mutateAsync(file);
    setImageUrl(result.cover_image_url);
  };

  const handleImageDelete = async () => {
    await deleteImage.mutateAsync();
    setImageUrl(null);
  };

  // Locale management handlers
  const handleCreateLocale = async (data: Omit<ServiceLocale & { id: string }, "id">) => {
    const apiData: CreateServiceLocaleDto = {
      locale: data.locale, title: data.title, slug: data.slug,
      short_description: data.short_description ?? undefined,
      description: data.description ?? undefined,
      meta_title: data.meta_title ?? undefined, meta_description: data.meta_description ?? undefined,
      meta_keywords: data.meta_keywords ?? undefined,
    };
    await createLocale.mutateAsync(apiData);
  };

  const handleUpdateLocale = async (localeId: string, data: Partial<ServiceLocale>) => {
    const apiData: Partial<CreateServiceLocaleDto> = {
      locale: data.locale, title: data.title, slug: data.slug,
      short_description: data.short_description ?? undefined,
      description: data.description ?? undefined,
      meta_title: data.meta_title ?? undefined, meta_description: data.meta_description ?? undefined,
      meta_keywords: data.meta_keywords ?? undefined,
    };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateServiceLocaleDto });
  };

  const handleDeleteLocale = async (localeId: string) => {
    await deleteLocale.mutateAsync(localeId);
  };

  // For create mode: locale management in form
  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      createForm.setValue("locales", [
        ...locales,
        {
          locale,
          title: "",
          slug: "",
          short_description: "",
          description: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
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

  // Get existing locale codes for prices/tags sections
  const existingLocaleCodes = isEditing
    ? service.locales.map((l) => l.locale)
    : locales.map((l) => l.locale);

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-6">
      {/* Basic settings */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Иконка (emoji)"
              placeholder="⚖️"
              {...form.register("icon")}
              error={form.formState.errors.icon?.message}
            />
            <Select
              label="Статус"
              {...form.register("is_published", {
                setValueAs: (v: string) => v === "true",
              })}
              options={[
                { value: "false", label: "Черновик" },
                { value: "true", label: "Опубликовано" },
              ]}
            />
          </div>
          <Controller
            name="sort_order"
            control={form.control}
            render={({ field }) => (
              <NumberInput
                label="Порядок сортировки"
                value={field.value}
                onChange={(val) => field.onChange(val === undefined ? null : val)}
                min={0}
                max={1000}
                error={form.formState.errors.sort_order?.message}
                className="max-w-xs"
              />
            )}
          />
          <ImageUpload
            label="Изображение"
            entityId={service?.id}
            currentImageUrl={imageUrl}
            onUpload={handleImageUpload}
            onDelete={handleImageDelete}
            disabled={!isEditing}
            helpText={isEditing ? undefined : "Сохраните услугу, чтобы загрузить"}
          />
        </CardContent>
      </Card>

      {/* Localizations - different UI for create vs edit */}
      {isEditing ? (
        // Edit mode: use LocaleManager
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
      ) : (
        // Create mode: use tabs form
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
                    <input type="hidden" {...createForm.register(`locales.${index}.locale`)} />

                    <Input
                      label="Название"
                      placeholder="Введите название услуги"
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
                      placeholder="service-slug"
                      {...createForm.register(`locales.${index}.slug`)}
                      error={createForm.formState.errors.locales?.[index]?.slug?.message}
                      required
                    />

                    <Textarea
                      label="Краткое описание"
                      placeholder="Краткое описание услуги..."
                      {...createForm.register(`locales.${index}.short_description`)}
                      error={createForm.formState.errors.locales?.[index]?.short_description?.message}
                    />

                    <Controller
                      name={`locales.${index}.description`}
                      control={createForm.control}
                      render={({ field }) => (
                        <RichTextEditor
                          label="Полное описание"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Подробное описание услуги..."
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
                          placeholder="SEO заголовок (до 70 символов)"
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
                        <Input
                          label="Meta Keywords"
                          placeholder="ключевые, слова, через, запятую"
                          {...createForm.register(`locales.${index}.meta_keywords`)}
                          error={createForm.formState.errors.locales?.[index]?.meta_keywords?.message}
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

      {/* Prices Section */}
      <Card>
        <CardHeader>
          <CardTitle>Цены</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <PricesSection
              serviceId={service.id}
              prices={service.prices || []}
              existingLocales={existingLocaleCodes}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Сохраните услугу, чтобы добавить цены
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle>Теги</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <TagsSection
              serviceId={service.id}
              tags={service.tags || []}
              existingLocales={existingLocaleCodes}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Сохраните услугу, чтобы добавить теги
            </p>
          )}
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
