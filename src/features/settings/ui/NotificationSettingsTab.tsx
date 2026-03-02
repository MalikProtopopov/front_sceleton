"use client";

import { useState, useEffect } from "react";
import { useTenant, useUpdateTenantSettings } from "../model/useSettings";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Switch } from "@/shared/ui";
import type { UpdateTenantSettingsDto } from "@/entities/tenant";
import { buildFullSettingsPayload } from "../lib/buildFullSettingsPayload";

interface NotificationSettingsTabProps {
  tenantId: string;
}

export function NotificationSettingsTab({ tenantId }: NotificationSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateTenantSettings(tenantId);

  const [notificationForm, setNotificationForm] = useState<UpdateTenantSettingsDto>({
    notify_on_inquiry: true,
    inquiry_email: "",
    telegram_chat_id: "",
  });

  useEffect(() => {
    if (tenant?.settings) {
      setNotificationForm({
        notify_on_inquiry: tenant.settings.notify_on_inquiry,
        inquiry_email: tenant.settings.inquiry_email || "",
        telegram_chat_id: tenant.settings.telegram_chat_id || "",
      });
    }
  }, [tenant]);

  const handleSaveNotifications = () => {
    updateSettings({
      ...buildFullSettingsPayload(tenant?.settings),
      ...notificationForm,
    });
  };

  return (
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
  );
}
