"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAddress } from "@/features/company";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from "@/shared/ui";

const localeSchema = z.object({ locale: z.string(), name: z.string().min(1), address_line: z.string().min(1), city: z.string().min(1), country: z.string().min(1), region: z.string().optional() });
const formSchema = z.object({ postal_code: z.string().optional(), latitude: z.number().nullable().optional(), longitude: z.number().nullable().optional(), sort_order: z.number().min(0), is_primary: z.boolean(), locales: z.array(localeSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function NewAddressPage() {
  const { mutate: create, isPending } = useCreateAddress();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { postal_code: "", latitude: null, longitude: null, sort_order: 0, is_primary: false, locales: [{ locale: "ru", name: "", address_line: "", city: "", country: "Россия", region: "" }] },
  });
  const locales = watch("locales");
  const onSubmit = (data: FormValues) => create({ postal_code: data.postal_code || undefined, latitude: data.latitude || undefined, longitude: data.longitude || undefined, sort_order: data.sort_order, is_primary: data.is_primary, locales: data.locales.map((l) => ({ locale: l.locale, name: l.name, address_line: l.address_line, city: l.city, country: l.country, region: l.region || undefined })) });
  const addLocale = () => { if (!locales.find((l) => l.locale === "en")) setValue("locales", [...locales, { locale: "en", name: "", address_line: "", city: "", country: "Russia", region: "" }]); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый адрес</h1></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card><CardHeader><CardTitle>Основные настройки</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3"><Input label="Почтовый индекс" {...register("postal_code")} /><Input label="Широта" type="number" step="any" {...register("latitude", { valueAsNumber: true })} /><Input label="Долгота" type="number" step="any" {...register("longitude", { valueAsNumber: true })} /></div>
          <div className="grid gap-4 md:grid-cols-2"><Input label="Порядок сортировки" type="number" {...register("sort_order", { valueAsNumber: true })} /><Controller name="is_primary" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Основной адрес" />} /></div>
        </CardContent></Card>
        <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Локализации</CardTitle>{!locales.find((l) => l.locale === "en") && <Button type="button" variant="secondary" size="sm" onClick={addLocale}>+ English</Button>}</div></CardHeader><CardContent>
          <Tabs defaultValue="ru"><TabsList>{locales.map((l) => <TabsTrigger key={l.locale} value={l.locale}>{l.locale === "ru" ? "Русский" : "English"}</TabsTrigger>)}</TabsList>
            {locales.map((locale, index) => <TabsContent key={locale.locale} value={locale.locale}><div className="space-y-4"><input type="hidden" {...register(`locales.${index}.locale`)} /><Input label="Название" {...register(`locales.${index}.name`)} error={errors.locales?.[index]?.name?.message} required /><Input label="Адрес" {...register(`locales.${index}.address_line`)} error={errors.locales?.[index]?.address_line?.message} required /><div className="grid gap-4 md:grid-cols-3"><Input label="Город" {...register(`locales.${index}.city`)} required /><Input label="Регион" {...register(`locales.${index}.region`)} /><Input label="Страна" {...register(`locales.${index}.country`)} required /></div></div></TabsContent>)}
          </Tabs>
        </CardContent></Card>
        <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button><Button type="submit" isLoading={isPending}>Создать</Button></div>
      </form>
    </div>
  );
}

