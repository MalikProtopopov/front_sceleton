"use client";

import { useState, useEffect, useCallback } from "react";
import { useTenant, useUpdateTenant, useUploadTenantLogo, useDeleteTenantLogo } from "../model/useSettings";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

interface GeneralSettingsTabProps {
  tenantId: string;
}

export function GeneralSettingsTab({ tenantId }: GeneralSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateTenant, isPending: isUpdatingTenant } = useUpdateTenant(tenantId);
  const { mutate: uploadLogo, isPending: isUploadingLogo } = useUploadTenantLogo(tenantId);
  const { mutate: deleteLogo, isPending: isDeletingLogo } = useDeleteTenantLogo(tenantId);

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [generalForm, setGeneralForm] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    primary_color: "#1E40AF",
  });

  useEffect(() => {
    if (tenant?.logo_url) {
      setLogoPreviewUrl(tenant.logo_url);
    }
  }, [tenant?.logo_url]);

  useEffect(() => {
    if (tenant) {
      setGeneralForm({
        name: tenant.name,
        contact_email: tenant.contact_email || "",
        contact_phone: tenant.contact_phone || "",
        primary_color: tenant.primary_color || "#1E40AF",
      });
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
    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);

    uploadLogo(file, {
      onSuccess: (updatedTenant) => {
        if (updatedTenant?.logo_url) {
          setLogoPreviewUrl(updatedTenant.logo_url);
          URL.revokeObjectURL(previewUrl);
        }
      },
      onError: () => {
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

  return (
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
  );
}
