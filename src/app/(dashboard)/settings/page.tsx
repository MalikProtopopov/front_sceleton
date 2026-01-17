"use client";

import { useState, useEffect } from "react";
import { Settings, Globe, Bell, BarChart3, ToggleLeft, KeyRound, MessageSquare } from "lucide-react";
import { useTenant, useUpdateTenant, useUpdateTenantSettings, useFeatureFlags, useUpdateFeatureFlag, useChangePassword } from "@/features/settings";
import { 
  Button, Input, Select, Card, CardHeader, CardTitle, CardContent, 
  Tabs, Tab, Spinner, Switch 
} from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { TelegramSettingsTab } from "@/features/telegram";
import type { UpdateTenantSettingsDto } from "@/entities/tenant";
import { AVAILABLE_LOCALES, AVAILABLE_TIMEZONES, DATE_FORMATS, TIME_FORMATS } from "@/entities/tenant";

export default function SettingsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "";
  
  const { data: tenant, isLoading } = useTenant(tenantId);
  const { data: featureFlagsData, isLoading: flagsLoading } = useFeatureFlags(tenantId);
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateTenantSettings(tenantId);
  const { mutate: updateFeatureFlag, isPending: isUpdatingFlag } = useUpdateFeatureFlag(tenantId);
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [activeTab, setActiveTab] = useState(0);

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
    logo_url: "",
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
  });

  // Populate forms when tenant data loads
  useEffect(() => {
    if (tenant) {
      setGeneralForm({
        name: tenant.name,
        contact_email: tenant.contact_email || "",
        contact_phone: tenant.contact_phone || "",
        logo_url: tenant.logo_url || "",
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
        });
      }
    }
  }, [tenant]);

  const handleSaveGeneral = () => {
    if (tenant) {
      updateTenant({
        name: generalForm.name,
        contact_email: generalForm.contact_email || undefined,
        contact_phone: generalForm.contact_phone || undefined,
        logo_url: generalForm.logo_url || undefined,
        primary_color: generalForm.primary_color,
        version: tenant.version,
      });
    }
  };

  const handleSaveLocale = () => {
    updateSettings(localeForm);
  };

  const handleSaveNotifications = () => {
    updateSettings(notificationForm);
  };

  const handleSaveAnalytics = () => {
    updateSettings(analyticsForm);
  };

  const handleToggleFeature = (featureName: string, currentEnabled: boolean) => {
    updateFeatureFlag({
      featureName,
      data: { enabled: !currentEnabled },
    });
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
              <Input
                label="URL логотипа"
                value={generalForm.logo_url}
                onChange={(e) => setGeneralForm({ ...generalForm, logo_url: e.target.value })}
                placeholder="https://..."
              />
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

        {/* Analytics Settings */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </span>
          }
        >
          <Card className="mt-6">
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
              <Input
                label="OG-изображение по умолчанию"
                value={analyticsForm.default_og_image || ""}
                onChange={(e) => setAnalyticsForm({ ...analyticsForm, default_og_image: e.target.value })}
                placeholder="https://..."
              />
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAnalytics} isLoading={isUpdatingSettings}>
                  Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tab>

        {/* Feature Flags */}
        <Tab 
          label={
            <span className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4" />
              Модули
            </span>
          }
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Управление модулями</CardTitle>
            </CardHeader>
            <CardContent>
              {flagsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {featureFlagsData?.available_features &&
                    Object.entries(featureFlagsData.available_features).map(([name, description]) => {
                      const flag = featureFlagsData.items.find((f) => f.feature_name === name);
                      const isEnabled = flag?.enabled ?? false;

                      return (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-4"
                        >
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                              {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onChange={() => handleToggleFeature(name, isEnabled)}
                            disabled={isUpdatingFlag}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
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
