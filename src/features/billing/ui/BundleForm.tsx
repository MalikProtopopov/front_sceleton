"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, Textarea, Switch, NumberInput } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { PublicBundle, CreateBundleDto, PublicModule } from "@/entities/billing";

interface BundleFormProps {
  bundle?: PublicBundle;
  allModules: PublicModule[];
  onSubmit: (data: CreateBundleDto) => void;
  isLoading?: boolean;
}

export function BundleForm({ bundle, allModules, onSubmit, isLoading }: BundleFormProps) {
  const router = useRouter();
  const isEdit = !!bundle;

  const [slug, setSlug] = useState(bundle?.slug ?? "");
  const [name, setName] = useState(bundle?.name ?? "");
  const [nameRu, setNameRu] = useState(bundle?.name_ru ?? "");
  const [description, setDescription] = useState("");
  const [descriptionRu, setDescriptionRu] = useState(bundle?.description_ru ?? "");
  const [priceMonthly, setPriceMonthly] = useState(bundle?.price_monthly_kopecks ?? 0);
  const [discountPercent, setDiscountPercent] = useState(bundle?.discount_percent ?? 0);
  const [isActive, setIsActive] = useState(bundle?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(bundle?.sort_order ?? 0);
  const [selectedModules, setSelectedModules] = useState<string[]>(
    bundle?.modules.map((m) => m.slug) ?? []
  );

  const toggleModule = (slug: string) => {
    setSelectedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

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
      price_monthly_kopecks: priceMonthly,
      discount_percent: discountPercent,
      is_active: isActive,
      sort_order: sortOrder,
      module_slugs: selectedModules,
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
            <NumberInput
              label="Порядок сортировки"
              value={sortOrder}
              onChange={num(setSortOrder)}
              min={0}
            />
            <NumberInput
              label="Цена, коп./мес"
              value={priceMonthly}
              onChange={num(setPriceMonthly)}
              min={0}
              hint={priceMonthly > 0 ? `= ${(priceMonthly / 100).toLocaleString("ru-RU")} ₽` : undefined}
            />
            <NumberInput
              label="Скидка, %"
              value={discountPercent}
              onChange={num(setDiscountPercent)}
              min={0}
              max={100}
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
              label="Активен"
              description="Виден в каталоге пакетов"
              checked={isActive}
              onChange={setIsActive}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Модули в пакете</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allModules.map((mod) => (
              <label
                key={mod.id}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-bg-hover)]"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(mod.slug)}
                  onChange={() => toggleModule(mod.slug)}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent-primary)]"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">
                    {mod.name_ru}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">{mod.slug}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(ROUTES.PLATFORM_BUNDLES)}
        >
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? "Сохранить" : "Создать пакет"}
        </Button>
      </div>
    </form>
  );
}
