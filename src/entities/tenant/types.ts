// Tenant entity types

export interface SitemapStaticPage {
  path: string;
  priority: number;
  changefreq: string;
}

export interface TenantSettings {
  id: string;
  tenant_id: string;
  default_locale: string;
  timezone: string;
  date_format: string;
  time_format: string;
  notify_on_inquiry: boolean;
  inquiry_email: string | null;
  telegram_chat_id: string | null;
  default_og_image: string | null;
  ga_tracking_id: string | null;
  ym_counter_id: string | null;
  // Webmaster verification fields
  yandex_verification_code: string | null;
  google_verification_code: string | null;
  google_verification_meta: string | null;
  // SEO fields
  site_url: string | null;
  allowed_domains: string[] | null;
  sitemap_static_pages: SitemapStaticPage[] | null;
  robots_txt_custom_rules: string | null;
  // IndexNow
  indexnow_key: string | null;
  indexnow_enabled: boolean;
  // llms.txt
  llms_txt_enabled: boolean;
  llms_txt_custom_content: string | null;
  // Email / SMTP
  email_provider: "smtp" | "sendgrid" | "mailgun" | "console" | null;
  email_from_address: string | null;
  email_from_name: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_use_tls: boolean;
  smtp_password_configured: boolean;
  email_api_key_configured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  is_active: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  extra_data: Record<string, unknown> | null;
  users_count?: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  settings: TenantSettings | null;
}

export interface FeatureFlag {
  id: string;
  tenant_id: string;
  feature_name: string;
  enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagsResponse {
  items: FeatureFlag[];
  available_features: Record<
    string,
    | string
    | {
        title?: string;
        title_ru?: string;
        description?: string;
        description_ru?: string;
        category?: string;
      }
  >;
}

// Request DTOs
export interface UpdateTenantDto {
  name?: string;
  is_active?: boolean;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  primary_color?: string;
  extra_data?: Record<string, unknown>;
  version: number;
}

export interface UpdateTenantSettingsDto {
  default_locale?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  notify_on_inquiry?: boolean;
  inquiry_email?: string | null;
  telegram_chat_id?: string | null;
  default_og_image?: string | null;
  ga_tracking_id?: string | null;
  ym_counter_id?: string | null;
  // Webmaster verification fields
  yandex_verification_code?: string | null;
  google_verification_code?: string | null;
  google_verification_meta?: string | null;
  // SEO fields
  site_url?: string | null;
  allowed_domains?: string[] | null;
  sitemap_static_pages?: SitemapStaticPage[] | null;
  robots_txt_custom_rules?: string | null;
  // IndexNow
  indexnow_key?: string | null;
  indexnow_enabled?: boolean;
  // llms.txt
  llms_txt_enabled?: boolean;
  llms_txt_custom_content?: string | null;
  // Email / SMTP
  email_provider?: "smtp" | "sendgrid" | "mailgun" | "console" | null;
  email_from_address?: string | null;
  email_from_name?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_use_tls?: boolean;
  smtp_password?: string | null;
  email_api_key?: string | null;
}

export interface UpdateFeatureFlagDto {
  enabled: boolean;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  is_active?: boolean;
  contact_email?: string;
  contact_phone?: string;
  primary_color?: string;
}

// List params
export interface TenantListParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
  sort_by?: "name" | "created_at";
  sort_order?: "asc" | "desc";
}

// Response types
export interface TenantsListResponse {
  items: Tenant[];
  total: number;
  page: number;
  page_size: number;
}

/** Feature item from /auth/me/features?locale=ru */
export interface FeatureCatalogItem {
  name: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  can_request: boolean;
}

/** V2 response from /auth/me/features */
export interface FeatureCatalogResponse {
  features: FeatureCatalogItem[];
  all_features_enabled: boolean;
  tenant_id: string;
}

/** Backward-compatible helper derived from the catalog */
export interface EnabledFeaturesResponse {
  enabled_features: string[];
  all_features_enabled: boolean;
  /** Full catalog items for sidebar "available on request" badges */
  features?: FeatureCatalogItem[];
}

// --- Multi-domain tenant resolution types ---

/** Response from GET /public/tenants/by-domain/{domain} */
export interface TenantByDomainResponse {
  tenant_id: string; // UUID
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null; // "#RRGGBB"
  site_url: string | null;
}

/** Item inside MyTenantsResponse.tenants[] */
export interface TenantAccessInfo {
  tenant_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  admin_domain: string | null; // primary domain, e.g. "admin.client1.com"
}

