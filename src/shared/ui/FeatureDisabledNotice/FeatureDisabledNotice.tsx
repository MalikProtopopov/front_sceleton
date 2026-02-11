"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalErrors } from "@/shared/model/useGlobalErrors";

const FEATURE_LABELS: Record<string, string> = {
  blog_module: "Блог / Статьи",
  cases_module: "Кейсы / Портфолио",
  reviews_module: "Отзывы",
  faq_module: "Вопросы и ответы",
  team_module: "Команда / Сотрудники",
  services_module: "Услуги",
  seo_advanced: "Расширенное SEO",
  multilang: "Мультиязычность",
  analytics_advanced: "Расширенная аналитика",
};

export function FeatureDisabledNotice() {
  const router = useRouter();
  const disabledFeature = useGlobalErrors((s) => s.disabledFeature);
  const clearFeatureDisabled = useGlobalErrors((s) => s.clearFeatureDisabled);

  if (!disabledFeature) return null;

  const label = FEATURE_LABELS[disabledFeature] || disabledFeature;

  const handleBack = () => {
    clearFeatureDisabled();
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
        <Ban className="h-8 w-8 text-[var(--color-warning)]" />
      </div>
      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
        Раздел недоступен
      </h2>
      <p className="mb-2 max-w-md text-center text-[var(--color-text-secondary)]">
        Модуль &laquo;{label}&raquo; не подключён для вашей организации.
      </p>
      <p className="mb-6 max-w-md text-center text-sm text-[var(--color-text-muted)]">
        Обратитесь к <strong>администратору платформы</strong> для подключения.
      </p>
      <button
        onClick={handleBack}
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        Вернуться назад
      </button>
    </div>
  );
}
