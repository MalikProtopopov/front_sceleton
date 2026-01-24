"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { 
  Mail, 
  Phone, 
  Building2, 
  Globe, 
  MapPin, 
  Monitor, 
  Link as LinkIcon,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Trash2,
  Bell,
  BellOff,
  Hash,
  Eye,
  Smartphone,
  Laptop,
  Tablet,
  Network,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLead, useUpdateLead, useDeleteLead } from "@/features/leads";
import {
  Button,
  Spinner,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Textarea,
  ConfirmModal,
} from "@/shared/ui";
import { formatDateTime, cn } from "@/shared/lib";
import type { InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDateTime(dateString);
}

// Device icon component
function DeviceIcon({ deviceType }: { deviceType: string | null }) {
  if (!deviceType) return <Monitor className="h-4 w-4" />;
  const type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("phone")) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (type.includes("tablet")) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Laptop className="h-4 w-4" />;
}

// Info row component for consistent styling
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 py-2", className)}>
      <Icon className="h-4 w-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-sm text-[var(--color-accent-primary)] hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

// Status timeline component
function StatusTimeline({
  status,
  createdAt,
  updatedAt,
  contactedAt,
}: {
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  contactedAt: string | null;
}) {
  const config = INQUIRY_STATUS_CONFIG[status];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              status === "completed"
                ? "var(--color-success-bg)"
                : status === "spam"
                  ? "var(--color-error-bg)"
                  : "var(--color-info-bg)",
          }}
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
          ) : status === "spam" || status === "cancelled" ? (
            <AlertCircle className="h-5 w-5 text-[var(--color-error)]" />
          ) : (
            <Clock className="h-5 w-5 text-[var(--color-info)]" />
          )}
        </div>
        <div>
          <Badge variant={config.variant} className="mb-1">
            {config.label}
          </Badge>
          <p className="text-xs text-[var(--color-text-muted)]">
            Обновлено {formatRelativeTime(updatedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Создана</p>
          <p className="text-[var(--color-text-primary)] font-medium">
            {formatDateTime(createdAt)}
          </p>
        </div>
        {contactedAt && (
          <div className="p-3 rounded-lg border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Связались</p>
            <p className="text-[var(--color-text-primary)] font-medium">
              {formatDateTime(contactedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showTechnicalData, setShowTechnicalData] = useState(false);

  const { data: lead, isLoading, error } = useLead(id);
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead(id);
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !lead) {
    notFound();
  }

  const handleStatusChange = (status: InquiryStatus) => {
    updateLead({ status });
  };

  const handleSaveNotes = () => {
    updateLead({ notes });
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    deleteLead(id);
    setDeleteModalOpen(false);
  };

  const statusConfig = INQUIRY_STATUS_CONFIG[lead.status];

  // Check if we have any source/analytics data
  const hasUtmData =
    lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_term || lead.utm_content;
  const hasSourceData = hasUtmData || lead.source_url || lead.referrer_url || lead.page_path;

  // Check if we have any technical data
  const hasTechnicalData =
    lead.ip_address ||
    lead.device_type ||
    lead.browser ||
    lead.os ||
    lead.city ||
    lead.country ||
    lead.session_id ||
    lead.session_page_views ||
    lead.time_on_page;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mt-1 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {lead.name}
            </h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          {lead.company && (
            <p className="mt-1 text-[var(--color-text-secondary)]">{lead.company}</p>
          )}
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Создана {formatRelativeTime(lead.created_at)}
          </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
            options={Object.entries(INQUIRY_STATUS_CONFIG).map(([value, { label }]) => ({
              value,
              label,
            }))}
            minWidth={140}
            className="h-10"
          />
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Удалить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column - Contact & Message */}
        <div className="lg:col-span-2 space-y-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Контактная информация
              </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {lead.email && (
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={lead.email}
                    href={`mailto:${lead.email}`}
                  />
            )}
            {lead.phone && (
                  <InfoRow
                    icon={Phone}
                    label="Телефон"
                    value={lead.phone}
                    href={`tel:${lead.phone}`}
                  />
            )}
            {lead.company && (
                  <InfoRow icon={Building2} label="Компания" value={lead.company} />
                )}
              </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Сообщение
              </CardTitle>
          </CardHeader>
          <CardContent>
            {lead.message ? (
                <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </p>
            ) : (
                <p className="text-[var(--color-text-muted)] italic">Сообщение не указано</p>
            )}
          </CardContent>
        </Card>

        {/* Source & Analytics */}
          {hasSourceData && (
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Источник и аналитика
                </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                {/* UTM Tags */}
                {hasUtmData && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      UTM метки
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {lead.utm_source && (
                        <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Source</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {lead.utm_source}
                          </p>
                    </div>
                  )}
                  {lead.utm_medium && (
                        <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Medium</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {lead.utm_medium}
                          </p>
                    </div>
                  )}
                  {lead.utm_campaign && (
                        <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Campaign</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {lead.utm_campaign}
                          </p>
                        </div>
                      )}
                      {lead.utm_term && (
                        <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Term</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {lead.utm_term}
                          </p>
                        </div>
                      )}
                      {lead.utm_content && (
                        <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Content</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {lead.utm_content}
                          </p>
                    </div>
                  )}
                </div>
              </div>
            )}

                {/* Page Info */}
                <div className="grid gap-1 sm:grid-cols-2">
            {lead.source_url && (
                    <InfoRow
                      icon={LinkIcon}
                      label="Страница отправки"
                      value={lead.page_path || lead.source_url}
                    href={lead.source_url} 
                    />
                  )}
                  {lead.page_title && (
                    <InfoRow icon={FileText} label="Заголовок страницы" value={lead.page_title} />
                  )}
                  {lead.referrer_url && (
                    <InfoRow
                      icon={Globe}
                      label="Источник перехода"
                      value={lead.referrer_url}
                      href={lead.referrer_url}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            )}

          {/* Technical Data - Collapsible */}
          {hasTechnicalData && (
            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowTechnicalData(!showTechnicalData)}
                  className="flex w-full items-center justify-between"
                >
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Технические данные
                  </CardTitle>
                  {showTechnicalData ? (
                    <ChevronUp className="h-5 w-5 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" />
                  )}
                </button>
              </CardHeader>
              {showTechnicalData && (
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Device Info */}
                    {(lead.device_type || lead.browser || lead.os) && (
                      <div className="p-3 rounded-lg border border-[var(--color-border)]">
                        <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                          <DeviceIcon deviceType={lead.device_type} />
                          Устройство
                        </h4>
                        <div className="space-y-1 text-sm">
                          {lead.device_type && (
                            <p className="text-[var(--color-text-primary)]">{lead.device_type}</p>
                          )}
                          {lead.browser && (
                            <p className="text-[var(--color-text-secondary)]">{lead.browser}</p>
                          )}
                          {lead.os && (
                            <p className="text-[var(--color-text-secondary)]">{lead.os}</p>
                          )}
                </div>
              </div>
            )}

                    {/* Location */}
            {(lead.city || lead.country) && (
                      <div className="p-3 rounded-lg border border-[var(--color-border)]">
                        <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          Геолокация
                        </h4>
                        <p className="text-sm text-[var(--color-text-primary)]">
                  {[lead.city, lead.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* IP Address */}
                    {lead.ip_address && (
                      <div className="p-3 rounded-lg border border-[var(--color-border)]">
                        <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                          <Network className="h-4 w-4" />
                          IP адрес
                        </h4>
                        <p className="text-sm text-[var(--color-text-primary)] font-mono">
                          {lead.ip_address}
                        </p>
              </div>
            )}

                    {/* Session Info */}
                    {(lead.session_id || lead.session_page_views || lead.time_on_page) && (
                      <div className="p-3 rounded-lg border border-[var(--color-border)]">
                        <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          Сессия
                        </h4>
                        <div className="space-y-1 text-sm">
                          {lead.session_page_views && (
                            <p className="text-[var(--color-text-primary)]">
                              {lead.session_page_views} просмотров
                            </p>
                          )}
                          {lead.time_on_page && (
                            <p className="text-[var(--color-text-secondary)]">
                              {Math.round(lead.time_on_page / 60)} мин. на странице
                            </p>
                          )}
                          {lead.session_id && (
                            <p className="text-[var(--color-text-muted)] text-xs font-mono truncate">
                              ID: {lead.session_id}
                            </p>
                          )}
                </div>
              </div>
            )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Custom Fields */}
          {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Дополнительные поля
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(lead.custom_fields).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)]"
                    >
                      <p className="text-xs text-[var(--color-text-muted)] capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Status & Notes */}
        <div className="space-y-6">
          {/* Status & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Статус заявки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline
                status={lead.status}
                createdAt={lead.created_at}
                updatedAt={lead.updated_at}
                contactedAt={lead.contacted_at}
              />
          </CardContent>
        </Card>

          {/* Assignment */}
          {lead.assigned_to && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Назначено
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-medium">
                    {lead.assigned_to.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {lead.assigned_to}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Ответственный</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Заметки
                </CardTitle>
              {!isEditingNotes && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setNotes(lead.notes || "");
                    setIsEditingNotes(true);
                  }}
                >
                  Редактировать
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                    placeholder="Добавьте заметки о заявке..."
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} isLoading={isUpdating}>
                    Сохранить
                  </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : lead.notes ? (
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                  {lead.notes}
                </p>
            ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  Заметки не добавлены
                </p>
            )}
          </CardContent>
        </Card>

          {/* Notification Status */}
        <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {lead.notification_sent ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
                      <Bell className="h-4 w-4 text-[var(--color-success)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Уведомление отправлено
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Email уведомление было отправлено
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                      <BellOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Уведомление не отправлено
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Email уведомление не было отправлено
                      </p>
                    </div>
                  </>
                )}
                </div>
          </CardContent>
        </Card>

          {/* Meta Info */}
          <div className="text-xs text-[var(--color-text-muted)] space-y-1 px-1">
            <p>ID: {lead.id}</p>
            {lead.form_id && <p>Форма: {lead.form_id}</p>}
            {lead.service_id && <p>Услуга: {lead.service_id}</p>}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить заявку?"
        description={`Вы уверены, что хотите удалить заявку от "${lead.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
