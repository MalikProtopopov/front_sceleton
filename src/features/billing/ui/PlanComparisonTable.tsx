"use client";

import { Check, Minus } from "lucide-react";
import { Badge, Button } from "@/shared/ui";
import type { PlanResponse, PublicModule, PublicBundle } from "@/entities/billing";
import { formatPrice, formatLimit, limitLabels } from "../lib/billingConstants";

interface PlanComparisonTableProps {
  plans: PlanResponse[];
  allModules: PublicModule[];
  bundles: PublicBundle[];
  currentPlanSlug?: string;
  onUpgradePlan?: (planId: string) => void;
  onAddBundle?: (bundleId: string) => void;
}

const LIMIT_DISPLAY_ORDER = [
  "max_users",
  "max_storage_mb",
  "max_leads_per_month",
  "max_articles",
  "max_products",
  "max_domains",
];

export function PlanComparisonTable({
  plans,
  allModules,
  bundles,
  currentPlanSlug,
  onUpgradePlan,
  onAddBundle,
}: PlanComparisonTableProps) {
  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);
  const nonBaseModules = allModules.filter((m) => !m.is_base).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      {/* Plans comparison */}
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]" />
              {sortedPlans.map((plan) => (
                <th
                  key={plan.id}
                  className="px-4 py-3 text-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-base font-bold text-[var(--color-text-primary)]">
                        {plan.name_ru}
                      </span>
                      {plan.slug === currentPlanSlug && (
                        <Badge variant="primary">Ваш план</Badge>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Prices */}
            <tr className="border-b border-[var(--color-border)]">
              <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Цена/мес</td>
              {sortedPlans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center text-sm font-bold text-[var(--color-text-primary)]">
                  {plan.price_monthly_kopecks > 0 ? formatPrice(plan.price_monthly_kopecks) : "Индивидуально"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Цена/год (в мес)</td>
              {sortedPlans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center text-sm text-[var(--color-text-primary)]">
                  {plan.price_yearly_kopecks > 0 ? formatPrice(plan.price_yearly_kopecks) : "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Разовая оплата</td>
              {sortedPlans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center text-sm text-[var(--color-text-primary)]">
                  {plan.setup_fee_kopecks > 0 ? formatPrice(plan.setup_fee_kopecks) : "—"}
                </td>
              ))}
            </tr>

            {/* Modules */}
            {nonBaseModules.map((mod) => (
              <tr key={mod.id} className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{mod.name_ru}</td>
                {sortedPlans.map((plan) => {
                  const included = plan.modules.some((pm) => pm.slug === mod.slug);
                  return (
                    <td key={plan.id} className="px-4 py-3 text-center">
                      {included ? (
                        <Check className="mx-auto h-5 w-5 text-[var(--color-success)]" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-[var(--color-text-muted)]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Limits */}
            {LIMIT_DISPLAY_ORDER.map((key) => {
              const meta = limitLabels[key];
              if (!meta) return null;
              return (
                <tr key={key} className="border-b border-[var(--color-border)]">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">
                    {meta.label}
                  </td>
                  {sortedPlans.map((plan) => {
                    const val = plan.limits[key as keyof typeof plan.limits] as number;
                    return (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm text-[var(--color-text-primary)]">
                        {formatLimit(val, meta.unit)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Action row */}
            <tr>
              <td className="px-4 py-4" />
              {sortedPlans.map((plan) => (
                <td key={plan.id} className="px-4 py-4 text-center">
                  {plan.slug === currentPlanSlug ? (
                    <Badge variant="success">Текущий план</Badge>
                  ) : (
                    onUpgradePlan && (
                      <Button size="sm" onClick={() => onUpgradePlan(plan.id)}>
                        Выбрать
                      </Button>
                    )
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bundles */}
      {bundles.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Пакеты модулей
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    {bundle.name_ru}
                  </h4>
                  {bundle.discount_percent > 0 && (
                    <Badge variant="success">-{bundle.discount_percent}%</Badge>
                  )}
                </div>
                <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                  {bundle.description_ru}
                </p>
                <p className="mb-2 text-sm text-[var(--color-text-muted)]">
                  Модули: {bundle.modules.map((m) => m.name_ru).join(", ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[var(--color-text-primary)]">
                    {formatPrice(bundle.price_monthly_kopecks)}
                    <span className="text-xs font-normal text-[var(--color-text-muted)]">/мес</span>
                  </span>
                  {onAddBundle && (
                    <Button size="sm" variant="secondary" onClick={() => onAddBundle(bundle.id)}>
                      Купить пакет
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
