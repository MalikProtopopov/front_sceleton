"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
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
  SectionHeader,
  LocaleManager,
  ModalBody,
  ModalFooter,
  type LocaleFormRenderProps,
} from "@/shared/ui";
import {
  useCreateFAQLocale,
  useUpdateFAQLocale,
  useDeleteFAQLocale,
} from "../model/useFAQ";
import type { FAQ, FAQLocale, CreateFAQDto, UpdateFAQDto, CreateFAQLocaleDto } from "@/entities/faq";
import { FAQ_CATEGORIES } from "@/entities/faq";

// Validation schemas
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  question: z.string().min(1, "Вопрос обязателен").max(500, "Максимум 500 символов"),
  answer: z.string().min(1, "Ответ обязателен"),
});

const createFAQSchema = z.object({
  category: z.string().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

const editFAQSchema = z.object({
  category: z.string().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
});

type CreateFAQFormValues = z.infer<typeof createFAQSchema>;
type EditFAQFormValues = z.infer<typeof editFAQSchema>;

interface FAQFormProps {
  faq?: FAQ;
  onSubmit: (data: CreateFAQDto | UpdateFAQDto) => void;
  isSubmitting?: boolean;
}

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// =============================================
// FAQ Locale Form Component (for LocaleManager)
// =============================================
export function FAQLocaleForm({
  locale,
  selectedLang,
  onSubmit,
  onCancel,
  isLoading,
  isEditing,
}: LocaleFormRenderProps<FAQLocale & { id: string }>) {
  const [formData, setFormData] = useState({
    locale: selectedLang,
    question: locale?.question || "",
    answer: locale?.answer || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.question?.trim()) newErrors.question = "Вопрос обязателен";
    if (!formData.answer?.trim()) newErrors.answer = "Ответ обязателен";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      locale: selectedLang,
      question: formData.question,
      answer: formData.answer,
    } as FAQLocale & { id: string });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Textarea
            label="Вопрос"
            placeholder="Введите вопрос..."
            value={formData.question}
            onChange={(e) => handleChange("question", e.target.value)}
            error={errors.question}
            required
            className="min-h-[80px]"
          />
          <Textarea
            label="Ответ"
            placeholder="Введите ответ (поддерживается HTML)..."
            value={formData.answer}
            onChange={(e) => handleChange("answer", e.target.value)}
            error={errors.answer}
            required
            className="min-h-[200px]"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Отмена</Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>{isEditing ? "Сохранить" : "Добавить"}</Button>
      </ModalFooter>
    </>
  );
}

export function FAQForm({ faq, onSubmit, isSubmitting = false }: FAQFormProps) {
  const isEditing = !!faq;

  const createLocale = useCreateFAQLocale(faq?.id || "");
  const updateLocale = useUpdateFAQLocale(faq?.id || "");
  const deleteLocale = useDeleteFAQLocale(faq?.id || "");

  const createForm = useForm<CreateFAQFormValues>({
    resolver: zodResolver(createFAQSchema),
    defaultValues: {
      category: "",
      is_published: false,
      sort_order: null,
      locales: [{ locale: "ru", question: "", answer: "" }],
    },
  });

  const editForm = useForm<EditFAQFormValues>({
    resolver: zodResolver(editFAQSchema),
    defaultValues: {
      category: faq?.category || "",
      is_published: faq?.is_published ?? false,
      sort_order: faq?.sort_order ?? null,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEditing ? editForm : createForm) as any;
  const locales = isEditing ? [] : createForm.watch("locales");

  const handleFormSubmit = isEditing
    ? (data: EditFAQFormValues) => {
        onSubmit({ ...data, category: data.category || undefined, version: faq!.version } as UpdateFAQDto);
      }
    : (data: CreateFAQFormValues) => {
        onSubmit({ ...data, category: data.category || undefined } as CreateFAQDto);
      };

  const handleCreateLocale = async (data: Omit<FAQLocale & { id: string }, "id">) => {
    const apiData: CreateFAQLocaleDto = { locale: data.locale, question: data.question, answer: data.answer };
    await createLocale.mutateAsync(apiData);
  };
  const handleUpdateLocale = async (localeId: string, data: Partial<FAQLocale>) => {
    const apiData: Partial<CreateFAQLocaleDto> = { locale: data.locale, question: data.question, answer: data.answer };
    await updateLocale.mutateAsync({ localeId, data: apiData as CreateFAQLocaleDto });
  };
  const handleDeleteLocale = async (localeId: string) => { await deleteLocale.mutateAsync(localeId); };

  const addLocale = (locale: string) => {
    if (!locales.map((l) => l.locale).includes(locale)) {
      createForm.setValue("locales", [...locales, { locale, question: "", answer: "" }]);
    }
  };
  const removeLocale = (index: number) => { if (locales.length > 1) createForm.setValue("locales", locales.filter((_, i) => i !== index)); };

  const availableLocales = SUPPORTED_LOCALES.filter((l) => !locales.map((loc) => loc.locale).includes(l.value));

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Категория" {...form.register("category")} options={[{ value: "", label: "Без категории" }, ...FAQ_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))]} />
            <Select label="Статус" {...form.register("is_published", { setValueAs: (v: string) => v === "true" })} options={[{ value: "false", label: "Черновик" }, { value: "true", label: "Опубликовано" }]} />
            <Controller name="sort_order" control={form.control} render={({ field }) => (<NumberInput label="Порядок сортировки" value={field.value} onChange={(val) => field.onChange(val === undefined ? null : val)} min={0} max={1000} error={form.formState.errors.sort_order?.message} />)} />
          </div>
        </CardContent>
      </Card>

      {isEditing ? (
        <LocaleManager<FAQLocale & { id: string }> locales={faq.locales as (FAQLocale & { id: string })[]} supportedLocales={SUPPORTED_LOCALES} isEditing={true} onCreateLocale={handleCreateLocale} onUpdateLocale={handleUpdateLocale} onDeleteLocale={handleDeleteLocale} isCreating={createLocale.isPending} isUpdating={updateLocale.isPending} isDeleting={deleteLocale.isPending} getLocaleDisplayTitle={(locale) => locale.question.substring(0, 50) + (locale.question.length > 50 ? "..." : "")} renderLocaleForm={(props) => <FAQLocaleForm {...props} />} />
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
                    <Textarea label="Вопрос" placeholder="Введите вопрос..." {...createForm.register(`locales.${index}.question`)} error={createForm.formState.errors.locales?.[index]?.question?.message} required className="min-h-[80px]" />
                    <Textarea label="Ответ" placeholder="Введите ответ (поддерживается HTML)..." {...createForm.register(`locales.${index}.answer`)} error={createForm.formState.errors.locales?.[index]?.answer?.message} required className="min-h-[200px]" />
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
