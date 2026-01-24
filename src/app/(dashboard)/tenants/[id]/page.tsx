"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Globe, Mail, Phone, Calendar, Pencil, Trash2, ToggleLeft } from "lucide-react";
import { useTenantDetail, useDeleteTenant } from "@/features/tenants";
import { Button, Badge, Spinner, Card, CardHeader, CardTitle, CardContent, ConfirmModal } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";
import { useState } from "react";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params.id;

  const { data: tenant, isLoading } = useTenantDetail(tenantId);
  const { mutate: deleteTenant, isPending: isDeleting } = useDeleteTenant();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDelete = () => {
    deleteTenant(tenantId, {
      onSuccess: () => {
        router.push(ROUTES.TENANTS);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
          Проект не найден
        </h2>
        <Button variant="secondary" onClick={() => router.push(ROUTES.TENANTS)}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.TENANTS)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-12 w-12 rounded-lg border border-[var(--color-border)] object-contain"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: tenant.primary_color || "var(--color-accent-primary)" }}
              >
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {tenant.name}
              </h1>
              <p className="text-[var(--color-text-muted)]">{tenant.slug}</p>
            </div>
            <Badge variant={tenant.is_active ? "success" : "error"} className="ml-2">
              {tenant.is_active ? "Активен" : "Неактивен"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.TENANT_MODULES(tenantId))}
          >
            <ToggleLeft className="mr-2 h-4 w-4" />
            Модули
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.TENANT_EDIT(tenantId))}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle>Общая информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenant.domain && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Домен</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {tenant.domain}
                  </p>
                </div>
              </div>
            )}
            {tenant.contact_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Email</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {tenant.contact_email}
                  </p>
                </div>
              </div>
            )}
            {tenant.contact_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Телефон</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {tenant.contact_phone}
                  </p>
                </div>
              </div>
            )}
            {tenant.primary_color && (
              <div className="flex items-center gap-3">
                <div
                  className="h-5 w-5 rounded-full border border-[var(--color-border)]"
                  style={{ backgroundColor: tenant.primary_color }}
                />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Основной цвет</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {tenant.primary_color}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Info */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenant.settings && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Язык по умолчанию</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {tenant.settings.default_locale}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Часовой пояс</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {tenant.settings.timezone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Формат даты</span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {tenant.settings.date_format}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Уведомления о заявках</span>
                  <Badge variant={tenant.settings.notify_on_inquiry ? "success" : "secondary"}>
                    {tenant.settings.notify_on_inquiry ? "Включены" : "Выключены"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Метаданные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Создан</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {formatDateTime(tenant.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Обновлен</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {formatDateTime(tenant.updated_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Версия</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {tenant.version}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить проект?"
        description={`Вы уверены, что хотите удалить проект "${tenant.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
