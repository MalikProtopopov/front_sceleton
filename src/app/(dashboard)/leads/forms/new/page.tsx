"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCreateInquiryForm } from "@/features/inquiry-forms";
import { Button, Input, NumberInput, Textarea, Select, Card, CardHeader, CardTitle, CardContent, Switch } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { CreateInquiryFormDto, FormField } from "@/entities/inquiry-form";
import { FIELD_TYPES } from "@/entities/inquiry-form";

const DEFAULT_FIELD: FormField = {
  name: "",
  type: "text",
  label: "",
  required: false,
};

export default function NewInquiryFormPage() {
  const router = useRouter();
  const { mutate: createForm, isPending } = useCreateInquiryForm();

  const [formData, setFormData] = useState<CreateInquiryFormDto>({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    notification_email: "",
    success_message: { ru: "", en: "" },
    fields_config: { fields: [{ ...DEFAULT_FIELD, name: "name", label: "Имя", required: true }] },
    sort_order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug обязателен";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Только строчные буквы, цифры и дефисы";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      createForm({
        ...formData,
        notification_email: formData.notification_email || undefined,
        description: formData.description || undefined,
      });
    }
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...(formData.fields_config?.fields || [])];
    newFields[index] = { ...newFields[index], ...updates } as FormField;
    setFormData({
      ...formData,
      fields_config: { fields: newFields },
    });
  };

  const addField = () => {
    const newFields = [...(formData.fields_config?.fields || []), { ...DEFAULT_FIELD }];
    setFormData({
      ...formData,
      fields_config: { fields: newFields },
    });
  };

  const removeField = (index: number) => {
    const newFields = (formData.fields_config?.fields || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields_config: { fields: newFields },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новая форма</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте форму обратной связи</p>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                error={errors.slug}
                required
              />
            </div>
            <Textarea
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email для уведомлений"
                type="email"
                value={formData.notification_email}
                onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
              />
              <NumberInput
                label="Порядок сортировки"
                value={formData.sort_order}
                onChange={(value) => setFormData({ ...formData, sort_order: value ?? 0 })}
              />
            </div>
            <Switch
              checked={formData.is_active}
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
              value={formData.success_message?.ru || ""}
              onChange={(e) => setFormData({
                ...formData,
                success_message: { ...formData.success_message, ru: e.target.value },
              })}
              placeholder="Спасибо! Мы свяжемся с вами в ближайшее время."
              rows={2}
            />
            <Textarea
              label="English"
              value={formData.success_message?.en || ""}
              onChange={(e) => setFormData({
                ...formData,
                success_message: { ...formData.success_message, en: e.target.value },
              })}
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
            {formData.fields_config?.fields.map((field, index) => (
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
                      checked={field.required}
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
            {!formData.fields_config?.fields.length && (
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
          <Button type="submit" isLoading={isPending}>
            Создать
          </Button>
        </div>
      </form>
    </div>
  );
}

