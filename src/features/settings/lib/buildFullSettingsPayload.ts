import type { UpdateTenantSettingsDto, TenantSettings } from "@/entities/tenant";

export function buildFullSettingsPayload(settings: TenantSettings | null | undefined): UpdateTenantSettingsDto {
  if (!settings) return {};
  return {
    default_locale: settings.default_locale,
    timezone: settings.timezone,
    date_format: settings.date_format,
    time_format: settings.time_format,
    site_url: settings.site_url,
    notify_on_inquiry: settings.notify_on_inquiry,
    inquiry_email: settings.inquiry_email,
    telegram_chat_id: settings.telegram_chat_id,
    default_og_image: settings.default_og_image,
    ga_tracking_id: settings.ga_tracking_id,
    ym_counter_id: settings.ym_counter_id,
    yandex_verification_code: settings.yandex_verification_code,
    google_verification_code: settings.google_verification_code,
    google_verification_meta: settings.google_verification_meta,
    allowed_domains: settings.allowed_domains,
    sitemap_static_pages: settings.sitemap_static_pages,
    robots_txt_custom_rules: settings.robots_txt_custom_rules,
    indexnow_key: settings.indexnow_key,
    indexnow_enabled: settings.indexnow_enabled,
    llms_txt_enabled: settings.llms_txt_enabled,
    llms_txt_custom_content: settings.llms_txt_custom_content,
    email_provider: settings.email_provider,
    email_from_address: settings.email_from_address,
    email_from_name: settings.email_from_name,
    smtp_host: settings.smtp_host,
    smtp_port: settings.smtp_port,
    smtp_user: settings.smtp_user,
    smtp_use_tls: settings.smtp_use_tls,
  };
}
