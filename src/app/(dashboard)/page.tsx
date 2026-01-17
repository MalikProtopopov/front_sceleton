"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Briefcase,
  Users,
  Star,
  HelpCircle,
  MessageSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useDashboard } from "@/features/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Spinner, Badge } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";
import type { DashboardActivity } from "@/entities/dashboard";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

function StatCard({ title, value, icon, href, color = "var(--color-accent-primary)" }: StatCardProps) {
  const router = useRouter();
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-[var(--color-border-hover)]"
      onClick={() => router.push(href)}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
        </div>
        <div 
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

interface InquiryStatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "info";
}

function InquiryStat({ label, value, icon, variant }: InquiryStatProps) {
  const variantColors = {
    default: "var(--color-text-muted)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  };
  
  const color = variantColors[variant];
  
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-4">
      <div 
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: "Создание",
    update: "Обновление",
    delete: "Удаление",
    publish: "Публикация",
    unpublish: "Снятие с публикации",
    approve: "Одобрение",
    reject: "Отклонение",
  };
  return labels[action] || action;
}

function getResourceLabel(resourceType: string): string {
  const labels: Record<string, string> = {
    article: "Статья",
    case: "Кейс",
    employee: "Сотрудник",
    faq: "FAQ",
    review: "Отзыв",
    service: "Услуга",
    inquiry: "Заявка",
    seo_route: "SEO",
    user: "Пользователь",
  };
  return labels[resourceType] || resourceType;
}

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-border)] py-3 last:border-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
        <Activity className="h-4 w-4 text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-medium">{getActionLabel(activity.action)}</span>
          {" "}
          <span className="text-[var(--color-text-muted)]">{getResourceLabel(activity.resource_type)}</span>
          {activity.resource_name && (
            <>
              {" "}
              <span className="text-[var(--color-text-secondary)]">&quot;{activity.resource_name}&quot;</span>
            </>
          )}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{activity.user?.name || activity.user?.email || "Система"}</span>
          <span>·</span>
          <span>{formatDateTime(activity.timestamp)}</span>
        </div>
      </div>
      <Badge variant={activity.status === "success" ? "success" : "error"} className="text-xs">
        {activity.status === "success" ? "OK" : "Ошибка"}
      </Badge>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
        {icon}
      </div>
      <span className="flex-1 text-left text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
    </button>
  );
}

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-[var(--color-error)]" />
        <p className="text-[var(--color-text-secondary)]">Не удалось загрузить статистику</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Дашборд</h1>
        <p className="text-[var(--color-text-secondary)]">
          Обзор контента и активности
        </p>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Статьи"
          value={dashboard.summary.total_articles}
          icon={<FileText className="h-6 w-6" />}
          href={ROUTES.ARTICLES}
          color="var(--color-info)"
        />
        <StatCard
          title="Кейсы"
          value={dashboard.summary.total_cases}
          icon={<Briefcase className="h-6 w-6" />}
          href={ROUTES.CASES}
          color="var(--color-accent-primary)"
        />
        <StatCard
          title="Команда"
          value={dashboard.summary.total_team_members}
          icon={<Users className="h-6 w-6" />}
          href={ROUTES.TEAM}
          color="var(--color-success)"
        />
        <StatCard
          title="Услуги"
          value={dashboard.summary.total_services}
          icon={<Briefcase className="h-6 w-6" />}
          href={ROUTES.SERVICES}
          color="var(--color-warning)"
        />
        <StatCard
          title="FAQ"
          value={dashboard.summary.total_faqs}
          icon={<HelpCircle className="h-6 w-6" />}
          href={ROUTES.FAQ}
          color="var(--color-info)"
        />
        <StatCard
          title="Отзывы"
          value={dashboard.summary.total_reviews}
          icon={<Star className="h-6 w-6" />}
          href={ROUTES.REVIEWS}
          color="var(--color-warning)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Inquiries Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Заявки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InquiryStat
                label="Всего"
                value={dashboard.inquiries.total}
                icon={<MessageSquare className="h-5 w-5" />}
                variant="default"
              />
              <InquiryStat
                label="Новых"
                value={dashboard.inquiries.pending}
                icon={<AlertCircle className="h-5 w-5" />}
                variant="warning"
              />
              <InquiryStat
                label="В работе"
                value={dashboard.inquiries.in_progress}
                icon={<Clock className="h-5 w-5" />}
                variant="info"
              />
              <InquiryStat
                label="За месяц"
                value={dashboard.inquiries.this_month}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="success"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink
              href={ROUTES.ARTICLE_NEW}
              icon={<FileText className="h-4 w-4 text-[var(--color-text-muted)]" />}
              label="Новая статья"
            />
            <QuickLink
              href={ROUTES.CASE_NEW}
              icon={<Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />}
              label="Новый кейс"
            />
            <QuickLink
              href={ROUTES.LEADS}
              icon={<MessageSquare className="h-4 w-4 text-[var(--color-text-muted)]" />}
              label="Просмотр заявок"
            />
            <QuickLink
              href={ROUTES.MEDIA}
              icon={<Star className="h-4 w-4 text-[var(--color-text-muted)]" />}
              label="Медиатека"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content by Status - Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Статьи по статусу</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-success)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">Опубликовано</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.articles.published}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-warning)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">Черновики</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.articles.draft}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">В архиве</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.articles.archived}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content by Status - Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Кейсы по статусу</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-success)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">Опубликовано</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.cases.published}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-warning)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">Черновики</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.cases.draft}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">В архиве</span>
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {dashboard.content_by_status.cases.archived}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {dashboard.recent_activity && dashboard.recent_activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Последняя активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {dashboard.recent_activity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
