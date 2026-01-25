"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderOpen,
  Star,
  Search,
  Globe,
  BarChart3,
  FileText,
  HelpCircle,
  Users,
  ToggleLeft,
} from "lucide-react";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/features/settings";
import { useTenantDetail } from "@/features/tenants";
import { Button, Card, CardContent, Spinner, Switch } from "@/shared/ui";
import { ROUTES } from "@/shared/config";

// Map feature names to icons
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cases_module: FolderOpen,
  reviews_module: Star,
  seo_advanced: Search,
  multilang: Globe,
  analytics_advanced: BarChart3,
  blog_module: FileText,
  faq_module: HelpCircle,
  team_module: Users,
};

// Russian translations for feature names
const featureLabels: Record<string, string> = {
  cases_module: "Кейсы / портфолио",
  reviews_module: "Отзывы клиентов",
  seo_advanced: "Расширённый SEO",
  multilang: "Многоязычность",
  analytics_advanced: "Расширенная аналитика",
  blog_module: "Блог / статьи",
  faq_module: "FAQ",
  team_module: "Команда / сотрудники",
};

export default function TenantModulesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params.id;

  const { data: tenant, isLoading: isTenantLoading } = useTenantDetail(tenantId);
  const { data: flagsData, isLoading: isFlagsLoading } = useFeatureFlags(tenantId);
  const { mutate: updateFlag, isPending: isUpdating } = useUpdateFeatureFlag(tenantId);

  const isLoading = isTenantLoading || isFlagsLoading;

  // Build a map of enabled features from items array
  const enabledFeatures = new Map(
    flagsData?.items.map((flag) => [flag.feature_name, flag.enabled]) ?? []
  );

  // Get all available features from the response
  const availableFeatures = flagsData?.available_features ?? {};

  const handleToggle = (featureName: string, enabled: boolean) => {
    updateFlag({ featureName, data: { enabled } });
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
          onClick={() => router.push(ROUTES.TENANT_DETAIL(tenantId))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Модули
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление модулями для {tenant.name}
          </p>
        </div>
      </div>

      {/* Feature Flags Grid */}
      {Object.keys(availableFeatures).length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(availableFeatures).map(([featureName, description]) => {
            const Icon = featureIcons[featureName] || ToggleLeft;
            const isEnabled = enabledFeatures.get(featureName) ?? false;
            const label = featureLabels[featureName] || featureName;

            return (
              <Card key={featureName} className="relative">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isEnabled
                          ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--color-text-primary)]">
                        {label}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                        {description}
                      </p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onChange={(checked) => handleToggle(featureName, checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
