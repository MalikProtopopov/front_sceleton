"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
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
  Switch,
  ImageUpload,
  SectionHeader,
  LocaleManager,
  ContactsManager,
  ContentBlocksManager,
  TextBlockEditor,
  ImageBlockEditor,
  VideoBlockEditor,
  GalleryBlockEditor,
  LinkBlockEditor,
  ResultBlockEditor,
  ModalBody,
  ModalFooter,
  type LocaleFormRenderProps,
  type BlockEditorProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import { useUploadCaseCoverImage, useDeleteCaseCoverImage } from "@/features/images";
import {
  useCreateCaseLocale,
  useUpdateCaseLocale,
  useDeleteCaseLocale,
  useCreateCaseContact,
  useUpdateCaseContact,
  useDeleteCaseContact,
  useCaseContentBlocks,
  useCreateCaseContentBlock,
  useUpdateCaseContentBlock,
  useDeleteCaseContentBlock,
  useReorderCaseContentBlocks,
} from "../model/useCases";
import type { CreateContentBlockDto, UpdateContentBlockDto } from "@/entities/content-block";
import type { Case, CaseLocale, CreateCaseDto, UpdateCaseDto, CreateCaseLocaleDto, CreateContactDto, UpdateContactDto } from "@/entities/case";
import type { Service } from "@/entities/service";

// Validation schemas
// Note: description, results, meta_title, meta_description removed - managed via content blocks and SEO routes
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Заголовок обязателен").max(255, "Максимум 255 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  excerpt: z.string().max(500, "Максимум 500 символов").optional().nullable(),
});

const createCaseSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  client_name: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
  project_year: z.number().min(1900).max(2100).optional().nullable(),
  project_duration: z.string().max(100, "Максимум 100 символов").optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  service_ids: z.array(z.string()).optional(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

const editCaseSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  client_name: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
  project_year: z.number().min(1900).max(2100).optional().nullable(),
  project_duration: z.string().max(100, "Максимум 100 символов").optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  service_ids: z.array(z.string()).optional(),
});

type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

interface CaseFormProps {
  caseItem?: Case;
  services?: Service[];
  onSubmit: (data: CreateCaseDto | UpdateCaseDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// =============================================
// Case Locale Form Component (for LocaleManager)
// =============================================
export function CaseLocaleForm({
  locale,
  selectedLang,
  onSubmit,
  onCancel,
  isLoading,
  isEditing,
}: LocaleFormRenderProps<CaseLocale & { id: string }>) {
  // Note: description, results, meta_title, meta_description removed - managed via content blocks and SEO routes
  const [formData, setFormData] = useState({
    locale: selectedLang,
    title: locale?.title || "",
    slug: locale?.slug || "",
    excerpt: locale?.excerpt || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | null) => {
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
    if (!formData.title?.trim()) newErrors.title = "Заголовок обязателен";
    if (!formData.slug?.trim()) newErrors.slug = "Slug обязателен";
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = "Только a-z, 0-9 и дефис";
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
    } as CaseLocale & { id: string });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input label="Заголовок" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} error={errors.title} required />
          <Input label="Slug" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} error={errors.slug} required />
          <Textarea label="Краткое описание" value={formData.excerpt || ""} onChange={(e) => handleChange("excerpt", e.target.value)} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Отмена</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>{isEditing ? "Сохранить" : "Добавить"}</Button>
      </ModalFooter>
    </>
  );
}

