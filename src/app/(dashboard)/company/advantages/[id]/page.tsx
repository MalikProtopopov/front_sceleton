"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdvantage, useUpdateAdvantage, useDeleteAdvantage } from "@/features/company";
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Switch, Spinner, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";

const localeSchema = z.object({ locale: z.string(), title: z.string().min(1), description: z.string().optional() });
const formSchema = z.object({ icon: z.string().optional(), sort_order: z.number().min(0), is_active: z.boolean(), locales: z.array(localeSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function EditAdvantagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { data: item, isLoading, error } = useAdvantage(id);
  const { mutate: update, isPending: isUpdating } = useUpdateAdvantage(id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteAdvantage();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: item ? { icon: item.icon || "", sort_order: item.sort_order, is_active: item.is_active, locales: item.locales.map((l) => ({ locale: l.locale, title: l.title, description: l.description || "" })) } : undefined,
  });

  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center"><Spinner size="lg" /></div>;
  if (error || !item) notFound();

  const locales = watch("locales") || [];
  const onSubmit = (data: FormValues) => update({ icon: data.icon || undefined, sort_order: data.sort_order, is_active: data.is_active, locales: data.locales.map((l) => ({ locale: l.locale, title: l.title, description: l.description || undefined })), version: item.version });
  const addLocale = () => { if (!locales.find((l) => l.locale === "en")) setValue("locales", [...locales, { locale: "en", title: "", description: "" }]); };
  const getTitle = () => item.locales?.find((l) => l.locale === "ru")?.title || item.locales?.[0]?.title || "Преимущество";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{getTitle()}</h1><p className="mt-1 text-sm text-[var(--color-text-muted)]">Создано: {formatDateTime(item.created_at)}</p></div><Button variant="danger" onClick={() => setDeleteModalOpen(true)}>Удалить</Button></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card><CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2"><Input label="Иконка" {...register("icon")} /><Input label="Порядок сортировки" type="number" {...register("sort_order", { valueAsNumber: true })} /></div>
          <Controller name="is_active" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Активно" />} />
        </CardContent></Card>
        <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Локализации</CardTitle>{!locales.find((l) => l.locale === "en") && <Button type="button" variant="secondary" size="sm" onClick={addLocale}>+ English</Button>}</div></CardHeader><CardContent>
          <Tabs defaultValue="ru"><TabsList>{locales.map((l) => <TabsTrigger key={l.locale} value={l.locale}>{l.locale === "ru" ? "Русский" : "English"}</TabsTrigger>)}</TabsList>
            {locales.map((locale, index) => <TabsContent key={locale.locale} value={locale.locale}><div className="space-y-4"><input type="hidden" {...register(`locales.${index}.locale`)} /><Input label="Название" {...register(`locales.${index}.title`)} error={errors.locales?.[index]?.title?.message} required /><Textarea label="Описание" {...register(`locales.${index}.description`)} /></div></TabsContent>)}
          </Tabs>
        </CardContent></Card>
        <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button><Button type="submit" isLoading={isUpdating}>Сохранить</Button></div>
      </form>
      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={() => deleteItem(id)} title="Удалить преимущество?" description={`Вы уверены, что хотите удалить "${getTitle()}"?`} confirmText="Удалить" variant="danger" isLoading={isDeleting} />
    </div>
  );
}

