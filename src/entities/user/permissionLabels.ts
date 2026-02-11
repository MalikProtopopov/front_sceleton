/**
 * Russian labels for permission resource groups.
 */
export const RESOURCE_LABELS: Record<string, string> = {
  articles: "Статьи",
  services: "Услуги",
  employees: "Сотрудники",
  cases: "Кейсы",
  reviews: "Отзывы",
  faq: "FAQ",
  inquiries: "Заявки",
  seo: "SEO",
  settings: "Настройки сайта",
  users: "Пользователи",
  roles: "Роли",
  platform: "Платформа",
  features: "Модули (фича-флаги)",
  audit: "Аудит",
  media: "Медиатека",
  other: "Прочее",
};

/**
 * Russian labels for permission actions.
 */
export const ACTION_LABELS: Record<string, string> = {
  create: "Создание",
  read: "Просмотр",
  update: "Редактирование",
  delete: "Удаление",
  publish: "Публикация",
  manage: "Управление",
  moderate: "Модерация",
  write: "Редактирование",
};

/**
 * Full mapping of permission codes (resource:action) to Russian labels.
 * Used when displaying individual permission badges.
 */
const PERMISSION_LABELS: Record<string, string> = {
  // Статьи
  "articles:create": "Создание статей",
  "articles:read": "Просмотр статей",
  "articles:update": "Редактирование статей",
  "articles:delete": "Удаление статей",
  "articles:publish": "Публикация статей",

  // Услуги
  "services:create": "Создание услуг",
  "services:read": "Просмотр услуг",
  "services:update": "Редактирование услуг",
  "services:delete": "Удаление услуг",

  // Сотрудники
  "employees:create": "Создание сотрудников",
  "employees:read": "Просмотр сотрудников",
  "employees:update": "Редактирование сотрудников",
  "employees:delete": "Удаление сотрудников",

  // Кейсы
  "cases:create": "Создание кейсов",
  "cases:read": "Просмотр кейсов",
  "cases:update": "Редактирование кейсов",
  "cases:delete": "Удаление кейсов",

  // Отзывы
  "reviews:create": "Создание отзывов",
  "reviews:read": "Просмотр отзывов",
  "reviews:update": "Редактирование отзывов",
  "reviews:delete": "Удаление отзывов",
  "reviews:moderate": "Модерация отзывов",

  // FAQ
  "faq:create": "Создание FAQ",
  "faq:read": "Просмотр FAQ",
  "faq:update": "Редактирование FAQ",
  "faq:delete": "Удаление FAQ",

  // Заявки
  "inquiries:read": "Просмотр заявок",
  "inquiries:update": "Обработка заявок",
  "inquiries:delete": "Удаление заявок",

  // SEO
  "seo:read": "Просмотр SEO-настроек",
  "seo:update": "Редактирование SEO-настроек",

  // Настройки сайта
  "settings:read": "Просмотр настроек",
  "settings:update": "Изменение настроек",

  // Пользователи
  "users:create": "Создание пользователей",
  "users:read": "Просмотр пользователей",
  "users:update": "Редактирование пользователей",
  "users:delete": "Удаление пользователей",

  // Роли
  "roles:read": "Просмотр ролей",
  "roles:update": "Редактирование ролей",

  // Платформа
  "platform:read": "Просмотр платформенных настроек",
  "platform:update": "Изменение платформенных настроек",

  // Модули (фича-флаги)
  "features:read": "Просмотр модулей",
  "features:update": "Управление модулями",

  // Аудит
  "audit:read": "Просмотр журнала действий",

  // Медиатека
  "media:create": "Загрузка файлов",
  "media:read": "Просмотр медиатеки",
  "media:update": "Редактирование файлов",
  "media:delete": "Удаление файлов",
};

/**
 * Get human-readable Russian label for a permission code.
 * Falls back to the original code if no translation exists.
 *
 * @param code - Permission code like "articles:create"
 */
export function getPermissionLabel(code: string): string {
  return PERMISSION_LABELS[code] || code;
}
