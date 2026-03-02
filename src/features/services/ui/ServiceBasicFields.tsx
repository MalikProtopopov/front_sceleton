"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Input,
  NumberInput,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ImageUpload,
} from "@/shared/ui";
import type { Service } from "@/entities/service";
import type { CreateServiceFormValues } from "./ServiceForm";

interface ServiceBasicFieldsProps {
  form: UseFormReturn<CreateServiceFormValues>;
  service?: Service;
  imageUrl: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete: () => Promise<void>;
  isEditing: boolean;
}

export function ServiceBasicFields({
  form,
  service,
  imageUrl,
  onImageUpload,
  onImageDelete,
  isEditing,
}: ServiceBasicFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Основные настройки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Иконка (emoji)"
            placeholder="⚖️"
            {...form.register("icon")}
            error={form.formState.errors.icon?.message}
          />
          <Controller
            name="is_published"
            control={form.control}
            render={({ field }) => (
              <Select
                label="Статус"
                value={field.value ? "true" : "false"}
                onChange={(e) => field.onChange(e.target.value === "true")}
                onBlur={field.onBlur}
                options={[
                  { value: "false", label: "Черновик" },
                  { value: "true", label: "Опубликовано" },
                ]}
                error={form.formState.errors.is_published?.message}
              />
            )}
          />
        </div>
        <Controller
          name="sort_order"
          control={form.control}
          render={({ field }) => (
            <NumberInput
              label="Порядок сортировки"
              value={field.value}
              onChange={(val) => field.onChange(val === undefined ? null : val)}
              min={0}
              max={1000}
              error={form.formState.errors.sort_order?.message}
              className="max-w-xs"
            />
          )}
        />
        <ImageUpload
          label="Изображение"
          entityId={service?.id}
          currentImageUrl={imageUrl}
          onUpload={onImageUpload}
          onDelete={onImageDelete}
          disabled={!isEditing}
          helpText={isEditing ? undefined : "Сохраните услугу, чтобы загрузить"}
        />
      </CardContent>
    </Card>
  );
}
