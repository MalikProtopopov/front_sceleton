"use client";

import { useRouter } from "next/navigation";
import {
  Lock,
  AlertTriangle,
  ShieldX,
  Ban,
  ArrowLeft,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { ROUTES } from "@/shared/config";
import {
  useErrorStore,
  type PageError,
  type FeatureDisabledPayload,
  type LimitExceededPayload,
  type PermissionDeniedPayload,
  type GenericForbiddenPayload,
} from "@/shared/model/useErrorStore";

const FEATURE_NAMES: Record<string, string> = {
  blog_module: "Блог / Статьи",
  cases_module: "Кейсы / Портфолио",
  reviews_module: "Отзывы",
  faq_module: "Вопросы и ответы",
  team_module: "Команда / Сотрудники",
  services_module: "Услуги",
  catalog_module: "Каталог товаров",
  variants_module: "Вариации товаров",
  seo_advanced: "Расширенное SEO",
  multilang: "Мультиязычность",
  analytics_advanced: "Расширенная аналитика",
  documents: "Документы",
};

const RESOURCE_NAMES: Record<string, string> = {
  max_users: "пользователей",
  max_storage_mb: "хранилища (МБ)",
  max_leads_per_month: "заявок в месяц",
  max_products: "товаров",
  max_variants: "вариаций",
  max_domains: "доменов",
  max_articles: "статей",
  max_rbac_roles: "ролей",
};

// ─── Feature Disabled ────────────────────────────────────────────────

function FeatureDisabledView({ payload }: { payload: FeatureDisabledPayload }) {
  const router = useRouter();
  const label = FEATURE_NAMES[payload.feature] ?? payload.feature;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        {/* Decorative background */}
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-amber-200/40 to-amber-400/20 blur-2xl" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg shadow-amber-200/30 dark:border-amber-500/30 dark:from-amber-950/40 dark:to-amber-900/30 dark:shadow-amber-900/20">
            <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-400">
          <Crown className="h-3.5 w-3.5" />
          Pro
        </div>

        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Раздел &laquo;{label}&raquo; недоступен
        </h1>
        <p className="mb-8 text-[var(--color-text-secondary)]">
          Этот модуль не входит в ваш текущий тариф. Перейдите на расширенный
          тариф или подключите модуль отдельно.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button onClick={() => router.push(ROUTES.BILLING_PLANS)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Посмотреть тарифы
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Limit Exceeded ──────────────────────────────────────────────────

function LimitExceededView({ payload }: { payload: LimitExceededPayload }) {
  const router = useRouter();
  const resourceLabel = RESOURCE_NAMES[payload.resource] ?? payload.resource;

  const percentage = payload.limit > 0
    ? Math.round((payload.currentUsage / payload.limit) * 100)
    : 100;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-red-200/40 to-orange-200/20 blur-2xl" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg shadow-red-200/20 dark:border-red-500/30 dark:from-red-950/30 dark:to-orange-950/20 dark:shadow-red-900/20">
            <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Лимит исчерпан
        </h1>

        {/* Progress bar */}
        <div className="mx-auto mb-4 max-w-xs">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">{resourceLabel}</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {payload.currentUsage} / {payload.limit}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <p className="mb-8 text-[var(--color-text-secondary)]">
          Вы достигли лимита вашего тарифа. Перейдите на расширенный тариф для
          увеличения лимитов.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button onClick={() => router.push(ROUTES.BILLING_PLANS)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Расширить тариф
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Permission Denied ───────────────────────────────────────────────

function PermissionDeniedView({ payload }: { payload: PermissionDeniedPayload }) {
  const router = useRouter();
  const hasRole = payload.role;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-gray-200/40 to-gray-300/20 blur-2xl dark:from-gray-700/30 dark:to-gray-600/10" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30">
            <ShieldX className="h-10 w-10 text-[var(--color-text-muted)]" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Нет доступа
        </h1>
        <p className="mb-8 text-[var(--color-text-secondary)]">
          {hasRole
            ? `Этот раздел доступен только для роли «${payload.role}».`
            : "У вашей роли нет прав для доступа к этому разделу."}
          <br />
          Обратитесь к администратору для расширения прав.
        </p>

        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться назад
        </Button>
      </div>
    </div>
  );
}

// ─── Generic Forbidden ───────────────────────────────────────────────

function GenericForbiddenView({ payload }: { payload: GenericForbiddenPayload }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-red-200/30 to-gray-200/20 blur-2xl dark:from-red-900/20 dark:to-gray-800/10" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-gray-50 shadow-lg shadow-red-200/20 dark:border-red-500/20 dark:from-red-950/20 dark:to-gray-950/10 dark:shadow-red-900/10">
            <Ban className="h-10 w-10 text-red-400 dark:text-red-500" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Доступ запрещён
        </h1>
        <p className="mb-8 text-[var(--color-text-secondary)]">
          {payload?.message ?? "У вас нет прав для выполнения этого действия."}
        </p>

        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться назад
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function AccessDeniedPage() {
  const pageError = useErrorStore((s) => s.pageError);

  if (!pageError) return null;

  return <AccessDeniedContent error={pageError} />;
}

export function AccessDeniedContent({ error }: { error: PageError }) {
  switch (error.type) {
    case "feature_disabled":
      return <FeatureDisabledView payload={error.payload as FeatureDisabledPayload} />;
    case "limit_exceeded":
      return <LimitExceededView payload={error.payload as LimitExceededPayload} />;
    case "permission_denied":
    case "insufficient_role":
      return (
        <PermissionDeniedView
          payload={(error.payload as PermissionDeniedPayload) ?? {}}
        />
      );
    case "generic_forbidden":
      return (
        <GenericForbiddenView
          payload={(error.payload as GenericForbiddenPayload) ?? {}}
        />
      );
    default:
      return (
        <GenericForbiddenView payload={{ message: "Доступ запрещён" }} />
      );
  }
}
