"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, Textarea, Switch, Select, NumberInput } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { PublicModule, CreateModuleDto, ModuleCategory } from "@/entities/billing";
import { categoryLabels } from "../lib/billingConstants";

interface ModuleFormProps {
  module?: PublicModule;
  onSubmit: (data: CreateModuleDto) => void;
  isLoading?: boolean;
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
  value,
  label,
}));

export function ModuleForm({ module, onSubmit, isLoading }: ModuleFormProps) {
  const router = useRouter();
  const isEdit = !!module;

  const [slug, setSlug] = useState(module?.slug ?? "");
  const [name, setName] = useState(module?.name ?? "");
  const [nameRu, setNameRu] = useState(module?.name_ru ?? "");
  const [description, setDescription] = useState(module?.description ?? "");
  const [descriptionRu, setDescriptionRu] = useState(module?.description_ru ?? "");
  const [category, setCategory] = useState<ModuleCategory>(module?.category ?? "platform");
  const [priceMonthly, setPriceMonthly] = useState(module?.price_monthly_kopecks ?? 0);
  const [isBase, setIsBase] = useState(module?.is_base ?? false);
  const [sortOrder, setSortOrder] = useState(module?.sort_order ?? 0);

  const num = (setter: (v: number) => void) => (v: number | null | undefined) =>
    setter(v ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      slug,
      name,
      name_ru: nameRu,
      description,
      description_ru: descriptionRu,
      category,
      price_monthly_kopecks: priceMonthly,
      is_base: isBase,
      sort_order: sortOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Слаг"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={isEdit}
            />
            <Input
              label="Название (EN)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Название (RU)"
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value)}
              required
            />
            <Select
              label="Категория"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value as ModuleCategory)}
              required
            />
            <NumberInput
              label="Цена, коп./мес"
              value={priceMonthly}
              onChange={num(setPriceMonthly)}
              min={0}
              hint={priceMonthly > 0 ? `= ${(priceMonthly / 100).toLocaleString("ru-RU")} ₽` : undefined}
            />
            <NumberInput
              label="Порядок сортировки"
              value={sortOrder}
              onChange={num(setSortOrder)}
              min={0}
            />
          </div>
          <div className="mt-4 space-y-4">
            <Textarea
              label="Описание (EN)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Описание (RU)"
              value={descriptionRu}
              onChange={(e) => setDescriptionRu(e.target.value)}
              rows={2}
            />
          </div>
          <div className="mt-4">
            <Switch
              label="Базовый (всегда включён)"
              description="Модуль доступен всем тенантам без покупки"
              checked={isBase}
              onChange={setIsBase}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(ROUTES.PLATFORM_MODULES)}
        >
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? "Сохранить" : "Создать модуль"}
        </Button>
      </div>
    </form>
  );
}
