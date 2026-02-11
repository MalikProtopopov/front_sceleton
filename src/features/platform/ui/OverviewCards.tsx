"use client";

import {
  Building2,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { PlatformOverview } from "@/entities/platform";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: { value: number; direction: "up" | "down" };
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">{value.toLocaleString("ru-RU")}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${
              trend.direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
            }`}>
              {trend.direction === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trend.direction === "up" ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

interface OverviewCardsProps {
  data: PlatformOverview;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  // Calculate inquiries trend
  const inquiriesTrend = data.inquiries_prev_month > 0
    ? Math.round(((data.inquiries_this_month - data.inquiries_prev_month) / data.inquiries_prev_month) * 100)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Организации"
        value={data.total_tenants}
        subtitle={`Активных: ${data.active_tenants} · Неактивных: ${data.inactive_tenants}`}
        icon={Building2}
        color="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
      />
      <StatCard
        title="Пользователи"
        value={data.total_users}
        subtitle={`Активных: ${data.active_users}`}
        icon={Users}
        color="bg-[var(--color-success)]/10 text-[var(--color-success)]"
      />
      <StatCard
        title="Заявки за месяц"
        value={data.inquiries_this_month}
        subtitle={`Всего: ${data.total_inquiries.toLocaleString("ru-RU")} · Пред. мес: ${data.inquiries_prev_month}`}
        icon={MessageSquare}
        color="bg-[var(--color-info)]/10 text-[var(--color-info)]"
        trend={inquiriesTrend !== 0 ? {
          value: Math.abs(inquiriesTrend),
          direction: inquiriesTrend > 0 ? "up" : "down",
        } : undefined}
      />
      <StatCard
        title="Неактивные 30д"
        value={data.inactive_tenants_30d}
        subtitle="Нет входов >30 дней"
        icon={AlertTriangle}
        color="bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
      />
    </div>
  );
}
