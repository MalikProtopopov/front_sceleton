"use client";

import { useRouter } from "next/navigation";
import { Lock, AlertTriangle, ShieldX, Ban, Clock } from "lucide-react";
import { Modal, ModalBody, ModalFooter, Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import {
  useErrorStore,
  type FeatureDisabledPayload,
  type LimitExceededPayload,
  type PermissionDeniedPayload,
  type RateLimitPayload,
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

function FeatureDisabledContent({
  payload,
  onClose,
  onBilling,
}: {
  payload: FeatureDisabledPayload;
  onClose: () => void;
  onBilling: () => void;
}) {
  const label = FEATURE_NAMES[payload.feature] ?? payload.feature;

  return (
    <>
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
            <Lock className="h-6 w-6 text-[var(--color-warning)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Модуль &laquo;{label}&raquo; не входит в ваш текущий тариф.
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Подключите модуль или перейдите на расширенный тариф.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
        <Button onClick={onBilling}>Посмотреть тарифы</Button>
      </ModalFooter>
    </>
  );
}

function LimitExceededContent({
  payload,
  onClose,
  onBilling,
}: {
  payload: LimitExceededPayload;
  onClose: () => void;
  onBilling: () => void;
}) {
  const resourceLabel = RESOURCE_NAMES[payload.resource] ?? payload.resource;

  return (
    <>
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error)]/10">
            <AlertTriangle className="h-6 w-6 text-[var(--color-error)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Достигнут лимит: {payload.currentUsage}/{payload.limit}{" "}
              {resourceLabel}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Перейдите на расширенный тариф для увеличения лимитов.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
        <Button onClick={onBilling}>Расширить тариф</Button>
      </ModalFooter>
    </>
  );
}

function PermissionDeniedContent({
  payload,
  onClose,
}: {
  payload: PermissionDeniedPayload;
  onClose: () => void;
}) {
  const hasRole = "role" in payload && payload.role;

  return (
    <>
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
            <ShieldX className="h-6 w-6 text-[var(--color-text-muted)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {hasRole
                ? `Этот раздел доступен только для роли «${payload.role}»`
                : "У вашей роли нет прав на это действие"}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Обратитесь к администратору для расширения прав.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Понятно</Button>
      </ModalFooter>
    </>
  );
}

function RateLimitContent({
  payload,
  onClose,
}: {
  payload: RateLimitPayload;
  onClose: () => void;
}) {
  const seconds = payload.retryAfter;
  const timeStr = seconds
    ? seconds >= 60
      ? `${Math.ceil(seconds / 60)} мин.`
      : `${seconds} сек.`
    : null;

  return (
    <>
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
            <Clock className="h-6 w-6 text-[var(--color-warning)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Слишком много запросов
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {timeStr
                ? `Повторите попытку через ${timeStr}`
                : "Подождите немного и попробуйте снова."}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Ок</Button>
      </ModalFooter>
    </>
  );
}

function GenericForbiddenContent({
  payload,
  onClose,
}: {
  payload: GenericForbiddenPayload;
  onClose: () => void;
}) {
  return (
    <>
      <ModalBody>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error)]/10">
            <Ban className="h-6 w-6 text-[var(--color-error)]" />
          </div>
          <p className="text-sm text-[var(--color-text-primary)]">
            {payload?.message ?? "Доступ запрещён"}
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Закрыть</Button>
      </ModalFooter>
    </>
  );
}

const MODAL_TITLES: Record<string, string> = {
  feature_disabled: "Модуль недоступен",
  limit_exceeded: "Лимит исчерпан",
  permission_denied: "Нет доступа",
  insufficient_role: "Нет доступа",
  rate_limit: "Слишком много запросов",
  generic_forbidden: "Доступ запрещён",
};

export function ErrorModal() {
  const router = useRouter();
  const { visible, type, payload, dismiss } = useErrorStore();

  const handleClose = () => dismiss();

  const goToBilling = () => {
    dismiss();
    router.push(ROUTES.BILLING_PLANS);
  };

  const title = type ? MODAL_TITLES[type] ?? "Ошибка" : "Ошибка";

  const renderContent = () => {
    switch (type) {
      case "feature_disabled":
        return (
          <FeatureDisabledContent
            payload={payload as FeatureDisabledPayload}
            onClose={handleClose}
            onBilling={goToBilling}
          />
        );
      case "limit_exceeded":
        return (
          <LimitExceededContent
            payload={payload as LimitExceededPayload}
            onClose={handleClose}
            onBilling={goToBilling}
          />
        );
      case "permission_denied":
      case "insufficient_role":
        return (
          <PermissionDeniedContent
            payload={payload as PermissionDeniedPayload}
            onClose={handleClose}
          />
        );
      case "rate_limit":
        return (
          <RateLimitContent
            payload={payload as RateLimitPayload}
            onClose={handleClose}
          />
        );
      case "generic_forbidden":
        return (
          <GenericForbiddenContent
            payload={payload as GenericForbiddenPayload}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={visible} onClose={handleClose} title={title} size="sm">
      {renderContent()}
    </Modal>
  );
}
