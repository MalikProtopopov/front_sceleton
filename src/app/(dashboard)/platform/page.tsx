"use client";

import { Spinner } from "@/shared/ui";
import {
  usePlatformOverview,
  usePlatformAlerts,
  usePlatformTrends,
} from "@/features/platform";
import { OverviewCards } from "@/features/platform/ui/OverviewCards";
import { AlertsBar } from "@/features/platform/ui/AlertsBar";
import { TrendsCharts } from "@/features/platform/ui/TrendsCharts";
import { PlatformTenantsTable } from "@/features/platform/ui/PlatformTenantsTable";

export default function PlatformDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = usePlatformOverview();
  const { data: alerts, isLoading: alertsLoading } = usePlatformAlerts();
  const { data: trends, isLoading: trendsLoading } = usePlatformTrends(90);

  const isInitialLoading = overviewLoading || alertsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Дашборд платформы
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Обзор всех организаций и ключевых метрик
        </p>
      </div>

      {isInitialLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          {overview && <OverviewCards data={overview} />}

          {/* Alerts */}
          {alerts && <AlertsBar data={alerts} />}

          {/* Trends Charts */}
          {trendsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              <Spinner size="lg" />
            </div>
          ) : (
            trends && <TrendsCharts data={trends} />
          )}

          {/* Tenants Table */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Организации
            </h2>
            <PlatformTenantsTable />
          </div>
        </>
      )}
    </div>
  );
}
