"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useTenant, useUpdateTenantSettings } from "../model/useSettings";
import { buildFullSettingsPayload } from "../lib/buildFullSettingsPayload";
import { useSendTestEmail } from "@/features/tenants";
import type { UpdateTenantSettingsDto } from "@/entities/tenant";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
} from "@/shared/ui";

const EMAIL_PROVIDER_OPTIONS = [
  { value: "", label: "Глобальный (по умолчанию)" },
  { value: "smtp", label: "SMTP" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "mailgun", label: "Mailgun" },
  { value: "console", label: "Console (для тестов)" },
];

interface EmailSettingsTabProps {
  tenantId: string;
}

export function EmailSettingsTab({ tenantId }: EmailSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } =
    useUpdateTenantSettings(tenantId);
  const { mutate: sendTestEmail, isPending: isSendingTestEmail } =
    useSendTestEmail(tenantId);

  const [emailForm, setEmailForm] = useState({
    email_provider: "" as string,
    email_from_address: "",
    email_from_name: "",
    smtp_host: "",
    smtp_port: "" as string,
    smtp_user: "",
    smtp_use_tls: true,
    smtp_password: "",
    email_api_key: "",
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [smtpPasswordConfigured, setSmtpPasswordConfigured] = useState(false);
  const [emailApiKeyConfigured, setEmailApiKeyConfigured] = useState(false);

  useEffect(() => {
    if (tenant?.settings) {
      setEmailForm({
        email_provider: tenant.settings.email_provider || "",
        email_from_address: tenant.settings.email_from_address || "",
        email_from_name: tenant.settings.email_from_name || "",
        smtp_host: tenant.settings.smtp_host || "",
        smtp_port:
          tenant.settings.smtp_port != null
            ? String(tenant.settings.smtp_port)
            : "",
        smtp_user: tenant.settings.smtp_user || "",
        smtp_use_tls: tenant.settings.smtp_use_tls ?? true,
        smtp_password: "",
        email_api_key: "",
      });
      setSmtpPasswordConfigured(
        tenant.settings.smtp_password_configured ?? false,
      );
      setEmailApiKeyConfigured(
        tenant.settings.email_api_key_configured ?? false,
      );
    }
  }, [tenant]);

  const handleSaveEmail = () => {
    const payload: UpdateTenantSettingsDto = {
      ...buildFullSettingsPayload(tenant?.settings),
      email_provider: (emailForm.email_provider ||
        null) as UpdateTenantSettingsDto["email_provider"],
      email_from_address: emailForm.email_from_address || null,
      email_from_name: emailForm.email_from_name || null,
      smtp_host: emailForm.smtp_host || null,
      smtp_port: emailForm.smtp_port
        ? parseInt(emailForm.smtp_port, 10)
        : null,
      smtp_user: emailForm.smtp_user || null,
      smtp_use_tls: emailForm.smtp_use_tls,
    };
    if (emailForm.smtp_password) {
      payload.smtp_password = emailForm.smtp_password;
    }
    if (emailForm.email_api_key) {
      payload.email_api_key = emailForm.email_api_key;
    }
    updateSettings(payload);
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress) return;
    sendTestEmail(testEmailAddress);
  };

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Провайдер и отправитель</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Email-провайдер"
            value={emailForm.email_provider}
            onChange={(e) =>
              setEmailForm({ ...emailForm, email_provider: e.target.value })
            }
            options={EMAIL_PROVIDER_OPTIONS}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email отправителя"
              type="email"
              value={emailForm.email_from_address}
              onChange={(e) =>
                setEmailForm({
                  ...emailForm,
                  email_from_address: e.target.value,
                })
              }
              placeholder="noreply@example.com"
            />
            <Input
              label="Имя отправителя"
              value={emailForm.email_from_name}
              onChange={(e) =>
                setEmailForm({
                  ...emailForm,
                  email_from_name: e.target.value,
                })
              }
              placeholder="My Company"
            />
          </div>
        </CardContent>
      </Card>

      {emailForm.email_provider === "smtp" && (
        <Card>
          <CardHeader>
            <CardTitle>SMTP-настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="SMTP-сервер"
                value={emailForm.smtp_host}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, smtp_host: e.target.value })
                }
                placeholder="smtp.gmail.com"
              />
              <Input
                label="Порт"
                value={emailForm.smtp_port}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, smtp_port: e.target.value })
                }
                placeholder="587"
              />
            </div>
            <Input
              label="SMTP-логин"
              value={emailForm.smtp_user}
              onChange={(e) =>
                setEmailForm({ ...emailForm, smtp_user: e.target.value })
              }
              placeholder="user@gmail.com"
            />
            <div>
              <Input
                label="SMTP-пароль"
                type="password"
                value={emailForm.smtp_password}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, smtp_password: e.target.value })
                }
                placeholder={
                  smtpPasswordConfigured
                    ? "••••••• (настроен, оставьте пустым чтобы не менять)"
                    : "Введите пароль"
                }
              />
              {smtpPasswordConfigured && !emailForm.smtp_password && (
                <p className="mt-1 text-xs text-green-600">
                  Пароль настроен
                </p>
              )}
            </div>
            <Switch
              checked={emailForm.smtp_use_tls}
              onChange={(checked) =>
                setEmailForm({ ...emailForm, smtp_use_tls: checked })
              }
              label="STARTTLS"
              description="Порт 587 — STARTTLS, порт 465 — SSL"
            />
          </CardContent>
        </Card>
      )}

      {(emailForm.email_provider === "sendgrid" ||
        emailForm.email_provider === "mailgun") && (
        <Card>
          <CardHeader>
            <CardTitle>
              API-ключ{" "}
              {emailForm.email_provider === "sendgrid"
                ? "SendGrid"
                : "Mailgun"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                label="API Key"
                type="password"
                value={emailForm.email_api_key}
                onChange={(e) =>
                  setEmailForm({
                    ...emailForm,
                    email_api_key: e.target.value,
                  })
                }
                placeholder={
                  emailApiKeyConfigured
                    ? "••••••• (настроен, оставьте пустым чтобы не менять)"
                    : "Введите API-ключ"
                }
              />
              {emailApiKeyConfigured && !emailForm.email_api_key && (
                <p className="mt-1 text-xs text-green-600">
                  API-ключ настроен
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Тестирование</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <Input
              label="Отправить тестовое письмо"
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="test@example.com"
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={handleSendTestEmail}
              disabled={!testEmailAddress || isSendingTestEmail}
              leftIcon={<Send className="h-4 w-4" />}
            >
              {isSendingTestEmail ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveEmail} isLoading={isUpdatingSettings}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