/** Response from GET /auth/me/tenants */
export interface MyTenantsResponse {
  current_tenant_id: string;
  tenants: TenantAccessInfo[];
}

/** Request body for POST /auth/switch-tenant */
export interface SwitchTenantRequest {
  tenant_id: string;
}

/** Request body for POST /auth/select-tenant (Smart Login v2) */
export interface SelectTenantRequest {
  selection_token: string;
  tenant_id: string;
}

/** Response from POST /auth/switch-tenant (same as login tokens) */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export type SSLStatus = "pending" | "verifying" | "active" | "error";

/** Response from GET /tenants/{id}/domains */
export interface TenantDomainResponse {
  id: string;
  tenant_id: string;
  domain: string; // "admin.client1.com"
  is_primary: boolean;
  ssl_status: SSLStatus;
  dns_verified_at: string | null;
  ssl_provisioned_at: string | null;
  created_at: string; // ISO 8601
  updated_at: string;
}

export interface TenantDomainListResponse {
  items: TenantDomainResponse[];
  total: number;
}

export interface TenantDomainCreate {
  domain: string; // FQDN, 4-255 chars
  is_primary?: boolean;
}

export interface TenantDomainUpdate {
  is_primary?: boolean;
  ssl_status?: SSLStatus;
}

/** Response from POST /tenants/{id}/domains/{domain_id}/verify */
export interface DNSVerifyResponse {
  ok: boolean;
  cname_target: string | null;
  expected_target: string;
  message: string;
}

/** Response from GET /tenants/{id}/domains/{domain_id}/ssl-status */
export interface TenantDomainSSLStatusResponse {
  domain_id: string;
  domain: string;
  ssl_status: SSLStatus;
  dns_verified_at: string | null;
  ssl_provisioned_at: string | null;
  message?: string;
}

/** Response from POST /tenants/{id}/settings/email-test */
export interface EmailTestResponse {
  success: boolean;
  provider: string;
  error: string | null;
}

/** Params for GET /tenants/{id}/email-logs */
export interface EmailLogParams {
  page?: number;
  page_size?: number;
  status?: "sent" | "failed" | "pending";
}

export interface EmailLogEntry {
  id: string;
  tenant_id: string;
  to_email: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  provider: string;
  error: string | null;
  created_at: string;
}

export interface EmailLogsResponse {
  items: EmailLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

// Constants
export const AVAILABLE_LOCALES = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbek" },
] as const;

export const AVAILABLE_TIMEZONES = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/Kaliningrad", label: "Калининград (UTC+2)" },
  { value: "Europe/Samara", label: "Самара (UTC+4)" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург (UTC+5)" },
  { value: "Asia/Omsk", label: "Омск (UTC+6)" },
  { value: "Asia/Krasnoyarsk", label: "Красноярск (UTC+7)" },
  { value: "Asia/Irkutsk", label: "Иркутск (UTC+8)" },
  { value: "Asia/Yakutsk", label: "Якутск (UTC+9)" },
  { value: "Asia/Vladivostok", label: "Владивосток (UTC+10)" },
  { value: "Asia/Tashkent", label: "Ташкент (UTC+5)" },
  { value: "UTC", label: "UTC (UTC+0)" },
] as const;

export const DATE_FORMATS = [
  { value: "DD.MM.YYYY", label: "31.12.2026" },
  { value: "YYYY-MM-DD", label: "2026-12-31" },
  { value: "DD/MM/YYYY", label: "31/12/2026" },
  { value: "MM/DD/YYYY", label: "12/31/2026" },
] as const;

export const TIME_FORMATS = [
  { value: "HH:mm", label: "23:59 (24ч)" },
  { value: "hh:mm A", label: "11:59 PM (12ч)" },
] as const;

// ─── Sidebar API ───

export type SidebarItemReason = "billing" | "role" | "billing+role" | null;

export interface SidebarLimitInfo {
  resource: string;
  current: number;
  limit: number | null;
  status: "ok" | "warning" | "exceeded" | "not_available";
}

export interface SidebarItem {
  name: string;
  title: string;
  path: string;
  icon: string;
  category: string;
  visible: boolean;
  accessible: boolean;
  reason: SidebarItemReason;
  /** Код права RBAC при reason role/billing+role, например articles:read, catalog:read */
  required_permission: string | null;
  /** Информация о лимите ресурса (null если лимит не применяется к разделу) */
  limit_info: SidebarLimitInfo | null;
}

export interface SidebarResponse {
  tenant_id: string;
  role: string | null;
  all_access: boolean;
  sections: SidebarItem[];
}

