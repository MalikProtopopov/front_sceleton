import type { ModuleSource, ModuleCategory, UpgradeRequestType, UpgradeRequestStatus, UsageStatus } from "@/entities/billing";

export function formatPrice(kopecks: number): string {
  return (kopecks / 100).toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  });
}

export function formatLimit(value: number, unit?: string): string {
  if (value === -1) return "∞";
  if (value === 0) return "—";
  if (unit === "МБ" && value >= 1024) {
    return `${(value / 1024).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ГБ`;
  }
  return value.toLocaleString("ru-RU") + (unit ? ` ${unit}` : "");
}

export const sourceLabels: Record<ModuleSource, string> = {
  plan: "Из тарифа",
  addon: "Допокупка",
  bundle: "Из пакета",
  manual: "Вручную",
};

export const categoryLabels: Record<ModuleCategory, string> = {
  platform: "Платформа",
  content: "Контент",
  company: "Компания",
  crm: "CRM",
  commerce: "Коммерция",
};

export const limitLabels: Record<string, { label: string; unit: string }> = {
  max_users: { label: "Пользователи", unit: "" },
  max_storage_mb: { label: "Хранилище", unit: "МБ" },
  max_leads_per_month: { label: "Заявки в месяц", unit: "" },
  max_products: { label: "Товары", unit: "" },
  max_variants: { label: "Вариации товаров", unit: "" },
  max_domains: { label: "Домены", unit: "" },
  max_articles: { label: "Статьи", unit: "" },
  max_rbac_roles: { label: "Роли", unit: "" },
};

export const requestTypeLabels: Record<UpgradeRequestType, string> = {
  plan_upgrade: "Смена тарифа",
  module_addon: "Покупка модуля",
  bundle_addon: "Покупка пакета",
};

export const requestStatusLabels: Record<UpgradeRequestStatus, string> = {
  pending: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена",
};

export const requestStatusColors: Record<UpgradeRequestStatus, string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

export const usageStatusColors: Record<UsageStatus, string> = {
  ok: "var(--color-success, #22c55e)",
  warning: "var(--color-warning, #f59e0b)",
  exceeded: "var(--color-error, #ef4444)",
  not_available: "var(--color-text-muted, #9ca3af)",
};
