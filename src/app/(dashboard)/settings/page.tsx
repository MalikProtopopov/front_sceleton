"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Globe, Bell, BarChart3, KeyRound, MessageSquare, Search, Plus, Trash2, ImageIcon, Info } from "lucide-react";
import { useTenant, useUpdateTenant, useUpdateTenantSettings, useChangePassword, useUploadTenantLogo, useDeleteTenantLogo } from "@/features/settings";
import { 
  Button, Input, Select, Card, CardHeader, CardTitle, CardContent, 
  Tabs, Tab, Spinner, Switch, Textarea
} from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { TelegramSettingsTab } from "@/features/telegram";
import { MediaPickerModal } from "@/features/media";
import { getFileContentUrl } from "@/shared/lib";
import type { UpdateTenantSettingsDto, SitemapStaticPage } from "@/entities/tenant";
import { AVAILABLE_LOCALES, AVAILABLE_TIMEZONES, DATE_FORMATS, TIME_FORMATS } from "@/entities/tenant";

const CHANGEFREQ_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "";
  
  const { data: tenant, isLoading } = useTenant(tenantId);
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateTenantSettings(tenantId);
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: uploadLogo, isPending: isUploadingLogo } = useUploadTenantLogo(tenantId);
  const { mutate: deleteLogo, isPending: isDeletingLogo } = useDeleteTenantLogo(tenantId);

  const [activeTab, setActiveTab] = useState(0);
  
  // Logo state - track preview URL (either from tenant data or local preview after upload)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  
  // Update preview when tenant data loads
  useEffect(() => {
    if (tenant?.logo_url) {
      setLogoPreviewUrl(tenant.logo_url);
    }
  }, [tenant?.logo_url]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // General settings state
  const [generalForm, setGeneralForm] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    primary_color: "#1E40AF",
  });

  // Localization settings state
  const [localeForm, setLocaleForm] = useState<UpdateTenantSettingsDto>({
    default_locale: "ru",
    timezone: "Europe/Moscow",
    date_format: "DD.MM.YYYY",
    time_format: "HH:mm",
  });

  // Notification settings state
  const [notificationForm, setNotificationForm] = useState<UpdateTenantSettingsDto>({
    notify_on_inquiry: true,
    inquiry_email: "",
    telegram_chat_id: "",
  });

  // Analytics settings state
  const [analyticsForm, setAnalyticsForm] = useState<UpdateTenantSettingsDto>({
    ga_tracking_id: "",
    ym_counter_id: "",
    default_og_image: "",
    yandex_verification_code: "",
    google_verification_code: "",
    google_verification_meta: "",
  });

  // Webmaster verification validation errors
  const [webmasterErrors, setWebmasterErrors] = useState<{
    yandex?: string;
    google_code?: string;
  }>({});

  // SEO settings state
  const [seoForm, setSeoForm] = useState({
    site_url: "",
    allowed_domains: "" as string, // comma-separated string for input, converted to array on save
    robots_txt_custom_rules: "",
  });
  const [sitemapPages, setSitemapPages] = useState<SitemapStaticPage[]>([]);
  const [siteUrlError, setSiteUrlError] = useState<string | null>(null);
  const [ogImagePickerOpen, setOgImagePickerOpen] = useState(false);

  // Populate forms when tenant data loads
  useEffect(() => {
    if (tenant) {
      setGeneralForm({
        name: tenant.name,
        contact_email: tenant.contact_email || "",
        contact_phone: tenant.contact_phone || "",
        primary_color: tenant.primary_color || "#1E40AF",
      });

      if (tenant.settings) {
        setLocaleForm({
          default_locale: tenant.settings.default_locale,
          timezone: tenant.settings.timezone,
          date_format: tenant.settings.date_format,
          time_format: tenant.settings.time_format,
        });

        setNotificationForm({
          notify_on_inquiry: tenant.settings.notify_on_inquiry,
          inquiry_email: tenant.settings.inquiry_email || "",
          telegram_chat_id: tenant.settings.telegram_chat_id || "",
        });

        setAnalyticsForm({
          ga_tracking_id: tenant.settings.ga_tracking_id || "",
          ym_counter_id: tenant.settings.ym_counter_id || "",
          default_og_image: tenant.settings.default_og_image || "",
          yandex_verification_code: tenant.settings.yandex_verification_code || "",
          google_verification_code: tenant.settings.google_verification_code || "",
          google_verification_meta: tenant.settings.google_verification_meta || "",
        });

        setSeoForm({
          site_url: tenant.settings.site_url || "",
          allowed_domains: tenant.settings.allowed_domains?.join(", ") || "",
          robots_txt_custom_rules: tenant.settings.robots_txt_custom_rules || "",
        });
        setSitemapPages(tenant.settings.sitemap_static_pages || []);
      }
    }
  }, [tenant]);

  const handleSaveGeneral = () => {
    if (tenant) {
      updateTenant({
        name: generalForm.name,
        contact_email: generalForm.contact_email || undefined,
        contact_phone: generalForm.contact_phone || undefined,
        primary_color: generalForm.primary_color,
        version: tenant.version,
      });
    }
  };

  const handleLogoUpload = useCallback((file: File) => {
    // Create local preview URL immediately
    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);
    
    uploadLogo(file, {
      onSuccess: (updatedTenant) => {
        // If backend returns logo_url, use it; otherwise keep local preview
        if (updatedTenant?.logo_url) {
          setLogoPreviewUrl(updatedTenant.logo_url);
          // Revoke the blob URL to free memory
          URL.revokeObjectURL(previewUrl);
        }
      },
      onError: () => {
        // Revert to previous state on error
        setLogoPreviewUrl(tenant?.logo_url || null);
        URL.revokeObjectURL(previewUrl);
      },
    });
  }, [uploadLogo, tenant?.logo_url]);

  const handleLogoDelete = useCallback(() => {
    deleteLogo(undefined, {
      onSuccess: () => {
        setLogoPreviewUrl(null);
      },
    });
  }, [deleteLogo]);

  const handleSaveLocale = () => {
    updateSettings(localeForm);
  };

  const handleSaveNotifications = () => {
    updateSettings(notificationForm);
  };

  const handleSaveAnalytics = () => {
    setWebmasterErrors({});
    const errors: { yandex?: string; google_code?: string } = {};

    if (analyticsForm.yandex_verification_code && !/^yandex_[a-f0-9]+$/.test(analyticsForm.yandex_verification_code)) {
      errors.yandex = "Формат: yandex_[hex], например: yandex_821edd51f146c052";
    }

    if (analyticsForm.google_verification_code && !/^google[a-f0-9]+$/.test(analyticsForm.google_verification_code)) {
      errors.google_code = "Формат: google[hex], например: google1234567890abcdef";
    }

    if (Object.keys(errors).length > 0) {
      setWebmasterErrors(errors);
      return;
    }

    updateSettings({
      ...analyticsForm,
      yandex_verification_code: analyticsForm.yandex_verification_code || null,
      google_verification_code: analyticsForm.google_verification_code || null,
      google_verification_meta: analyticsForm.google_verification_meta || null,
    });
  };

  // SEO handlers
  const handleSaveSeo = () => {
    setSiteUrlError(null);

    // Validate site_url if provided
    if (seoForm.site_url && !/^https?:\/\/.+/.test(seoForm.site_url)) {
      setSiteUrlError("URL должен начинаться с http:// или https://");
      return;
    }

    // Parse allowed_domains from comma-separated string
    const domainsArray = seoForm.allowed_domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    // Filter out empty sitemap pages
    const validSitemapPages = sitemapPages.filter((p) => p.path.trim());

    updateSettings({
      site_url: seoForm.site_url || null,
      allowed_domains: domainsArray.length > 0 ? domainsArray : null,
      sitemap_static_pages: validSitemapPages.length > 0 ? validSitemapPages : null,
      robots_txt_custom_rules: seoForm.robots_txt_custom_rules || null,
    });
  };

  const handleAddSitemapPage = () => {
    setSitemapPages([...sitemapPages, { path: "/", priority: 0.5, changefreq: "weekly" }]);
  };

  const handleRemoveSitemapPage = (index: number) => {
    setSitemapPages(sitemapPages.filter((_, i) => i !== index));
  };

  const handleUpdateSitemapPage = (index: number, field: keyof SitemapStaticPage, value: string | number) => {
    setSitemapPages(
      sitemapPages.map((page, i) =>
        i === index ? { ...page, [field]: value } : page
      )
    );
  };

  const handleChangePassword = () => {
    setPasswordError(null);

    if (passwordForm.new_password.length < 8) {
      setPasswordError("Новый пароль должен содержать минимум 8 символов");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    changePassword(
      {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      },
      {
        onSuccess: () => {
          setPasswordForm({
            current_password: "",
            new_password: "",
            confirm_password: "",
          });
        },
      }
    );
  };

  if (isLoading || !tenant) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Настройки</h1>
        <p className="text-[var(--color-text-secondary)]">
          Управление настройками системы
        </p>
      </div>

      <Tabs activeIndex={activeTab} onChange={setActiveTab}>
        {/* General Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Основные
            </span>
          }
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Информация об организации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Название организации"
                value={generalForm.name}
                onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Контактный email"
                  type="email"
                  value={generalForm.contact_email}
                  onChange={(e) => setGeneralForm({ ...generalForm, contact_email: e.target.value })}
                />
                <Input
                  label="Контактный телефон"
                  value={generalForm.contact_phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Логотип
                </label>
                <div className="space-y-3">
                  {logoPreviewUrl && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreviewUrl}
                        alt="Логотип"
                        className="h-20 w-auto rounded border border-[var(--color-border)] object-contain"
                        onError={() => {
                          setLogoPreviewUrl(null);
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                      disabled={isUploadingLogo || isDeletingLogo}
                      className="block w-full text-sm text-[var(--color-text-secondary)]
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-[var(--radius-md)] file:border-0
                        file:text-sm file:font-medium
                        file:bg-[var(--color-accent-primary)] file:text-white
                        file:cursor-pointer
                        hover:file:bg-[var(--color-accent-primary-hover)]
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {logoPreviewUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleLogoDelete}
                        disabled={isUploadingLogo || isDeletingLogo}
                      >
                        Удалить
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Поддерживаемые форматы: JPEG, PNG, WebP, GIF. Максимальный размер: 10 MB
                  </p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                  Основной цвет бренда
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={generalForm.primary_color}
                    onChange={(e) => setGeneralForm({ ...generalForm, primary_color: e.target.value })}
                    className="h-10 w-16 cursor-pointer rounded border border-[var(--color-border)]"
                  />
                  <Input
                    value={generalForm.primary_color}
                    onChange={(e) => setGeneralForm({ ...generalForm, primary_color: e.target.value })}
                    className="w-32"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneral} isLoading={isUpdatingTenant}>
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tab>

        {/* Localization Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Локализация
            </span>
          }
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Региональные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Язык по умолчанию"
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
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveLocale} isLoading={isUpdatingSettings}>
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tab>

        {/* Notification Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </span>
          }
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Switch
                checked={notificationForm.notify_on_inquiry}
                onChange={(checked) => setNotificationForm({ ...notificationForm, notify_on_inquiry: checked })}
                label="Уведомления о новых заявках"
                description="Получать уведомления при поступлении новых лидов"
              />
              <Input
                label="Email для уведомлений"
                type="email"
                value={notificationForm.inquiry_email || ""}
                onChange={(e) => setNotificationForm({ ...notificationForm, inquiry_email: e.target.value })}
                placeholder="leads@example.com"
              />
              <Input
                label="Telegram Chat ID"
                value={notificationForm.telegram_chat_id || ""}
                onChange={(e) => setNotificationForm({ ...notificationForm, telegram_chat_id: e.target.value })}
                placeholder="-1001234567890"
              />
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} isLoading={isUpdatingSettings}>
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tab>

        {/* Telegram Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Telegram
            </span>
          }
        >
          <div className="mt-6">
            <TelegramSettingsTab />
          </div>
        </Tab>

        {/* SEO / Site Settings */}
        <Tab
          label={
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Сайт и SEO
            </span>
          }
        >
          <div className="mt-6 space-y-6">
            {/* Site URL */}
            <Card>
              <CardHeader>
                <CardTitle>URL сайта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Базовый URL клиентского сайта"
                  value={seoForm.site_url}
                  onChange={(e) => {
                    setSeoForm({ ...seoForm, site_url: e.target.value });
                    setSiteUrlError(null);
                  }}
                  placeholder="https://example.com"
                  error={siteUrlError || undefined}
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Используется для генерации sitemap.xml и robots.txt. Укажите полный URL без слэша в конце, например: https://mediann.dev
                </p>
              </CardContent>
            </Card>

            {/* Allowed Domains */}
            <Card>
              <CardHeader>
                <CardTitle>Разрешённые домены</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Домены (через запятую)"
                  value={seoForm.allowed_domains}
                  onChange={(e) => setSeoForm({ ...seoForm, allowed_domains: e.target.value })}
                  placeholder="example.com, www.example.com"
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Список разрешённых доменов для проверки base URL. Например: mediann.dev, www.mediann.dev
                </p>
              </CardContent>
            </Card>

            {/* Sitemap Static Pages */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Статические страницы Sitemap</CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddSitemapPage}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sitemapPages.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Нет статических страниц. Нажмите «Добавить» чтобы указать страницы для sitemap.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sitemapPages.map((page, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] p-3"
                      >
                        <div className="grid flex-1 gap-3 md:grid-cols-3">
                          <Input
                            label="Путь"
                            value={page.path}
                            onChange={(e) => handleUpdateSitemapPage(index, "path", e.target.value)}
                            placeholder="/"
                          />
                          <Input
                            label="Приоритет (0–1)"
                            type="number"
                            value={String(page.priority)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0 && val <= 1) {
                                handleUpdateSitemapPage(index, "priority", val);
                              }
                            }}
                            placeholder="0.5"
                          />
                          <Select
                            label="Частота обновления"
                            value={page.changefreq}
                            onChange={(e) => handleUpdateSitemapPage(index, "changefreq", e.target.value)}
                            options={CHANGEFREQ_OPTIONS}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSitemapPage(index)}
                          className="mt-7 rounded p-1.5 text-[var(--color-error)] transition-colors hover:bg-[var(--color-bg-hover)]"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[var(--color-text-muted)]">
                  Статические страницы попадут в sitemap.xml с указанным приоритетом и частотой обновления.
                </p>
              </CardContent>
            </Card>

            {/* Robots.txt Custom Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Robots.txt — дополнительные правила</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="Пользовательские правила robots.txt"
                  value={seoForm.robots_txt_custom_rules}
                  onChange={(e) => setSeoForm({ ...seoForm, robots_txt_custom_rules: e.target.value })}
                  placeholder={"User-agent: *\nAllow: /"}
                  rows={6}
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Дополнительные строки, которые будут добавлены в конец robots.txt. Максимум 5000 символов.
                </p>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSeo} isLoading={isUpdatingSettings}>
                Сохранить
              </Button>
            </div>
          </div>
        </Tab>

        {/* Analytics Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </span>
          }
        >
          <div className="mt-6 space-y-6">
            {/* Analytics Counters */}
            <Card>
              <CardHeader>
                <CardTitle>Настройки аналитики</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Google Analytics ID"
                  value={analyticsForm.ga_tracking_id || ""}
                  onChange={(e) => setAnalyticsForm({ ...analyticsForm, ga_tracking_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
                <Input
                  label="Yandex Metrika ID"
                  value={analyticsForm.ym_counter_id || ""}
                  onChange={(e) => setAnalyticsForm({ ...analyticsForm, ym_counter_id: e.target.value })}
                  placeholder="12345678"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    OG-изображение по умолчанию
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={analyticsForm.default_og_image || ""}
                      onChange={(e) => setAnalyticsForm({ ...analyticsForm, default_og_image: e.target.value })}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOgImagePickerOpen(true)}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Выбрать
                    </Button>
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      Превью-изображение, которое отображается при публикации ссылки на ваш сайт в социальных сетях и мессенджерах (Telegram, Facebook, Twitter и др.). Рекомендуемый размер: 1200x630px.
                    </span>
                  </p>
                  {analyticsForm.default_og_image && (
                    <div className="mt-3 rounded-lg border border-[var(--color-border)] p-2">
                      <img
                        src={analyticsForm.default_og_image}
                        alt="OG Preview"
                        className="h-32 w-auto object-contain mx-auto rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <MediaPickerModal
                  isOpen={ogImagePickerOpen}
                  onClose={() => setOgImagePickerOpen(false)}
                  onSelect={(file) => {
                    setAnalyticsForm({ ...analyticsForm, default_og_image: getFileContentUrl(file) });
                    setOgImagePickerOpen(false);
                  }}
                  imagesOnly
                  title="Выбрать OG-изображение"
                />
              </CardContent>
            </Card>

            {/* Webmaster Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Верификация в поисковых системах</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Подтвердите владение сайтом для поисковых систем. 
                  Коды можно получить в Яндекс.Вебмастере или Google Search Console.
                </p>

                <Input
                  label="Яндекс.Вебмастер"
                  value={analyticsForm.yandex_verification_code || ""}
                  onChange={(e) => {
                    setAnalyticsForm({ ...analyticsForm, yandex_verification_code: e.target.value });
                    if (webmasterErrors.yandex) setWebmasterErrors((prev) => ({ ...prev, yandex: undefined }));
                  }}
                  placeholder="yandex_821edd51f146c052"
                  hint="Название файла без расширения .html"
                  error={webmasterErrors.yandex}
                  maxLength={255}
                />

                <Input
                  label="Google Search Console (файл)"
                  value={analyticsForm.google_verification_code || ""}
                  onChange={(e) => {
                    setAnalyticsForm({ ...analyticsForm, google_verification_code: e.target.value });
                    if (webmasterErrors.google_code) setWebmasterErrors((prev) => ({ ...prev, google_code: undefined }));
                  }}
                  placeholder="google1234567890abcdef"
                  hint="Название файла без расширения .html"
                  error={webmasterErrors.google_code}
                  maxLength={255}
                />

                <Input
                  label="Google Search Console (мета-тег)"
                  value={analyticsForm.google_verification_meta || ""}
                  onChange={(e) => setAnalyticsForm({ ...analyticsForm, google_verification_meta: e.target.value })}
                  placeholder="1234567890abcdef1234567890abcdef"
                  hint="Значение атрибута content из мета-тега (альтернатива файлу)"
                  maxLength={500}
                />

                <details className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <span className="ml-1">Как получить код верификации?</span>
                  </summary>
                  <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                    <div>
                      <p className="mb-1 font-medium text-[var(--color-text-secondary)]">Яндекс.Вебмастер:</p>
                      <ol className="list-decimal space-y-0.5 pl-5">
                        <li>Откройте <a href="https://webmaster.yandex.ru/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">webmaster.yandex.ru</a></li>
                        <li>Добавьте ваш сайт</li>
                        <li>Выберите способ подтверждения «HTML-файл»</li>
                        <li>Скопируйте название файла (например, <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">yandex_821edd51f146c052.html</code>)</li>
                        <li>Уберите <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">.html</code> и вставьте в поле выше</li>
                      </ol>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-[var(--color-text-secondary)]">Google Search Console (файл):</p>
                      <ol className="list-decimal space-y-0.5 pl-5">
                        <li>Откройте <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">Google Search Console</a></li>
                        <li>Добавьте ресурс</li>
                        <li>Выберите «HTML-файл»</li>
                        <li>Скачайте файл и посмотрите его название</li>
                        <li>Уберите <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">.html</code> и вставьте в поле</li>
                      </ol>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-[var(--color-text-secondary)]">Google Search Console (мета-тег):</p>
                      <ol className="list-decimal space-y-0.5 pl-5">
                        <li>Откройте <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">Google Search Console</a></li>
                        <li>Добавьте ресурс</li>
                        <li>Выберите «HTML-тег»</li>
                        <li>Скопируйте значение из <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">content=&quot;...&quot;</code></li>
                        <li>Вставьте в поле</li>
                      </ol>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveAnalytics} isLoading={isUpdatingSettings}>
                Сохранить
              </Button>
            </div>
          </div>
        </Tab>

        {/* Change Password */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Безопасность
            </span>
          }
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              <Input
                label="Текущий пароль"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                placeholder="Введите текущий пароль"
                required
              />
              <Input
                label="Новый пароль"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                placeholder="Минимум 8 символов"
                required
              />
              <Input
                label="Подтверждение пароля"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                placeholder="Повторите новый пароль"
                error={passwordError || undefined}
                required
              />
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleChangePassword}
                  isLoading={isChangingPassword}
                  disabled={
                    !passwordForm.current_password ||
                    !passwordForm.new_password ||
                    !passwordForm.confirm_password
                  }
                >
                  Изменить пароль
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
