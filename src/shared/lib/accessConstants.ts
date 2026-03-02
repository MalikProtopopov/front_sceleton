/** Human-readable resource limit names (max_products → "товаров") */
export const RESOURCE_NAMES: Record<string, string> = {
  max_users: "пользователей",
  max_storage_mb: "хранилища (МБ)",
  max_leads_per_month: "заявок в месяц",
  max_products: "товаров",
  max_variants: "вариаций",
  max_domains: "доменов",
  max_articles: "статей",
  max_rbac_roles: "ролей",
};

/** Human-readable feature/module names (blog_module → "Блог / Статьи") */
export const FEATURE_NAMES: Record<string, string> = {
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
  company: "О компании",
  crm_basic: "CRM",
};
