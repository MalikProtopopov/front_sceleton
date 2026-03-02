"use client";

import { CreditCard } from "lucide-react";
import { Card, CardContent, Button } from "@/shared/ui";
import type { PlanResponse } from "@/entities/billing";
import { formatPrice } from "../lib/billingConstants";

interface PlanCardProps {
  plan: PlanResponse | null;
  onChangePlan?: () => void;
}

export function PlanCard({ plan, onChangePlan }: PlanCardProps) {
  if (!plan) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)]">
                <CreditCard className="h-6 w-6 text-[var(--color-text-muted)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Тариф не назначен
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Для вашей организации ещё не выбран тарифный план
                </p>
              </div>
            </div>
            {onChangePlan && (
              <Button onClick={onChangePlan}>
                Выбрать тариф
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10">
              <CreditCard className="h-6 w-6 text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {plan.name_ru}
              </h2>
              {plan.description_ru && (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {plan.description_ru}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatPrice(plan.price_monthly_kopecks)}
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">/мес</span>
                </span>
                {plan.price_yearly_kopecks > 0 && (
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {formatPrice(plan.price_yearly_kopecks)}/мес при оплате за год
                  </span>
                )}
              </div>
            </div>
          </div>
          {onChangePlan && (
            <Button variant="secondary" onClick={onChangePlan}>
              Сменить тариф
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
