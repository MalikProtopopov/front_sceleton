"use client";

import { useState } from "react";
import { Settings, Globe, Bell, BarChart3, KeyRound, MessageSquare, Search, Mail } from "lucide-react";
import { useTenant } from "@/features/settings";
import { Tabs, Tab, Spinner } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { TelegramSettingsTab } from "@/features/telegram";
import {
  GeneralSettingsTab,
  LocaleSettingsTab,
  NotificationSettingsTab,
  SeoSettingsTab,
  AnalyticsSettingsTab,
  EmailSettingsTab,
  SecuritySettingsTab,
} from "@/features/settings";

export default function SettingsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "";

  const { isLoading } = useTenant(tenantId);
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
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
        <Tab
          label={
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Основные
            </span>
          }
        >
          <div className="mt-6">
            <GeneralSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

        <Tab
          label={
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Локализация
            </span>
          }
        >
          <div className="mt-6">
            <LocaleSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

        <Tab
          label={
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </span>
          }
        >
          <div className="mt-6">
            <NotificationSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

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

        <Tab
          label={
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Сайт и SEO
            </span>
          }
        >
          <div className="mt-6">
            <SeoSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

        <Tab
          label={
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </span>
          }
        >
          <div className="mt-6">
            <AnalyticsSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

        <Tab
          label={
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </span>
          }
        >
          <div className="mt-6">
            <EmailSettingsTab tenantId={tenantId} />
          </div>
        </Tab>

        <Tab
          label={
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Безопасность
            </span>
          }
        >
          <div className="mt-6">
            <SecuritySettingsTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
