"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAdvantage } from "@/features/company";
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from "@/shared/ui";

const localeSchema = z.object({ locale: z.string(), title: z.string().min(1, "Название обязательно"), description: z.string().optional() });
const formSchema = z.object({ icon: z.string().optional(), sort_order: z.number().min(0), is_active: z.boolean(), locales: z.array(localeSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function NewAdvantagePage() {
  const { mutate: create, isPending } = useCreateAdvantage();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { icon: "", sort_order: 0, is_active: true, locales: [{ locale: "ru", title: "", description: "" }] },
  });
  const locales = watch("locales");

  const onSubmit = (data: FormValues) => create({ icon: data.icon || undefined, sort_order: data.sort_order, is_active: data.is_active, locales: data.locales.map((l) => ({ locale: l.locale, title: l.title, description: l.description || undefined })) });
  const addLocale = () => { if (!locales.find((l) => l.locale === "en")) setValue("locales", [...locales, { locale: "en", title: "", description: "" }]); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новое преимущество</h1><p className="text-[var(--color-text-secondary)]">Создайте новое преимущество компании</p></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card><CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2"><Input label="Иконка" placeholder="award" {...register("icon")} /><Input label="Порядок сортировки" type="number" {...register("sort_order", { valueAsNumber: true })} /></div>
          <Controller name="is_active" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Активно" />} />
        </CardContent></Card>
        <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Локализации</CardTitle>{!locales.find((l) => l.locale === "en") && <Button type="button" variant="secondary" size="sm" onClick={addLocale}>+ English</Button>}</div></CardHeader><CardContent>
          <Tabs defaultValue="ru"><TabsList>{locales.map((l) => <TabsTrigger key={l.locale} value={l.locale}>{l.locale === "ru" ? "Русский" : "English"}</TabsTrigger>)}</TabsList>
            {locales.map((locale, index) => <TabsContent key={locale.locale} value={locale.locale}><div className="space-y-4"><input type="hidden" {...register(`locales.${index}.locale`)} /><Input label="Название" {...register(`locales.${index}.title`)} error={errors.locales?.[index]?.title?.message} required /><Textarea label="Описание" {...register(`locales.${index}.description`)} /></div></TabsContent>)}
          </Tabs>
        </CardContent></Card>
        <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button><Button type="submit" isLoading={isPending}>Создать</Button></div>
      </form>
    </div>
  );
}

