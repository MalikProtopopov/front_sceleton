"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContact, useUpdateContact, useDeleteContact } from "@/features/company";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Switch, Spinner, ConfirmModal } from "@/shared/ui";

const formSchema = z.object({ type: z.enum(["phone", "email", "social"]), label: z.string().optional(), value: z.string().min(1), icon: z.string().optional(), sort_order: z.number().min(0), is_primary: z.boolean() });
type FormValues = z.infer<typeof formSchema>;

export default function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { data: item, isLoading, error } = useContact(id);
  const { mutate: update, isPending: isUpdating } = useUpdateContact(id);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteContact();
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: item ? { type: item.type, label: item.label || "", value: item.value, icon: item.icon || "", sort_order: item.sort_order, is_primary: item.is_primary } : undefined,
  });

  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center"><Spinner size="lg" /></div>;
  if (error || !item) notFound();

  const onSubmit = (data: FormValues) => update({ type: data.type, label: data.label || undefined, value: data.value, icon: data.icon || undefined, sort_order: data.sort_order, is_primary: data.is_primary, version: item.version });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{item.value}</h1></div><Button variant="danger" onClick={() => setDeleteModalOpen(true)}>Удалить</Button></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card><CardHeader><CardTitle>Контактная информация</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Тип контакта" {...register("type")} options={[{ value: "phone", label: "Телефон" }, { value: "email", label: "Email" }, { value: "social", label: "Соцсети" }]} />
            <Input label="Метка" {...register("label")} />
          </div>
          <Input label="Значение" {...register("value")} error={errors.value?.message} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Иконка" {...register("icon")} />
            <Input label="Порядок" type="number" {...register("sort_order", { valueAsNumber: true })} />
          </div>
          <Controller name="is_primary" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Основной контакт" />} />
        </CardContent></Card>
        <div className="flex justify-end gap-4"><Button type="button" variant="secondary" onClick={() => window.history.back()}>Отмена</Button><Button type="submit" isLoading={isUpdating}>Сохранить</Button></div>
      </form>
      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={() => deleteItem(id)} title="Удалить контакт?" description={`Вы уверены, что хотите удалить "${item.value}"?`} confirmText="Удалить" variant="danger" isLoading={isDeleting} />
    </div>
  );
}

