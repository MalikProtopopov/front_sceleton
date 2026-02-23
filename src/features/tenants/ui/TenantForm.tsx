"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Button, Switch, ConfirmModal } from "@/shared/ui";
import type { CreateTenantDto, UpdateTenantDto, Tenant } from "@/entities/tenant";

interface TenantFormValues {
  name: string;
  slug: string;
  is_active: boolean;
  contact_email: string;
  contact_phone: string;
  primary_color: string;
}

interface TenantFormProps {
  tenant?: Tenant;
  isSubmitting?: boolean;
  onSubmit: (data: CreateTenantDto | UpdateTenantDto) => void;
  onCancel: () => void;
}

export function TenantForm({ tenant, isSubmitting, onSubmit, onCancel }: TenantFormProps) {
  const isEdit = !!tenant;
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TenantFormValues>({
    defaultValues: {
      name: tenant?.name || "",
      slug: tenant?.slug || "",
      is_active: tenant?.is_active ?? true,
      contact_email: tenant?.contact_email || "",
      contact_phone: tenant?.contact_phone || "",
      primary_color: tenant?.primary_color || "#6366f1",
    },
  });

  const handleFormSubmit = (values: TenantFormValues) => {
    if (isEdit && tenant) {
      const updateData: UpdateTenantDto = {
        name: values.name,
        is_active: values.is_active,
        contact_email: values.contact_email || undefined,
        contact_phone: values.contact_phone || undefined,
        primary_color: values.primary_color || undefined,
        version: tenant.version,
      };
      onSubmit(updateData);
    } else {
      const createData: CreateTenantDto = {
        name: values.name,
        slug: values.slug,
        is_active: values.is_active,
        contact_email: values.contact_email || undefined,
        contact_phone: values.contact_phone || undefined,
        primary_color: values.primary_color || undefined,
      };
      onSubmit(createData);
    }
  };

  const handleActiveToggle = (checked: boolean, onChange: (v: boolean) => void) => {
    if (!checked && isEdit) {
      setShowDeactivateConfirm(true);
    } else {
      onChange(checked);
    }
  };

  const confirmDeactivate = (onChange: (v: boolean) => void) => {
    onChange(false);
    setShowDeactivateConfirm(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Название"
            required
            error={errors.name?.message}
            {...register("name", { required: "Введите название организации" })}
          />
          <Input
            label="Slug"
            required
            disabled={isEdit}
            hint={isEdit ? "Slug нельзя изменить" : "Уникальный идентификатор (латиница, дефис)"}
            error={errors.slug?.message}
            {...register("slug", {
              required: "Введите slug",
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: "Только строчные латинские буквы, цифры и дефис",
              },
            })}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Email для связи"
            type="email"
            placeholder="admin@example.com"
            error={errors.contact_email?.message}
            {...register("contact_email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Некорректный email",
              },
            })}
          />
          <Input
            label="Телефон для связи"
            placeholder="+7 (999) 123-45-67"
            error={errors.contact_phone?.message}
            {...register("contact_phone")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
            Основной цвет
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-11 w-16 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-1"
              {...register("primary_color")}
            />
            <Input
              placeholder="#6366f1"
              error={errors.primary_color?.message}
              {...register("primary_color", {
                pattern: {
                  value: /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/,
                  message: "Некорректный HEX-цвет",
                },
              })}
            />
          </div>
        </div>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <>
              <Switch
                checked={field.value}
                onChange={(checked) => handleActiveToggle(checked, field.onChange)}
                label="Активный проект"
                description="Неактивные проекты блокируют доступ всех пользователей"
              />
              <ConfirmModal
                isOpen={showDeactivateConfirm}
                onClose={() => {
                  setShowDeactivateConfirm(false);
                }}
                onConfirm={() => confirmDeactivate(field.onChange)}
                title="Деактивировать организацию?"
                description="Все пользователи организации потеряют доступ. Продолжить?"
                confirmText="Деактивировать"
                variant="danger"
              />
            </>
          )}
        />

        <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : isEdit ? "Сохранить" : "Создать проект"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </>
  );
}
