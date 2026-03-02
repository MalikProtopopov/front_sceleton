"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, Textarea, Switch, NumberInput } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { PlanResponse, CreatePlanDto, PlanLimits, PublicModule } from "@/entities/billing";

interface PlanFormProps {
  plan?: PlanResponse;
  allModules: PublicModule[];
  onSubmit: (data: CreatePlanDto) => void;
  isLoading?: boolean;
}

const EMPTY_LIMITS: PlanLimits = {
  max_users: 2,
  max_storage_mb: 5120,
  max_leads_per_month: 500,
  max_products: 0,
  max_variants: 0,
  max_domains: 1,
  max_articles: 100,
  max_rbac_roles: 3,
};

const LIMIT_FIELDS: { key: keyof PlanLimits; label: string; hint: string }[] = [
  { key: "max_users", label: "Пользователи", hint: "-1 = безлимит" },
  { key: "max_storage_mb", label: "Хранилище (МБ)", hint: "20480 = 20 ГБ" },
  { key: "max_leads_per_month", label: "Заявки в месяц", hint: "-1 = безлимит" },
  { key: "max_products", label: "Товары", hint: "0 = недоступно" },
  { key: "max_variants", label: "Вариации товаров", hint: "0 = недоступно" },
  { key: "max_domains", label: "Домены", hint: "" },
  { key: "max_articles", label: "Статьи", hint: "-1 = безлимит" },
  { key: "max_rbac_roles", label: "Роли", hint: "" },
];

export function PlanForm({ plan, allModules, onSubmit, isLoading }: PlanFormProps) {
  const router = useRouter();
  const isEdit = !!plan;

  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [nameRu, setNameRu] = useState(plan?.name_ru ?? "");
  const [descriptionRu, setDescriptionRu] = useState(plan?.description_ru ?? "");
  const [priceMonthly, setPriceMonthly] = useState(plan?.price_monthly_kopecks ?? 0);
  const [priceYearly, setPriceYearly] = useState(plan?.price_yearly_kopecks ?? 0);
  const [setupFee, setSetupFee] = useState(plan?.setup_fee_kopecks ?? 0);
  const [isDefault, setIsDefault] = useState(plan?.is_default ?? false);
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(plan?.sort_order ?? 0);
  const [limits, setLimits] = useState<PlanLimits>(plan?.limits ?? EMPTY_LIMITS);
  const [selectedModules, setSelectedModules] = useState<string[]>(
    plan?.modules.map((m) => m.slug) ?? []
  );

  const num = (setter: (v: number) => void) => (v: number | null | undefined) =>
    setter(v ?? 0);

  const handleLimitChange = (key: keyof PlanLimits, value: number | null | undefined) => {
    setLimits((prev) => ({ ...prev, [key]: value ?? 0 }));
  };

  const toggleModule = (slug: string) => {
    setSelectedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      slug,
      name,
      name_ru: nameRu,
      description_ru: descriptionRu,
      price_monthly_kopecks: priceMonthly,
      price_yearly_kopecks: priceYearly,
      setup_fee_kopecks: setupFee,
      is_default: isDefault,
      is_active: isActive,
      sort_order: sortOrder,
      limits,
      module_slugs: selectedModules,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Основные</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Слаг"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={isEdit}
              hint="Только латиница, нижнее подчёркивание"
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
          </div>
          <div className="mt-4">
            <Textarea
              label="Описание (RU)"
              value={descriptionRu}
              onChange={(e) => setDescriptionRu(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mt-4 flex gap-6">
            <Switch
              label="Активен"
              description="Виден клиентам в каталоге"
              checked={isActive}
              onChange={setIsActive}
            />
            <Switch
              label="По умолчанию"
              description="Назначается новым организациям"
              checked={isDefault}
              onChange={setIsDefault}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Цены (в копейках)</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberInput
              label="Цена в месяц"
              value={priceMonthly}
              onChange={num(setPriceMonthly)}
              min={0}
              hint={priceMonthly > 0 ? `= ${(priceMonthly / 100).toLocaleString("ru-RU")} ₽` : undefined}
            />
            <NumberInput
              label="Цена в год (за мес)"
              value={priceYearly}
              onChange={num(setPriceYearly)}
              min={0}
              hint={priceYearly > 0 ? `= ${(priceYearly / 100).toLocaleString("ru-RU")} ₽` : undefined}
            />
            <NumberInput
              label="Разовая оплата"
              value={setupFee}
              onChange={num(setSetupFee)}
              min={0}
              hint={setupFee > 0 ? `= ${(setupFee / 100).toLocaleString("ru-RU")} ₽` : undefined}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Лимиты</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIMIT_FIELDS.map(({ key, label, hint }) => (
              <NumberInput
                key={key}
                label={label}
                value={limits[key]}
                onChange={(val: number | null | undefined) => handleLimitChange(key, val)}
                hint={hint || undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Модули</h3>
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
          onClick={() => router.push(ROUTES.PLATFORM_PLANS)}
        >
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? "Сохранить" : "Создать тариф"}
        </Button>
      </div>
    </form>
  );
}
