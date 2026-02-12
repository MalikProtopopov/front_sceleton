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
  // SEO fields
  site_url: string | null;
  allowed_domains: string[] | null;
  sitemap_static_pages: SitemapStaticPage[] | null;
  robots_txt_custom_rules: string | null;
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
  // SEO fields
  site_url?: string | null;
  allowed_domains?: string[] | null;
  sitemap_static_pages?: SitemapStaticPage[] | null;
  robots_txt_custom_rules?: string | null;
}

export interface UpdateFeatureFlagDto {
  enabled: boolean;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  is_active?: boolean;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  primary_color?: string;
}

// List params
export interface TenantListParams {
  page?: number;
  pageSize?: number;
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

/** Response from POST /auth/switch-tenant (same as login tokens) */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

/** Response from GET /tenants/{id}/domains */
export interface TenantDomainResponse {
  id: string;
  tenant_id: string;
  domain: string; // "admin.client1.com"
  is_primary: boolean;
  ssl_status: "pending" | "active" | "error";
  created_at: string; // ISO 8601
  updated_at: string;
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

