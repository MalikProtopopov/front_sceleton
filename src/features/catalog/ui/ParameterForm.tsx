"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Textarea, Select, Switch } from "@/shared/ui";
import { transliterate } from "@/shared/lib";
import { useUomsList } from "../model/useUoms";
import type {
  Parameter,
  ParameterCreate,
  ParameterUpdate,
  ParameterValueType,
  ParameterScope,
} from "@/entities/product";
import { PARAMETER_VALUE_TYPE_LABELS, PARAMETER_SCOPE_LABELS } from "@/entities/product";

interface ParameterFormProps {
  parameter?: Parameter;
  onSubmit: (data: ParameterCreate | ParameterUpdate) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  slug: string;
  value_type: ParameterValueType;
  scope: ParameterScope;
  uom_id: string;
  description: string;
  is_filterable: boolean;
  is_required: boolean;
  sort_order: number;
}

const VALUE_TYPE_OPTIONS = (Object.entries(PARAMETER_VALUE_TYPE_LABELS) as [ParameterValueType, string][]).map(
  ([value, label]) => ({ value, label }),
);

const SCOPE_OPTIONS = (Object.entries(PARAMETER_SCOPE_LABELS) as [ParameterScope, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function ParameterForm({ parameter, onSubmit, isSubmitting }: ParameterFormProps) {
  const [autoSlug, setAutoSlug] = useState(!parameter);
  const { data: uoms } = useUomsList();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: parameter?.name || "",
      slug: parameter?.slug || "",
      value_type: parameter?.value_type || "string",
      scope: parameter?.scope || "global",
      uom_id: parameter?.uom_id || "",
      description: parameter?.description || "",
      is_filterable: parameter?.is_filterable ?? false,
      is_required: parameter?.is_required ?? false,
      sort_order: parameter?.sort_order ?? 0,
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (autoSlug && name) {
      setValue("slug", transliterate(name));
    }
  }, [name, autoSlug, setValue]);

  const handleFormSubmit = (values: FormValues) => {
    if (parameter) {
      const dto: ParameterUpdate = {};
      if (values.name !== parameter.name) dto.name = values.name;
      if (values.slug !== parameter.slug) dto.slug = values.slug;
      if (values.description !== (parameter.description || ""))
        dto.description = values.description || undefined;
      if (values.uom_id !== (parameter.uom_id || "")) dto.uom_id = values.uom_id || null;
      if (values.scope !== parameter.scope) dto.scope = values.scope;
      if (values.is_filterable !== parameter.is_filterable) dto.is_filterable = values.is_filterable;
      if (values.is_required !== parameter.is_required) dto.is_required = values.is_required;
      if (values.sort_order !== parameter.sort_order) dto.sort_order = values.sort_order;
      onSubmit(dto);
    } else {
      const dto: ParameterCreate = {
        name: values.name,
        value_type: values.value_type,
        slug: values.slug || undefined,
        scope: values.scope,
        uom_id: values.uom_id || undefined,
        description: values.description || undefined,
        is_filterable: values.is_filterable,
        is_required: values.is_required,
        sort_order: values.sort_order,
      };
      onSubmit(dto);
    }
  };

  const uomOptions = [
    { value: "", label: "Не указана" },
    ...(uoms || []).filter((u) => u.is_active).map((u) => ({
      value: u.id,
      label: `${u.name} (${u.symbol || u.code})`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Название *"
          placeholder="Цвет, Вес, Напряжение..."
          error={errors.name?.message}
          {...register("name", { required: "Введите название" })}
        />
        <Input
          label="Slug"
          placeholder="tsvet"
          {...register("slug")}
          onFocus={() => setAutoSlug(false)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Select
          label="Тип значения *"
          options={VALUE_TYPE_OPTIONS}
          disabled={!!parameter}
          {...register("value_type")}
        />
        <Select label="Область" options={SCOPE_OPTIONS} {...register("scope")} />
        <Select label="Единица измерения" options={uomOptions} {...register("uom_id")} />
      </div>

      <Textarea
        label="Описание"
        placeholder="Описание параметра..."
        className="min-h-[80px]"
        {...register("description")}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <Input
          label="Порядок сортировки"
          type="number"
          {...register("sort_order", { valueAsNumber: true })}
        />
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={watch("is_filterable")}
            onChange={(checked: boolean) => setValue("is_filterable", checked)}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Фильтруемый</span>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={watch("is_required")}
            onChange={(checked: boolean) => setValue("is_required", checked)}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Обязательный</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {parameter ? "Сохранить" : "Создать параметр"}
        </Button>
      </div>
    </form>
  );
}
