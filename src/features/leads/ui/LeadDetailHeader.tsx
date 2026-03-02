"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import {
  Button,
  Badge,
  Select,
  ConfirmModal,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import { COPY_FEEDBACK_DURATION } from "@/shared/config";
import type { Inquiry, InquiryStatus, MvpBriefFields } from "@/entities/inquiry";
import {
  INQUIRY_STATUS_CONFIG,
  FORM_SLUG_CONFIG,
  BRIEF_FIELD_LABELS,
  MARKET_OPTIONS,
  AUDIENCE_SIZE_OPTIONS,
  AI_REQUIRED_OPTIONS,
  APP_TYPES_OPTIONS,
  BUDGET_OPTIONS,
  URGENCY_OPTIONS,
  SOURCE_OPTIONS,
} from "@/entities/inquiry";
import { formatRelativeTime } from "./LeadStatusTimeline";

function buildLeadCopyText(lead: Inquiry): string {
  const lines: string[] = [];

  lines.push(`Имя: ${lead.name}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.phone) lines.push(`Телефон: ${lead.phone}`);
  if (lead.company) lines.push(`Компания: ${lead.company}`);

  const statusLabel = INQUIRY_STATUS_CONFIG[lead.status]?.label || lead.status;
  lines.push(`Статус: ${statusLabel}`);

  if (lead.form_slug) {
    const formLabel = FORM_SLUG_CONFIG[lead.form_slug]?.label || lead.form_slug;
    lines.push(`Тип заявки: ${formLabel}`);
  }

  if (lead.product) {
    lines.push(`Товар: ${lead.product.name || lead.product.slug} (${lead.product.sku})`);
  }

  if (lead.message) {
    lines.push(`Сообщение: ${lead.message}`);
  }

  if (lead.form_slug === "mvp-brief" && lead.custom_fields) {
    const fields = lead.custom_fields as MvpBriefFields;
    lines.push("");
    lines.push("--- Данные брифа ---");
    if (fields.idea) lines.push(`Идея продукта: ${fields.idea}`);
    if (fields.market) lines.push(`Рынок: ${MARKET_OPTIONS[fields.market] || fields.market}`);
    if (fields.audience) lines.push(`Целевая аудитория: ${fields.audience}`);
    if (fields.audienceSize) lines.push(`Размер аудитории: ${AUDIENCE_SIZE_OPTIONS[fields.audienceSize] || fields.audienceSize}`);
    if (fields.aiRequired) lines.push(`AI/ML: ${AI_REQUIRED_OPTIONS[fields.aiRequired] || fields.aiRequired}`);
    if (fields.appTypes && fields.appTypes.length > 0) {
      const appTypeLabels = fields.appTypes.map(t => APP_TYPES_OPTIONS[t] || t).join(", ");
      lines.push(`Типы приложений: ${appTypeLabels}`);
    }
    if (fields.integrations) lines.push(`Интеграции: ${fields.integrations}`);
    if (fields.budget) lines.push(`Бюджет: ${BUDGET_OPTIONS[fields.budget] || fields.budget}`);
    if (fields.urgency) lines.push(`Сроки: ${URGENCY_OPTIONS[fields.urgency] || fields.urgency}`);
    if (fields.telegram) lines.push(`Telegram: ${fields.telegram}`);
    if (fields.source) lines.push(`Откуда узнали: ${SOURCE_OPTIONS[fields.source] || fields.source}`);
  }

  if (lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.source_url || lead.referrer_url || lead.page_path) {
    lines.push("");
    lines.push("--- Источник ---");
    if (lead.utm_source) lines.push(`UTM Source: ${lead.utm_source}`);
    if (lead.utm_medium) lines.push(`UTM Medium: ${lead.utm_medium}`);
    if (lead.utm_campaign) lines.push(`UTM Campaign: ${lead.utm_campaign}`);
    if (lead.utm_term) lines.push(`UTM Term: ${lead.utm_term}`);
    if (lead.utm_content) lines.push(`UTM Content: ${lead.utm_content}`);
    if (lead.source_url) lines.push(`Страница: ${lead.source_url}`);
    if (lead.page_path) lines.push(`Путь: ${lead.page_path}`);
    if (lead.referrer_url) lines.push(`Реферер: ${lead.referrer_url}`);
  }

  if (lead.device_type || lead.browser || lead.os || lead.city || lead.country) {
    lines.push("");
    lines.push("--- Техническое ---");
    if (lead.device_type) lines.push(`Устройство: ${lead.device_type}`);
    if (lead.browser) lines.push(`Браузер: ${lead.browser}`);
    if (lead.os) lines.push(`ОС: ${lead.os}`);
    if (lead.city || lead.country) lines.push(`Локация: ${[lead.city, lead.country].filter(Boolean).join(", ")}`);
    if (lead.ip_address) lines.push(`IP: ${lead.ip_address}`);
  }

  lines.push("");
  lines.push(`Дата создания: ${formatDateTime(lead.created_at)}`);
  if (lead.contacted_at) lines.push(`Дата контакта: ${formatDateTime(lead.contacted_at)}`);

  if (lead.custom_fields) {
    const briefKeys = new Set(["idea", "market", "audience", "audienceSize", "aiRequired", "appTypes", "integrations", "budget", "urgency", "telegram", "source", "consent"]);
    const extraFields = Object.entries(lead.custom_fields).filter(([key, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (lead.form_slug === "mvp-brief" && briefKeys.has(key)) return false;
      return true;
    });
    if (extraFields.length > 0) {
      lines.push("");
      lines.push("--- Дополнительные поля ---");
      for (const [key, value] of extraFields) {
        const label = BRIEF_FIELD_LABELS[key] || key;
        lines.push(`${label}: ${String(value)}`);
      }
    }
  }

  if (lead.notes) {
    lines.push("");
    lines.push(`Заметки: ${lead.notes}`);
  }

  return lines.join("\n");
}

interface LeadDetailHeaderProps {
  lead: Inquiry;
  onStatusChange: (status: InquiryStatus) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function LeadDetailHeader({
  lead,
  onStatusChange,
  onDelete,
  isDeleting,
}: LeadDetailHeaderProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = INQUIRY_STATUS_CONFIG[lead.status];

  const handleCopyData = async () => {
    const text = buildLeadCopyText(lead);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    }
  };

  const handleDelete = () => {
    onDelete();
    setDeleteModalOpen(false);
  };

  return (
    <>
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
              {lead.form_slug && FORM_SLUG_CONFIG[lead.form_slug] && (
                <Badge variant={FORM_SLUG_CONFIG[lead.form_slug]!.variant}>
                  {FORM_SLUG_CONFIG[lead.form_slug]!.label}
                </Badge>
              )}
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
          <Button
            variant="secondary"
            onClick={handleCopyData}
            leftIcon={copied ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? "Скопировано" : "Скопировать данные"}
          </Button>
          <Select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value as InquiryStatus)}
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
    </>
  );
}
