"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useUpdateTenantSettings } from "@/features/settings";
import { useSendTestEmail, useEmailLogs } from "../model/useTenants";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
  Badge,
  Spinner,
} from "@/shared/ui";
import type { Tenant, UpdateTenantSettingsDto, TenantSettings } from "@/entities/tenant";
import { AVAILABLE_LOCALES, AVAILABLE_TIMEZONES, DATE_FORMATS, TIME_FORMATS } from "@/entities/tenant";

const EMAIL_PROVIDER_OPTIONS = [
  { value: "", label: "Глобальный (по умолчанию)" },
  { value: "smtp", label: "SMTP" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "mailgun", label: "Mailgun" },
  { value: "console", label: "Console (для тестов)" },
];

function buildFullSettingsPayload(settings: TenantSettings | null | undefined): UpdateTenantSettingsDto {
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

interface TenantSettingsTabProps {
  tenant: Tenant;
}

export function TenantSettingsTab({ tenant }: TenantSettingsTabProps) {
  const { mutate: updateSettings, isPending } = useUpdateTenantSettings(tenant.id);
  const { mutate: sendTestEmail, isPending: isSendingTestEmail } = useSendTestEmail(tenant.id);

  const s = tenant.settings;

  const [localeForm, setLocaleForm] = useState({
    default_locale: s?.default_locale || "ru",
    timezone: s?.timezone || "Europe/Moscow",
    date_format: s?.date_format || "DD.MM.YYYY",
    time_format: s?.time_format || "HH:mm",
  });

  const [siteForm, setSiteForm] = useState({
    site_url: s?.site_url || "",
    notify_on_inquiry: s?.notify_on_inquiry ?? true,
    inquiry_email: s?.inquiry_email || "",
    telegram_chat_id: s?.telegram_chat_id || "",
  });

  const [analyticsForm, setAnalyticsForm] = useState({
    ga_tracking_id: s?.ga_tracking_id || "",
    ym_counter_id: s?.ym_counter_id || "",
  });

  const [emailForm, setEmailForm] = useState({
    email_provider: s?.email_provider || "",
    email_from_address: s?.email_from_address || "",
    email_from_name: s?.email_from_name || "",
    smtp_host: s?.smtp_host || "",
    smtp_port: s?.smtp_port != null ? String(s.smtp_port) : "",
    smtp_user: s?.smtp_user || "",
    smtp_use_tls: s?.smtp_use_tls ?? true,
    smtp_password: "",
    email_api_key: "",
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [showEmailLogs, setShowEmailLogs] = useState(false);
  const { data: emailLogsData, isLoading: isLoadingLogs } = useEmailLogs(
    tenant.id,
    showEmailLogs ? { page: 1, page_size: 10 } : undefined,
  );

  useEffect(() => {
    if (tenant.settings) {
      const ns = tenant.settings;
      setLocaleForm({
        default_locale: ns.default_locale,
        timezone: ns.timezone,
        date_format: ns.date_format,
        time_format: ns.time_format,
      });
      setSiteForm({
        site_url: ns.site_url || "",
        notify_on_inquiry: ns.notify_on_inquiry,
        inquiry_email: ns.inquiry_email || "",
        telegram_chat_id: ns.telegram_chat_id || "",
      });
      setAnalyticsForm({
        ga_tracking_id: ns.ga_tracking_id || "",
        ym_counter_id: ns.ym_counter_id || "",
      });
      setEmailForm({
        email_provider: ns.email_provider || "",
        email_from_address: ns.email_from_address || "",
        email_from_name: ns.email_from_name || "",
        smtp_host: ns.smtp_host || "",
        smtp_port: ns.smtp_port != null ? String(ns.smtp_port) : "",
        smtp_user: ns.smtp_user || "",
        smtp_use_tls: ns.smtp_use_tls ?? true,
        smtp_password: "",
        email_api_key: "",
      });
    }
  }, [tenant.settings]);

  const handleSaveAll = () => {
    const payload: UpdateTenantSettingsDto = {
      ...buildFullSettingsPayload(tenant.settings),
      ...localeForm,
      site_url: siteForm.site_url || null,
      notify_on_inquiry: siteForm.notify_on_inquiry,
      inquiry_email: siteForm.inquiry_email || null,
      telegram_chat_id: siteForm.telegram_chat_id || null,
      ga_tracking_id: analyticsForm.ga_tracking_id || null,
      ym_counter_id: analyticsForm.ym_counter_id || null,
      email_provider: (emailForm.email_provider || null) as UpdateTenantSettingsDto["email_provider"],
      email_from_address: emailForm.email_from_address || null,
      email_from_name: emailForm.email_from_name || null,
      smtp_host: emailForm.smtp_host || null,
      smtp_port: emailForm.smtp_port ? parseInt(emailForm.smtp_port, 10) : null,
      smtp_user: emailForm.smtp_user || null,
      smtp_use_tls: emailForm.smtp_use_tls,
    };
    if (emailForm.smtp_password) payload.smtp_password = emailForm.smtp_password;
    if (emailForm.email_api_key) payload.email_api_key = emailForm.email_api_key;

    updateSettings(payload);
  };

  return (
    <div className="space-y-6">
      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle>Локализация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Язык"
              value={localeForm.default_locale}
              onChange={(e) => setLocaleForm({ ...localeForm, default_locale: e.target.value })}
              options={AVAILABLE_LOCALES.map((l) => ({ value: l.code, label: l.name }))}
            />
            <Select
              label="Часовой пояс"
              value={localeForm.timezone}
              onChange={(e) => setLocaleForm({ ...localeForm, timezone: e.target.value })}
              options={AVAILABLE_TIMEZONES.map((tz) => ({ value: tz.value, label: tz.label }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Формат даты"
              value={localeForm.date_format}
              onChange={(e) => setLocaleForm({ ...localeForm, date_format: e.target.value })}
              options={DATE_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
            />
            <Select
              label="Формат времени"
              value={localeForm.time_format}
              onChange={(e) => setLocaleForm({ ...localeForm, time_format: e.target.value })}
              options={TIME_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Site & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Сайт и уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="URL клиентского сайта"
            value={siteForm.site_url}
            onChange={(e) => setSiteForm({ ...siteForm, site_url: e.target.value })}
            placeholder="https://example.com"
          />
          <Switch
            checked={siteForm.notify_on_inquiry}
            onChange={(checked) => setSiteForm({ ...siteForm, notify_on_inquiry: checked })}
            label="Уведомления о заявках"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email для уведомлений"
              type="email"
              value={siteForm.inquiry_email}
              onChange={(e) => setSiteForm({ ...siteForm, inquiry_email: e.target.value })}
              placeholder="leads@example.com"
            />
            <Input
              label="Telegram Chat ID"
              value={siteForm.telegram_chat_id}
              onChange={(e) => setSiteForm({ ...siteForm, telegram_chat_id: e.target.value })}
              placeholder="-1001234567890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Аналитика</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Google Analytics ID"
              value={analyticsForm.ga_tracking_id}
              onChange={(e) => setAnalyticsForm({ ...analyticsForm, ga_tracking_id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <Input
              label="Yandex Metrika ID"
              value={analyticsForm.ym_counter_id}
              onChange={(e) => setAnalyticsForm({ ...analyticsForm, ym_counter_id: e.target.value })}
              placeholder="12345678"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Email-провайдер</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Провайдер"
            value={emailForm.email_provider}
            onChange={(e) => setEmailForm({ ...emailForm, email_provider: e.target.value })}
            options={EMAIL_PROVIDER_OPTIONS}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email отправителя"
              value={emailForm.email_from_address}
              onChange={(e) => setEmailForm({ ...emailForm, email_from_address: e.target.value })}
              placeholder="noreply@example.com"
            />
            <Input
              label="Имя отправителя"
              value={emailForm.email_from_name}
              onChange={(e) => setEmailForm({ ...emailForm, email_from_name: e.target.value })}
              placeholder="My Company"
            />
          </div>
          {emailForm.email_provider === "smtp" && (
            <div className="space-y-4 rounded-lg border border-[var(--color-border)] p-4">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">SMTP</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Сервер"
                  value={emailForm.smtp_host}
                  onChange={(e) => setEmailForm({ ...emailForm, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
                <Input
                  label="Порт"
                  value={emailForm.smtp_port}
                  onChange={(e) => setEmailForm({ ...emailForm, smtp_port: e.target.value })}
                  placeholder="587"
                />
              </div>
              <Input
                label="Логин"
                value={emailForm.smtp_user}
                onChange={(e) => setEmailForm({ ...emailForm, smtp_user: e.target.value })}
              />
              <Input
                label="Пароль"
                type="password"
                value={emailForm.smtp_password}
                onChange={(e) => setEmailForm({ ...emailForm, smtp_password: e.target.value })}
                placeholder={s?.smtp_password_configured ? "••••••• (настроен)" : "Введите пароль"}
              />
              <Switch
                checked={emailForm.smtp_use_tls}
                onChange={(checked) => setEmailForm({ ...emailForm, smtp_use_tls: checked })}
                label="STARTTLS"
              />
            </div>
          )}
          {(emailForm.email_provider === "sendgrid" || emailForm.email_provider === "mailgun") && (
            <Input
              label="API Key"
              type="password"
              value={emailForm.email_api_key}
              onChange={(e) => setEmailForm({ ...emailForm, email_api_key: e.target.value })}
              placeholder={s?.email_api_key_configured ? "••••••• (настроен)" : "Введите API-ключ"}
            />
          )}
          <div className="flex items-end gap-3 pt-2">
            <Input
              label="Тестовое письмо"
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="test@example.com"
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={() => testEmailAddress && sendTestEmail(testEmailAddress)}
              disabled={!testEmailAddress || isSendingTestEmail}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Отправить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Логи отправки email</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEmailLogs(!showEmailLogs)}
            >
              {showEmailLogs ? "Скрыть" : "Показать"}
            </Button>
          </div>
        </CardHeader>
        {showEmailLogs && (
          <CardContent>
            {isLoadingLogs ? (
              <div className="flex min-h-[80px] items-center justify-center">
                <Spinner />
              </div>
            ) : !emailLogsData?.items.length ? (
              <p className="text-sm text-[var(--color-text-muted)]">Нет записей</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="pb-2 text-left font-medium text-[var(--color-text-muted)]">Кому</th>
                      <th className="pb-2 text-left font-medium text-[var(--color-text-muted)]">Тема</th>
                      <th className="pb-2 text-left font-medium text-[var(--color-text-muted)]">Статус</th>
                      <th className="pb-2 text-left font-medium text-[var(--color-text-muted)]">Провайдер</th>
                      <th className="pb-2 text-left font-medium text-[var(--color-text-muted)]">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {emailLogsData.items.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 text-[var(--color-text-primary)]">{log.to_email}</td>
                        <td className="py-2 text-[var(--color-text-secondary)]">{log.subject}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              log.status === "sent" ? "success" :
                              log.status === "failed" ? "error" : "warning"
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-[var(--color-text-muted)]">{log.provider}</td>
                        <td className="py-2 text-[var(--color-text-muted)]">
                          {new Date(log.created_at).toLocaleString("ru")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} isLoading={isPending}>
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
