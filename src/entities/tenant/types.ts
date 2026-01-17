// Tenant entity types

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
  available_features: Record<string, string>;
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
}

export interface UpdateFeatureFlagDto {
  enabled: boolean;
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

