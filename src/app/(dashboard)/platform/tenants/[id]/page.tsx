"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  FolderOpen,
  Files,
  Briefcase,
  Users,
  HelpCircle,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Badge, Button, Spinner, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformTenantDetails } from "@/features/platform";
import { getRoleLabel } from "@/entities/user";
import type { TenantDetailStats } from "@/entities/platform";

const STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6",
  in_progress: "#F59E0B",
  contacted: "#8B5CF6",
  completed: "#10B981",
  spam: "#EF4444",
  cancelled: "#6B7280",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новые",
  in_progress: "В работе",
  contacted: "Связались",
  completed: "Завершено",
  spam: "Спам",
  cancelled: "Отменено",
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Десктоп",
  mobile: "Мобильный",
  tablet: "Планшет",
};

const FEATURE_LABELS: Record<string, string> = {
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

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  publish: CheckCircle,
  unpublish: XCircle,
  login: Eye,
  logout: Eye,
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}м назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}ч назад`;
  const days = Math.floor(hours / 24);
  return `${days}д назад`;
}

function ContentTab({ data }: { data: TenantDetailStats }) {
  const { content, feature_flags } = data;

  return (
    <div className="space-y-6">
      {/* Content stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Articles */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Статьи</span>
          </div>
          <div className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
            <span>{content.articles.published} опубл.</span>
            <span>{content.articles.draft} черн.</span>
            <span>{content.articles.archived} арх.</span>
          </div>
        </div>
        {/* Cases */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Кейсы</span>
          </div>
          <div className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
            <span>{content.cases.published} опубл.</span>
            <span>{content.cases.draft} черн.</span>
            <span>{content.cases.archived} арх.</span>
          </div>
        </div>
        {/* Documents */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Files className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Документы</span>
          </div>
          <div className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
            <span>{content.documents.published} опубл.</span>
            <span>{content.documents.draft} черн.</span>
            <span>{content.documents.archived} арх.</span>
          </div>
        </div>
        {/* Services */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Услуги</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{content.services} / {content.services_total}</p>
        </div>
        {/* Employees */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Сотрудники</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{content.employees} / {content.employees_total}</p>
        </div>
        {/* FAQs */}
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">FAQ</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{content.faqs} / {content.faqs_total}</p>
        </div>
        {/* Reviews */}
        <div className="rounded-lg border border-[var(--color-border)] p-4 sm:col-span-2 xl:col-span-3">
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Отзывы</span>
          </div>
          <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
            <span>{content.reviews.approved} одобрено</span>
            <span>{content.reviews.pending} на модерации</span>
            <span>{content.reviews.rejected} отклонено</span>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Модули</h3>
        <div className="flex flex-wrap gap-2">
          {feature_flags.map((flag) => (
            <span
              key={flag.feature_name}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                flag.enabled
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
              }`}
            >
              {FEATURE_LABELS[flag.feature_name] || flag.feature_name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InquiriesTab({ data }: { data: TenantDetailStats }) {
  const { inquiries } = data;

  const statusData = Object.entries(inquiries.by_status).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    key: status,
  }));

  const utmData = Object.entries(inquiries.by_utm_source).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  const deviceData = Object.entries(inquiries.by_device_type).map(([device, count]) => ({
    name: DEVICE_LABELS[device] || device,
    value: count,
    key: device,
  }));

  const DEVICE_COLORS: Record<string, string> = {
    desktop: "#4F46E5",
    mobile: "#10B981",
    tablet: "#F59E0B",
  };

  return (
    <div className="space-y-6">
      {/* KPI + Pie charts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Avg Processing Time */}
        <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-info)]/5 p-6">
          <div className="text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-[var(--color-info)]" />
            <div className="text-3xl font-bold text-[var(--color-info)]">
              {inquiries.avg_processing_hours != null ? `${inquiries.avg_processing_hours}ч` : "—"}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">Среднее время обработки</div>
          </div>
        </div>

        {/* By Status - Pie */}
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">По статусу</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || "#6B7280"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Device - Pie */}
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">По устройствам</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {deviceData.map((entry) => (
                  <Cell key={entry.key} fill={DEVICE_COLORS[entry.key] || "#6B7280"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* UTM Sources */}
        {utmData.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] p-4">
            <h4 className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">Топ UTM-источники</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={utmData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Заявки" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Pages */}
        {inquiries.top_pages.length > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] p-4">
            <h4 className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">Топ страницы</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inquiries.top_pages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Заявки" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Countries */}
      {inquiries.by_country_top10.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] p-4">
          <h4 className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">Топ-10 стран</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inquiries.by_country_top10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="country" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={40} />
              <Tooltip />
              <Bar dataKey="count" name="Заявки" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function UsersTab({ data }: { data: TenantDetailStats }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Имя</th>
            <th className="px-4 py-3">Роль</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Посл. вход</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">{user.email}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                {user.role_name ? getRoleLabel(user.role_name) : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={user.is_active ? "success" : "error"}>
                  {user.is_active ? "Актив" : "Выкл"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                {timeAgo(user.last_login_at)}
              </td>
            </tr>
          ))}
          {data.users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                Нет пользователей
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTab({ data }: { data: TenantDetailStats }) {
  const ACTION_LABELS: Record<string, string> = {
    create: "Создание",
    update: "Изменение",
    delete: "Удаление",
    publish: "Публикация",
    unpublish: "Снятие",
    login: "Вход",
    logout: "Выход",
  };

  return (
    <div className="space-y-2">
      {data.recent_activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">Нет активности</p>
      ) : (
        data.recent_activity.map((entry) => {
          const Icon = ACTION_ICONS[entry.action] || Edit;
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] p-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
                <Icon className="h-4 w-4 text-[var(--color-text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)]">
                  <span className="font-medium">{ACTION_LABELS[entry.action] || entry.action}</span>
                  {" "}
                  <span className="text-[var(--color-text-secondary)]">{entry.resource_type}</span>
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  {entry.user_email && <span>{entry.user_email}</span>}
                  <span>·</span>
                  <span>{timeAgo(entry.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function PlatformTenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = usePlatformTenantDetails(params.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">Организация не найдена</h2>
        <Button variant="secondary" onClick={() => router.push(ROUTES.PLATFORM_DASHBOARD)}>
          Вернуться к дашборду
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
          onClick={() => router.push(ROUTES.PLATFORM_DASHBOARD)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {data.tenant_name}
            </h1>
            <Badge variant={data.is_active ? "success" : "error"}>
              {data.is_active ? "Активна" : "Неактивна"}
            </Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{data.tenant_slug}</p>
        </div>
        <Link href={ROUTES.TENANT_DETAIL(data.tenant_id)}>
          <Button variant="secondary" size="sm">Управление</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="inquiries">Заявки ({data.inquiries.total})</TabsTrigger>
          <TabsTrigger value="users">Пользователи ({data.users.length})</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentTab data={data} />
        </TabsContent>

        <TabsContent value="inquiries">
          <InquiriesTab data={data} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab data={data} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
