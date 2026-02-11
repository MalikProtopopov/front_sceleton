"use client";

import { Ban } from "lucide-react";
import { useGlobalErrors } from "@/shared/model/useGlobalErrors";

const FEATURE_LABELS: Record<string, string> = {
  blog_module: "Блог / Статьи",
  cases_module: "Кейсы / Портфолио",
  reviews_module: "Отзывы",
  faq_module: "FAQ",
  team_module: "Команда / Сотрудники",
  seo_advanced: "Расширенное SEO",
  multilang: "Мультиязычность",
  analytics_advanced: "Расширенная аналитика",
};

export function FeatureDisabledNotice() {
  const disabledFeature = useGlobalErrors((s) => s.disabledFeature);
  const clearFeatureDisabled = useGlobalErrors((s) => s.clearFeatureDisabled);

  if (!disabledFeature) return null;

  const label = FEATURE_LABELS[disabledFeature] || disabledFeature;

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
        <Ban className="h-8 w-8 text-[var(--color-warning)]" />
      </div>
      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
        Раздел недоступен
      </h2>
      <p className="mb-4 max-w-md text-center text-[var(--color-text-secondary)]">
        Модуль &laquo;{label}&raquo; был отключён для вашей организации.
        Обратитесь к администратору для включения.
      </p>
      <button
        onClick={clearFeatureDisabled}
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        Вернуться назад
      </button>
    </div>
  );
}
