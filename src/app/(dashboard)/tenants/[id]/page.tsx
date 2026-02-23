"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  Briefcase,
  FolderOpen,
  Star,
  Search,
  BarChart3,
  FileText,
  HelpCircle,
  Users,
  ToggleLeft,
} from "lucide-react";
import { useTenantDetail, useDeleteTenant, TenantDomainsTab, TenantSettingsTab } from "@/features/tenants";
import { TenantUsersTab } from "@/features/tenants/ui/TenantUsersTab";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/features/settings";
import {
  Button,
  Badge,
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ConfirmModal,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  blog_module: FileText,
  cases_module: FolderOpen,
  reviews_module: Star,
  faq_module: HelpCircle,
  team_module: Users,
  services_module: Briefcase,
  seo_advanced: Search,
  multilang: Globe,
  analytics_advanced: BarChart3,
};

const featureLabels: Record<string, string> = {
  blog_module: "Блог / Статьи",
  cases_module: "Кейсы / Портфолио",
  reviews_module: "Отзывы",
  faq_module: "Вопросы и ответы",
  team_module: "Команда / Сотрудники",
  services_module: "Услуги",
  seo_advanced: "Расширенное SEO",
  multilang: "Мультиязычность",
  analytics_advanced: "Расширенная аналитика",
};

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params.id;

  const { data: tenant, isLoading } = useTenantDetail(tenantId);
  const { mutate: deleteTenant, isPending: isDeleting } = useDeleteTenant();

  const { data: flagsData, isLoading: isFlagsLoading } = useFeatureFlags(tenantId);
  const { mutate: updateFlag, isPending: isUpdatingFlag } = useUpdateFeatureFlag(tenantId);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Feature flag disable confirmation
  const [disableConfirm, setDisableConfirm] = useState<{ name: string; label: string } | null>(null);

  const handleDelete = () => {
    deleteTenant(tenantId, {
      onSuccess: () => {
        router.push(ROUTES.TENANTS);
      },
    });
  };

  const handleToggleFeature = (featureName: string, enabled: boolean) => {
    if (!enabled) {
      const label = featureLabels[featureName] || featureName;
      setDisableConfirm({ name: featureName, label });
    } else {
      updateFlag({ featureName, data: { enabled } });
    }
  };

  const confirmDisableFeature = () => {
    if (disableConfirm) {
      updateFlag({ featureName: disableConfirm.name, data: { enabled: false } });
      setDisableConfirm(null);
    }
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

  const enabledFeatures = new Map(
    flagsData?.items.map((flag) => [flag.feature_name, flag.enabled]) ?? [],
  );
  const availableFeatures = flagsData?.available_features ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.TENANTS)}>
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
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{tenant.name}</h1>
              <p className="text-[var(--color-text-muted)]">{tenant.slug}</p>
            </div>
            <Badge variant={tenant.is_active ? "success" : "error"} className="ml-2">
              {tenant.is_active ? "Активен" : "Неактивен"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(ROUTES.TENANT_EDIT(tenantId))}>
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Основное</TabsTrigger>
          <TabsTrigger value="domains">Домены</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="modules">Модули</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>

        {/* General Info */}
        <TabsContent value="details">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Общая информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant.settings && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)]">Язык</span>
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
                      <span className="text-[var(--color-text-muted)]">Уведомления</span>
                      <Badge variant={tenant.settings.notify_on_inquiry ? "success" : "secondary"}>
                        {tenant.settings.notify_on_inquiry ? "Включены" : "Выключены"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Версия</p>
                    <p className="font-medium text-[var(--color-text-primary)]">{tenant.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Domains */}
        <TabsContent value="domains">
          <TenantDomainsTab tenantId={tenantId} />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <TenantSettingsTab tenant={tenant} />
        </TabsContent>

        {/* Modules / Feature Flags */}
        <TabsContent value="modules">
          {isFlagsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : Object.keys(availableFeatures).length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <ToggleLeft className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
              <h3 className="mb-2 text-lg font-medium text-[var(--color-text-primary)]">
                Модули недоступны
              </h3>
              <p className="text-[var(--color-text-muted)]">
                Для этого проекта нет доступных модулей
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(availableFeatures).map(([featureName, description]) => {
                const Icon = featureIcons[featureName] || ToggleLeft;
                const isEnabled = enabledFeatures.get(featureName) ?? false;
                const label = featureLabels[featureName] || featureName;
                const descriptionText =
                  typeof description === "string"
                    ? description
                    : description?.description_ru ||
                      description?.description ||
                      description?.title_ru ||
                      description?.title ||
                      "";

                return (
                  <Card key={featureName}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isEnabled
                                ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium leading-tight text-[var(--color-text-primary)]">
                              {label}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                              {descriptionText}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onChange={(checked) => handleToggleFeature(featureName, checked)}
                          disabled={isUpdatingFlag}
                          className="shrink-0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <TenantUsersTab tenantId={tenantId} tenantName={tenant.name} />
        </TabsContent>
      </Tabs>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить организацию?"
        description="Организация будет удалена. Все пользователи потеряют доступ. Это действие необратимо."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Feature disable confirm */}
      <ConfirmModal
        isOpen={!!disableConfirm}
        onClose={() => setDisableConfirm(null)}
        onConfirm={confirmDisableFeature}
        title={`Отключить модуль «${disableConfirm?.label}»?`}
        description="Все пользователи потеряют доступ к этому разделу. Продолжить?"
        confirmText="Отключить"
        variant="danger"
      />
    </div>
  );
}
