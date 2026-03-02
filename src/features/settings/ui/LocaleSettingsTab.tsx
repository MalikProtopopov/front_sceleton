"use client";

import { useState, useEffect } from "react";
import { useTenant, useUpdateTenantSettings } from "../model/useSettings";
import { Button, Select, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import { AVAILABLE_LOCALES, AVAILABLE_TIMEZONES, DATE_FORMATS, TIME_FORMATS } from "@/entities/tenant";
import type { UpdateTenantSettingsDto } from "@/entities/tenant";
import { buildFullSettingsPayload } from "../lib/buildFullSettingsPayload";

interface LocaleSettingsTabProps {
  tenantId: string;
}

export function LocaleSettingsTab({ tenantId }: LocaleSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateTenantSettings(tenantId);

  const [localeForm, setLocaleForm] = useState<UpdateTenantSettingsDto>({
    default_locale: "ru",
    timezone: "Europe/Moscow",
    date_format: "DD.MM.YYYY",
    time_format: "HH:mm",
  });

  useEffect(() => {
    if (tenant?.settings) {
      setLocaleForm({
        default_locale: tenant.settings.default_locale,
        timezone: tenant.settings.timezone,
        date_format: tenant.settings.date_format,
        time_format: tenant.settings.time_format,
      });
    }
  }, [tenant]);

  const handleSaveLocale = () => {
    updateSettings({
      ...buildFullSettingsPayload(tenant?.settings),
      ...localeForm,
    });
  };

  return (
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
  );
}