export function CaseForm({ caseItem, services = [], onSubmit, isSubmitting = false }: CaseFormProps) {
  const isEditing = !!caseItem;
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(caseItem?.cover_image_url || null);

  const uploadCoverImage = useUploadCaseCoverImage(caseItem?.id || "");
  const deleteCoverImage = useDeleteCaseCoverImage(caseItem?.id || "");

  const createLocale = useCreateCaseLocale(caseItem?.id || "");
  const updateLocale = useUpdateCaseLocale(caseItem?.id || "");
  const deleteLocale = useDeleteCaseLocale(caseItem?.id || "");

  const createContact = useCreateCaseContact(caseItem?.id || "");
  const updateContact = useUpdateCaseContact(caseItem?.id || "");
  const deleteContact = useDeleteCaseContact(caseItem?.id || "");

  // Selected locale for content blocks
  const [selectedBlocksLocale, setSelectedBlocksLocale] = useState("ru");

  // Load content blocks separately
  const { data: contentBlocks = [], isLoading: isLoadingBlocks } = useCaseContentBlocks(
    caseItem?.id || "",
    undefined // Load all locales, filter in UI
  );

  const createContentBlock = useCreateCaseContentBlock(caseItem?.id || "");
  const updateContentBlock = useUpdateCaseContentBlock(caseItem?.id || "");
  const deleteContentBlock = useDeleteCaseContentBlock(caseItem?.id || "");
  const reorderContentBlocks = useReorderCaseContentBlocks(caseItem?.id || "");

  const form = useForm<CreateCaseFormValues>({
    resolver: zodResolver(isEditing ? editCaseSchema : createCaseSchema) as unknown as Resolver<CreateCaseFormValues>,
    defaultValues: isEditing
      ? {
          status: caseItem?.status || "draft", client_name: caseItem?.client_name || "",
          project_year: caseItem?.project_year || null, project_duration: caseItem?.project_duration || "",
          is_featured: caseItem?.is_featured || false, sort_order: caseItem?.sort_order ?? null,
          service_ids: caseItem?.services?.map((s) => s.service_id) || [], locales: [],
        }
      : {
          status: "draft", client_name: "", project_year: null, project_duration: "",
          is_featured: false, sort_order: null, service_ids: [],
          locales: [{ locale: "ru", title: "", slug: "", excerpt: "" }],
        },
  });

  const locales = isEditing ? [] : form.watch("locales");

  // Sync form values when caseItem loads/changes (for edit mode)
  useEffect(() => {
    if (isEditing && caseItem) {
      form.reset({
        status: caseItem.status || "draft",
        client_name: caseItem.client_name || "",
        project_year: caseItem.project_year || null,
        project_duration: caseItem.project_duration || "",
        is_featured: caseItem.is_featured || false,
        sort_order: caseItem.sort_order ?? null,
        service_ids: caseItem.services?.map((s) => s.service_id) || [],
        locales: [],
      });
    }
  }, [caseItem, isEditing, form]);

  // Sync coverImageUrl when caseItem changes
  useEffect(() => {
    if (caseItem?.cover_image_url !== coverImageUrl) {
      setCoverImageUrl(caseItem?.cover_image_url || null);
    }
  }, [caseItem?.cover_image_url, coverImageUrl]);

  const handleFormSubmit = (data: CreateCaseFormValues) => {
    if (isEditing) {
      const payload: UpdateCaseDto = {
        status: data.status,
        client_name: data.client_name || undefined,
        project_year: data.project_year || undefined,
        project_duration: data.project_duration || undefined,
        is_featured: data.is_featured,
        service_ids: data.service_ids,
        version: caseItem!.version,
      };
      if (data.sort_order !== null && data.sort_order !== undefined) {
        payload.sort_order = data.sort_order;
      }
      onSubmit(payload);
    } else {
      const payload: CreateCaseDto = {
        status: data.status,
        client_name: data.client_name || undefined,
        project_year: data.project_year || undefined,
        project_duration: data.project_duration || undefined,
        is_featured: data.is_featured,
        service_ids: data.service_ids,
        locales: data.locales.map((l) => ({
          locale: l.locale,
          title: l.title,
          slug: l.slug,
          excerpt: l.excerpt || undefined,
        })),
      };
      if (data.sort_order !== null && data.sort_order !== undefined) {
        payload.sort_order = data.sort_order;
      }
      onSubmit(payload);
    }
  };

  const handleImageUpload = async (file: File) => { const result = await uploadCoverImage.mutateAsync(file); setCoverImageUrl(result.cover_image_url); };
  const handleImageDelete = async () => { await deleteCoverImage.mutateAsync(); setCoverImageUrl(null); };
  const handleCreateLocale = async (data: Omit<CaseLocale & { id: string }, "id">) => {
    const apiData: CreateCaseLocaleDto = {
      locale: data.locale, title: data.title, slug: data.slug,
      excerpt: data.excerpt ?? undefined,
    };
    await createLocale.mutateAsync(apiData);
  };
  const handleUpdateLocale = async (localeId: string, data: Partial<CaseLocale>) => {
    const apiData: Partial<CreateCaseLocaleDto> = {
      locale: data.locale, title: data.title, slug: data.slug,
      excerpt: data.excerpt ?? undefined,
    };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateCaseLocaleDto });
  };
  const handleDeleteLocale = async (localeId: string) => { await deleteLocale.mutateAsync(localeId); };

  // Contact handlers
  const handleCreateContact = async (data: CreateContactDto) => { await createContact.mutateAsync(data); };
  const handleUpdateContact = async (contactId: string, data: UpdateContactDto) => { await updateContact.mutateAsync({ contactId, data }); };
  const handleDeleteContact = async (contactId: string) => { await deleteContact.mutateAsync(contactId); };

  // Content Block handlers
  const handleCreateContentBlock = async (data: CreateContentBlockDto) => { await createContentBlock.mutateAsync(data); };
  const handleUpdateContentBlock = async (blockId: string, data: UpdateContentBlockDto) => { await updateContentBlock.mutateAsync({ blockId, data }); };
  const handleDeleteContentBlock = async (blockId: string) => { await deleteContentBlock.mutateAsync(blockId); };
  const handleReorderContentBlocks = async (blockIds: string[]) => { await reorderContentBlocks.mutateAsync({ locale: selectedBlocksLocale, block_ids: blockIds }); };

  // Block editor renderer
  const renderBlockEditor = (props: BlockEditorProps) => {
    switch (props.blockType) {
      case "text": return <TextBlockEditor {...props} />;
      case "image": return <ImageBlockEditor {...props} />;
      case "video": return <VideoBlockEditor {...props} />;
      case "gallery": return <GalleryBlockEditor {...props} />;
      case "link": return <LinkBlockEditor {...props} />;
      case "result": return <ResultBlockEditor {...props} />;
      default: return null;
    }
  };

  const addLocale = (locale: string) => {
    if (!locales.map((l) => l.locale).includes(locale)) {
      form.setValue("locales", [...locales, { locale, title: "", slug: "", excerpt: "" }]);
    }
  };
  const removeLocale = (index: number) => { if (locales.length > 1) form.setValue("locales", locales.filter((_, i) => i !== index)); };

  const availableLocales = SUPPORTED_LOCALES.filter((l) => !locales.map((loc) => loc.locale).includes(l.value));
  const serviceOptions = services.map((service) => ({ value: service.id, label: service.locales.find((l) => l.locale === "ru")?.title || service.id }));

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader>
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
            <Input label="Название клиента" placeholder="Acme Corp" {...form.register("client_name")} error={form.formState.errors.client_name?.message} />
            <Input label="Год проекта" type="number" placeholder="2024" {...form.register("project_year", { valueAsNumber: true })} error={form.formState.errors.project_year?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Длительность проекта" placeholder="3 месяца" {...form.register("project_duration")} error={form.formState.errors.project_duration?.message} />
            <Controller name="sort_order" control={form.control} render={({ field }) => (<NumberInput label="Порядок сортировки" value={field.value} onChange={(val) => field.onChange(val === undefined ? null : val)} min={0} max={1000} error={form.formState.errors.sort_order?.message} />)} />
          </div>
          <Controller name="is_featured" control={form.control} render={({ field }) => (<Switch checked={field.value || false} onChange={field.onChange} label="Выделенный кейс" description="Отображается на главной странице" />)} />
          {serviceOptions.length > 0 && (
            <Controller name="service_ids" control={form.control} render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Связанные услуги</label>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((option) => {
                    const isSelected = field.value?.includes(option.value);
                    return (<button key={option.value} type="button" onClick={() => field.onChange(isSelected ? field.value?.filter((v: string) => v !== option.value) || [] : [...(field.value || []), option.value])} className={`rounded-full px-3 py-1 text-sm transition-colors ${isSelected ? "bg-[var(--color-accent-primary)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"}`}>{option.label}</button>);
                  })}
                </div>
              </div>
            )} />
          )}
          <ImageUpload label="Обложка" entityId={caseItem?.id} currentImageUrl={coverImageUrl} onUpload={handleImageUpload} onDelete={handleImageDelete} disabled={!isEditing} helpText={isEditing ? undefined : "Сохраните кейс, чтобы загрузить обложку"} />
        </CardContent>
      </Card>

      {isEditing ? (
        <>
          <LocaleManager<CaseLocale & { id: string }> locales={caseItem.locales as (CaseLocale & { id: string })[]} supportedLocales={SUPPORTED_LOCALES} isEditing={true} onCreateLocale={handleCreateLocale} onUpdateLocale={handleUpdateLocale} onDeleteLocale={handleDeleteLocale} isCreating={createLocale.isPending} isUpdating={updateLocale.isPending} isDeleting={deleteLocale.isPending} getLocaleDisplayTitle={(locale) => locale.title} renderLocaleForm={(props) => <CaseLocaleForm {...props} />} />
          <ContactsManager
            contacts={caseItem.contacts || []}
            isEditing={true}
            onCreateContact={handleCreateContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            isCreating={createContact.isPending}
            isUpdating={updateContact.isPending}
            isDeleting={deleteContact.isPending}
            title="Контакты клиента"
          />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Контент-блоки</CardTitle>
                <Select
                  value={selectedBlocksLocale}
                  onChange={(e) => setSelectedBlocksLocale(e.target.value)}
                  options={SUPPORTED_LOCALES}
                  minWidth="150px"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBlocks ? (
                <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">Загрузка блоков...</div>
              ) : (
                <ContentBlocksManager
                  blocks={contentBlocks}
                  locale={selectedBlocksLocale}
                  isEditing={true}
                  onCreateBlock={handleCreateContentBlock}
                  onUpdateBlock={handleUpdateContentBlock}
                  onDeleteBlock={handleDeleteContentBlock}
                  onReorderBlocks={handleReorderContentBlocks}
                  isCreating={createContentBlock.isPending}
                  isUpdating={updateContentBlock.isPending}
                  isDeleting={deleteContentBlock.isPending}
                  renderBlockEditor={renderBlockEditor}
                  title=""
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader><SectionHeader title="Локализации" actions={availableLocales.length > 0 ? (<Select value="" onChange={(e) => { if (e.target.value) addLocale(e.target.value); }} options={[{ value: "", label: "Добавить язык" }, ...availableLocales]} minWidth="200px" />) : undefined} /></CardHeader>
          <CardContent>
            <Tabs defaultValue={locales[0]?.locale || "ru"}>
              <TabsList>
                {locales.map((locale, index) => (
                  <TabsTrigger key={locale.locale} value={locale.locale}>
                    {SUPPORTED_LOCALES.find((l) => l.value === locale.locale)?.label || locale.locale}
                    {locales.length > 1 && (<span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); removeLocale(index); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeLocale(index); }}} className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] cursor-pointer">×</span>)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {locales.map((locale, index) => (
                <TabsContent key={locale.locale} value={locale.locale}>
                  <div className="space-y-4">
                    <input type="hidden" {...form.register(`locales.${index}.locale`)} />
                    <Input label="Заголовок" placeholder="Введите заголовок" {...form.register(`locales.${index}.title`, { onChange: (e) => form.setValue(`locales.${index}.slug`, generateSlug(e.target.value)) })} error={form.formState.errors.locales?.[index]?.title?.message} required />
                    <Input label="Slug" placeholder="case-slug" {...form.register(`locales.${index}.slug`)} error={form.formState.errors.locales?.[index]?.slug?.message} required />
                    <Textarea label="Краткое описание" placeholder="Краткое описание кейса..." {...form.register(`locales.${index}.excerpt`)} error={form.formState.errors.locales?.[index]?.excerpt?.message} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button>
        <Button type="submit" isLoading={isSubmitting}>{isEditing ? "Сохранить" : "Создать"}</Button>
      </div>
    </form>
  );
}
