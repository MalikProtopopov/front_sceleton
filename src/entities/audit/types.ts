// Audit log entity types

export interface AuditUser {
  id: string | null;
  email: string | null;
  name: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  user: AuditUser | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  ip_address: string | null;
  status: string;
}

export interface AuditFilterParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const AUDIT_RESOURCE_TYPES = [
  { value: "article", label: "Статьи" },
  { value: "case", label: "Кейсы" },
  { value: "employee", label: "Сотрудники" },
  { value: "faq", label: "FAQ" },
  { value: "review", label: "Отзывы" },
  { value: "service", label: "Услуги" },
  { value: "inquiry", label: "Заявки" },
  { value: "seo_route", label: "SEO маршруты" },
  { value: "redirect", label: "Редиректы" },
  { value: "user", label: "Пользователи" },
  { value: "role", label: "Роли" },
  { value: "tenant", label: "Тенант" },
];

export const AUDIT_ACTIONS = [
  { value: "create", label: "Создание" },
  { value: "update", label: "Обновление" },
  { value: "delete", label: "Удаление" },
  { value: "publish", label: "Публикация" },
  { value: "unpublish", label: "Снятие с публикации" },
  { value: "approve", label: "Одобрение" },
  { value: "reject", label: "Отклонение" },
  { value: "login", label: "Вход" },
  { value: "logout", label: "Выход" },
];

