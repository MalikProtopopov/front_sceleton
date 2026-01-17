"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useInquiryForm, useUpdateInquiryForm, useDeleteInquiryForm } from "@/features/inquiry-forms";
import { Button, Input, NumberInput, Textarea, Select, Card, CardHeader, CardTitle, CardContent, Switch, Spinner, ConfirmModal } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { UpdateInquiryFormDto, FormField } from "@/entities/inquiry-form";
import { FIELD_TYPES } from "@/entities/inquiry-form";

const DEFAULT_FIELD: FormField = {
  name: "",
  type: "text",
  label: "",
  required: false,
};

export default function EditInquiryFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: form, isLoading, error } = useInquiryForm(id);
  const { mutate: updateForm, isPending: isUpdating } = useUpdateInquiryForm(id);
  const { mutate: deleteForm, isPending: isDeleting } = useDeleteInquiryForm();

  const [formData, setFormData] = useState<Partial<UpdateInquiryFormDto>>({});
  const [fields, setFields] = useState<FormField[]>([]);
  const [successMessage, setSuccessMessage] = useState<Record<string, string>>({ ru: "", en: "" });

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name,
        slug: form.slug,
        description: form.description || "",
        is_active: form.is_active,
        notification_email: form.notification_email || "",
        sort_order: form.sort_order,
      });
      setFields(form.fields_config?.fields || []);
      setSuccessMessage(form.success_message || { ru: "", en: "" });
    }
  }, [form]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !form) {
    notFound();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateForm({
      ...formData,
      fields_config: { fields },
      success_message: successMessage,
      version: form.version,
    } as UpdateInquiryFormDto);
  };

  const handleDelete = () => {
    deleteForm(id);
    setDeleteModalOpen(false);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates } as FormField;
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, { ...DEFAULT_FIELD }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{form.name}</h1>
          <p className="text-[var(--color-text-secondary)]">Редактирование формы обратной связи</p>
        </div>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Удалить
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Название"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                required
              />
            </div>
            <Textarea
              label="Описание"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email для уведомлений"
                type="email"
                value={formData.notification_email || ""}
                onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
              />
              <NumberInput
                label="Порядок сортировки"
                value={formData.sort_order ?? 0}
                onChange={(value) => setFormData({ ...formData, sort_order: value ?? 0 })}
              />
            </div>
            <Switch
              checked={formData.is_active ?? true}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
              label="Активна"
              description="Форма доступна для отправки заявок"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сообщение об успехе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Русский"
              value={successMessage.ru || ""}
              onChange={(e) => setSuccessMessage({ ...successMessage, ru: e.target.value })}
              placeholder="Спасибо! Мы свяжемся с вами в ближайшее время."
              rows={2}
            />
            <Textarea
              label="English"
              value={successMessage.en || ""}
              onChange={(e) => setSuccessMessage({ ...successMessage, en: e.target.value })}
              placeholder="Thank you! We will contact you soon."
              rows={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Поля формы</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addField}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Добавить поле
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] p-4"
              >
                <GripVertical className="mt-2 h-5 w-5 shrink-0 cursor-grab text-[var(--color-text-muted)]" />
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      label="Имя поля (name)"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="email"
                      required
                    />
                    <Select
                      label="Тип"
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FormField["type"] })}
                      options={FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    />
                    <Input
                      label="Подпись (label)"
                      value={field.label || ""}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={field.required || false}
                      onChange={(checked) => updateField(index, { required: checked })}
                      label="Обязательное"
                    />
                    {(field.type === "select" || field.type === "radio") && (
                      <Input
                        label="Варианты (через запятую)"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) => updateField(index, { 
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) 
                        })}
                        placeholder="Вариант 1, Вариант 2, Вариант 3"
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(index)}
                  className="text-[var(--color-error)] hover:text-[var(--color-error)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {!fields.length && (
              <p className="py-8 text-center text-[var(--color-text-muted)]">
                Нет полей. Нажмите «Добавить поле» чтобы создать первое поле формы.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.LEAD_FORMS)}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isUpdating}>
            Сохранить
          </Button>
        </div>
      </form>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить форму?"
        description={`Вы уверены, что хотите удалить форму "${form.name}"? Существующие заявки останутся, но потеряют связь с формой.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

