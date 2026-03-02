"use client";

import {
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

export function formatRelativeTime(dateString: string): string {
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

interface LeadStatusTimelineProps {
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  contactedAt: string | null;
}

export function LeadStatusTimeline({
  status,
  createdAt,
  updatedAt,
  contactedAt,
}: LeadStatusTimelineProps) {
  const config = INQUIRY_STATUS_CONFIG[status];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Статус заявки
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
