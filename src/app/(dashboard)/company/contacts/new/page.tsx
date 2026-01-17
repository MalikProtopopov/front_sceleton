"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateContact } from "@/features/company";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Switch } from "@/shared/ui";

const formSchema = z.object({ type: z.enum(["phone", "email", "social"]), label: z.string().optional(), value: z.string().min(1, "Значение обязательно"), icon: z.string().optional(), sort_order: z.number().min(0), is_primary: z.boolean() });
type FormValues = z.infer<typeof formSchema>;

export default function NewContactPage() {
  const { mutate: create, isPending } = useCreateContact();
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: "phone", label: "", value: "", icon: "", sort_order: 0, is_primary: false },
  });

  const onSubmit = (data: FormValues) => create({ type: data.type, label: data.label || undefined, value: data.value, icon: data.icon || undefined, sort_order: data.sort_order, is_primary: data.is_primary });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый контакт</h1></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card><CardHeader><CardTitle>Контактная информация</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Тип контакта" {...register("type")} options={[{ value: "phone", label: "Телефон" }, { value: "email", label: "Email" }, { value: "social", label: "Соцсети" }]} />
            <Input label="Метка" placeholder="Основной / Поддержка" {...register("label")} />
          </div>
          <Input label="Значение" placeholder="+7 (999) 123-45-67" {...register("value")} error={errors.value?.message} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Иконка" placeholder="phone" {...register("icon")} />
            <Input label="Порядок сортировки" type="number" {...register("sort_order", { valueAsNumber: true })} />
          </div>
          <Controller name="is_primary" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Основной контакт" />} />
        </CardContent></Card>
        <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button><Button type="submit" isLoading={isPending}>Создать</Button></div>
      </form>
    </div>
  );
}

