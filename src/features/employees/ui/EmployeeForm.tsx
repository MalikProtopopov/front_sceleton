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
  RichTextEditor,
  ImageUpload,
  SectionHeader,
  LocaleManager,
  ModalBody,
  ModalFooter,
  type LocaleFormRenderProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import { useUploadEmployeePhoto, useDeleteEmployeePhoto } from "@/features/images";
import {
  useCreateEmployeeLocale,
  useUpdateEmployeeLocale,
  useDeleteEmployeeLocale,
} from "../model/useEmployees";
import type { Employee, EmployeeLocale, CreateEmployeeDto, UpdateEmployeeDto, CreateEmployeeLocaleDto } from "@/entities/employee";

// Validation schemas
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  first_name: z.string().min(1, "Имя обязательно").max(100, "Максимум 100 символов"),
  last_name: z.string().min(1, "Фамилия обязательна").max(100, "Максимум 100 символов"),
  position: z.string().max(200, "Максимум 200 символов").optional().nullable(),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  bio: z.string().optional().nullable(),
  meta_title: z.string().max(70, "Максимум 70 символов").optional().nullable(),
  meta_description: z.string().max(160, "Максимум 160 символов").optional().nullable(),
});

const createEmployeeSchema = z.object({
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  phone: z.string().max(50, "Максимум 50 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

const editEmployeeSchema = z.object({
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  phone: z.string().max(50, "Максимум 50 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
});

type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// =============================================
// Employee Locale Form Component (for LocaleManager)
// =============================================
export function EmployeeLocaleForm({
  locale,
  selectedLang,
  onSubmit,
  onCancel,
  isLoading,
  isEditing,
}: LocaleFormRenderProps<EmployeeLocale & { id: string }>) {
  const [formData, setFormData] = useState({
    locale: selectedLang,
    first_name: locale?.first_name || "",
    last_name: locale?.last_name || "",
    position: locale?.position || "",
    slug: locale?.slug || "",
    bio: locale?.bio || "",
    meta_title: locale?.meta_title || "",
    meta_description: locale?.meta_description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNameChange = (field: "first_name" | "last_name", value: string) => {
    handleChange(field, value);
    if (!isEditing) {
      const newFirstName = field === "first_name" ? value : formData.first_name;
      const newLastName = field === "last_name" ? value : formData.last_name;
      handleChange("slug", generateSlug(`${newFirstName} ${newLastName}`));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "Имя обязательно";
    if (!formData.last_name?.trim()) newErrors.last_name = "Фамилия обязательна";
    if (!formData.slug?.trim()) newErrors.slug = "Slug обязателен";
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = "Только a-z, 0-9 и дефис";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      locale: selectedLang,
      first_name: formData.first_name,
      last_name: formData.last_name,
      position: formData.position || undefined,
      slug: formData.slug,
      bio: formData.bio || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
    } as EmployeeLocale & { id: string });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Имя" placeholder="Иван" value={formData.first_name} onChange={(e) => handleNameChange("first_name", e.target.value)} error={errors.first_name} required />
            <Input label="Фамилия" placeholder="Петров" value={formData.last_name} onChange={(e) => handleNameChange("last_name", e.target.value)} error={errors.last_name} required />
          </div>
          <Input label="Должность" placeholder="Старший юрист" value={formData.position || ""} onChange={(e) => handleChange("position", e.target.value)} />
          <Input label="Slug" placeholder="ivan-petrov" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} error={errors.slug} required />
          <RichTextEditor label="Биография" value={formData.bio || ""} onChange={(val) => handleChange("bio", val)} placeholder="Описание сотрудника..." />
          <div className="border-t border-[var(--color-border)] pt-4">
            <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">SEO настройки</h4>
            <div className="space-y-4">
              <Input label="Meta Title" value={formData.meta_title || ""} onChange={(e) => handleChange("meta_title", e.target.value)} />
              <Textarea label="Meta Description" value={formData.meta_description || ""} onChange={(e) => handleChange("meta_description", e.target.value)} className="min-h-[80px]" />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Отмена</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>{isEditing ? "Сохранить" : "Добавить"}</Button>
      </ModalFooter>
    </>
  );
}

export function EmployeeForm({ employee, onSubmit, isSubmitting = false }: EmployeeFormProps) {
  const isEditing = !!employee;
  const [photoUrl, setPhotoUrl] = useState<string | null>(employee?.photo_url || null);

  const uploadPhoto = useUploadEmployeePhoto(employee?.id || "");
  const deletePhoto = useDeleteEmployeePhoto(employee?.id || "");

  const createLocale = useCreateEmployeeLocale(employee?.id || "");
  const updateLocale = useUpdateEmployeeLocale(employee?.id || "");
  const deleteLocale = useDeleteEmployeeLocale(employee?.id || "");

  const createForm = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      email: "", phone: "", is_published: false, sort_order: null,
      locales: [{ locale: "ru", first_name: "", last_name: "", position: "", slug: "", bio: "", meta_title: "", meta_description: "" }],
    },
  });

  const editForm = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      email: employee?.email || "", phone: employee?.phone || "",
      is_published: employee?.is_published ?? false, sort_order: employee?.sort_order ?? null,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEditing ? editForm : createForm) as any;
  const locales = isEditing ? [] : createForm.watch("locales");

  // Sync form values when employee loads/changes (for edit mode)
  useEffect(() => {
    if (isEditing && employee) {
      editForm.reset({
        email: employee.email || "",
        phone: employee.phone || "",
        is_published: employee.is_published ?? false,
        sort_order: employee.sort_order ?? null,
      });
    }
  }, [employee, isEditing, editForm]);

  // Sync photoUrl when employee changes
  useEffect(() => {
    if (employee?.photo_url !== photoUrl) {
      setPhotoUrl(employee?.photo_url || null);
    }
  }, [employee?.photo_url, photoUrl]);

  const handleFormSubmit = isEditing
    ? (data: EditEmployeeFormValues) => {
        onSubmit({ ...data, email: data.email || undefined, phone: data.phone || undefined, version: employee!.version } as UpdateEmployeeDto);
      }
    : (data: CreateEmployeeFormValues) => {
        onSubmit({ ...data, email: data.email || undefined, phone: data.phone || undefined, locales: data.locales.map((l) => ({ ...l, position: l.position || undefined, bio: l.bio || undefined, meta_title: l.meta_title || undefined, meta_description: l.meta_description || undefined })) } as CreateEmployeeDto);
      };

  const handlePhotoUpload = async (file: File) => { const result = await uploadPhoto.mutateAsync(file); setPhotoUrl(result.photo_url); };
  const handlePhotoDelete = async () => { await deletePhoto.mutateAsync(); setPhotoUrl(null); };
  const handleCreateLocale = async (data: Omit<EmployeeLocale & { id: string }, "id">) => {
    const apiData: CreateEmployeeLocaleDto = {
      locale: data.locale, first_name: data.first_name, last_name: data.last_name,
      position: data.position ?? undefined, slug: data.slug, bio: data.bio ?? undefined,
      meta_title: data.meta_title ?? undefined, meta_description: data.meta_description ?? undefined,
    };
    await createLocale.mutateAsync(apiData);
  };
  const handleUpdateLocale = async (localeId: string, data: Partial<EmployeeLocale>) => {
    const apiData: Partial<CreateEmployeeLocaleDto> = {
      locale: data.locale, first_name: data.first_name, last_name: data.last_name,
      position: data.position ?? undefined, slug: data.slug, bio: data.bio ?? undefined,
      meta_title: data.meta_title ?? undefined, meta_description: data.meta_description ?? undefined,
    };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateEmployeeLocaleDto });
  };
  const handleDeleteLocale = async (localeId: string) => { await deleteLocale.mutateAsync(localeId); };

  const addLocale = (locale: string) => {
    if (!locales.map((l) => l.locale).includes(locale)) {
      createForm.setValue("locales", [...locales, { locale, first_name: "", last_name: "", position: "", slug: "", bio: "", meta_title: "", meta_description: "" }]);
    }
  };
  const removeLocale = (index: number) => { if (locales.length > 1) createForm.setValue("locales", locales.filter((_, i) => i !== index)); };

  const availableLocales = SUPPORTED_LOCALES.filter((l) => !locales.map((loc) => loc.locale).includes(l.value));

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email" type="email" placeholder="john@company.com" {...form.register("email")} error={form.formState.errors.email?.message} />
            <Input label="Телефон" placeholder="+7 999 123-45-67" {...form.register("phone")} error={form.formState.errors.phone?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="is_published"
              control={form.control}
              render={({ field }) => (
                <Select
                  label="Статус"
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                  onBlur={field.onBlur}
                  options={[
                    { value: "false", label: "Черновик" },
                    { value: "true", label: "Опубликовано" },
                  ]}
                  error={form.formState.errors.is_published?.message}
                />
              )}
            />
            <Controller name="sort_order" control={form.control} render={({ field }) => (<NumberInput label="Порядок сортировки" value={field.value} onChange={(val) => field.onChange(val === undefined ? null : val)} min={0} max={1000} error={form.formState.errors.sort_order?.message} />)} />
          </div>
          <ImageUpload label="Фотография" entityId={employee?.id} currentImageUrl={photoUrl} onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} disabled={!isEditing} helpText={isEditing ? undefined : "Сохраните сотрудника, чтобы загрузить фото"} />
        </CardContent>
      </Card>

      {isEditing ? (
        <LocaleManager<EmployeeLocale & { id: string }> locales={employee.locales as (EmployeeLocale & { id: string })[]} supportedLocales={SUPPORTED_LOCALES} isEditing={true} onCreateLocale={handleCreateLocale} onUpdateLocale={handleUpdateLocale} onDeleteLocale={handleDeleteLocale} isCreating={createLocale.isPending} isUpdating={updateLocale.isPending} isDeleting={deleteLocale.isPending} getLocaleDisplayTitle={(locale) => `${locale.first_name} ${locale.last_name}`} renderLocaleForm={(props) => <EmployeeLocaleForm {...props} />} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <SectionHeader title="Локализации" actions={availableLocales.length > 0 ? (<Select value="" onChange={(e) => { if (e.target.value) addLocale(e.target.value); }} options={[{ value: "", label: "Добавить язык" }, ...availableLocales]} minWidth="200px" />) : undefined} />
            </div>
          </CardHeader>
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
                    <input type="hidden" {...createForm.register(`locales.${index}.locale`)} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Имя" placeholder="Иван" {...createForm.register(`locales.${index}.first_name`, { onChange: () => { const fn = createForm.watch(`locales.${index}.first_name`); const ln = createForm.watch(`locales.${index}.last_name`); createForm.setValue(`locales.${index}.slug`, generateSlug(`${fn} ${ln}`)); }})} error={createForm.formState.errors.locales?.[index]?.first_name?.message} required />
                      <Input label="Фамилия" placeholder="Петров" {...createForm.register(`locales.${index}.last_name`, { onChange: () => { const fn = createForm.watch(`locales.${index}.first_name`); const ln = createForm.watch(`locales.${index}.last_name`); createForm.setValue(`locales.${index}.slug`, generateSlug(`${fn} ${ln}`)); }})} error={createForm.formState.errors.locales?.[index]?.last_name?.message} required />
                    </div>
                    <Input label="Должность" placeholder="Старший юрист" {...createForm.register(`locales.${index}.position`)} error={createForm.formState.errors.locales?.[index]?.position?.message} />
                    <Input label="Slug" placeholder="ivan-petrov" {...createForm.register(`locales.${index}.slug`)} error={createForm.formState.errors.locales?.[index]?.slug?.message} required />
                    <Controller name={`locales.${index}.bio`} control={createForm.control} render={({ field }) => (<RichTextEditor label="Биография" value={field.value || ""} onChange={field.onChange} placeholder="Описание сотрудника..." />)} />
                    <div className="border-t border-[var(--color-border)] pt-4">
                      <h4 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">SEO настройки</h4>
                      <div className="space-y-4">
                        <Input label="Meta Title" placeholder="SEO заголовок (до 70 символов)" {...createForm.register(`locales.${index}.meta_title`)} error={createForm.formState.errors.locales?.[index]?.meta_title?.message} />
                        <Textarea label="Meta Description" placeholder="SEO описание (до 160 символов)" {...createForm.register(`locales.${index}.meta_description`)} error={createForm.formState.errors.locales?.[index]?.meta_description?.message} className="min-h-[80px]" />
                      </div>
                    </div>
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
