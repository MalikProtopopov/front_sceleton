"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ToggleLeft, FileText, FolderOpen, Star, HelpCircle, Users, Globe, Search, BarChart3 } from "lucide-react";
import { useTenantDetail } from "@/features/tenants";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/features/settings";
import { Button, Card, CardHeader, CardTitle, CardContent, Spinner, Switch } from "@/shared/ui";
import { ROUTES } from "@/shared/config";

// Feature metadata with icons and Russian names
const FEATURE_META: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  blog_module: { name: "Блог / Статьи", icon: FileText },
  cases_module: { name: "Кейсы / Портфолио", icon: FolderOpen },
  reviews_module: { name: "Отзывы", icon: Star },
  faq_module: { name: "FAQ", icon: HelpCircle },
  team_module: { name: "Команда", icon: Users },
  multilang: { name: "Мультиязычность", icon: Globe },
  seo_advanced: { name: "Расширенное SEO", icon: Search },
  analytics_advanced: { name: "Расширенная аналитика", icon: BarChart3 },
};

export default function TenantModulesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params.id;

  const { data: tenant, isLoading: tenantLoading } = useTenantDetail(tenantId);
  const { data: featureFlagsData, isLoading: flagsLoading } = useFeatureFlags(tenantId);
  const { mutate: updateFeatureFlag, isPending: isUpdatingFlag } = useUpdateFeatureFlag(tenantId);

  const handleToggleFeature = (featureName: string, currentEnabled: boolean) => {
    updateFeatureFlag({
      featureName,
      data: { enabled: !currentEnabled },
    });
  };

  const isLoading = tenantLoading || flagsLoading;

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
          onClick={() => router.push(ROUTES.TENANT_DETAIL(tenantId))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <nav className="mb-1 text-sm text-[var(--color-text-muted)]">
            <span
              className="cursor-pointer hover:text-[var(--color-accent-primary)]"
              onClick={() => router.push(ROUTES.TENANTS)}
            >
              Проекты
            </span>
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-[var(--color-accent-primary)]"
              onClick={() => router.push(ROUTES.TENANT_DETAIL(tenantId))}
            >
              {tenant.name}
            </span>
            <span className="mx-2">/</span>
            <span>Модули</span>
          </nav>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text-primary)]">
            <ToggleLeft className="h-6 w-6" />
            Управление модулями
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Включайте и отключайте модули для проекта &quot;{tenant.name}&quot;
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные модули</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {featureFlagsData?.available_features &&
              Object.entries(featureFlagsData.available_features).map(([name, description]) => {
                const flag = featureFlagsData.items.find((f) => f.feature_name === name);
                const isEnabled = flag?.enabled ?? false;
                const meta = FEATURE_META[name];
                const Icon = meta?.icon || ToggleLeft;
                const displayName = meta?.name || name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                      isEnabled
                        ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
                        : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isEnabled
                            ? "bg-[var(--color-accent-primary)] text-white"
                            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isEnabled 
                            ? "text-[var(--color-text-primary)]" 
                            : "text-[var(--color-text-secondary)]"
                        }`}>
                          {displayName}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
                      </div>
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

          {(!featureFlagsData?.available_features || 
            Object.keys(featureFlagsData.available_features).length === 0) && (
            <div className="py-8 text-center text-[var(--color-text-muted)]">
              Нет доступных модулей
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
