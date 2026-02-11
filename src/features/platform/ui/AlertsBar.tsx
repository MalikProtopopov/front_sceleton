"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { PlatformAlerts } from "@/entities/platform";
import { ROUTES } from "@/shared/config";

const severityConfig = {
  critical: {
    bg: "bg-[var(--color-error)]/10",
    border: "border-[var(--color-error)]",
    text: "text-[var(--color-error)]",
    icon: AlertCircle,
    label: "Критических",
  },
  warning: {
    bg: "bg-[var(--color-warning)]/10",
    border: "border-[var(--color-warning)]",
    text: "text-[var(--color-warning)]",
    icon: AlertTriangle,
    label: "Предупреждений",
  },
  info: {
    bg: "bg-[var(--color-info)]/10",
    border: "border-[var(--color-info)]",
    text: "text-[var(--color-info)]",
    icon: Info,
    label: "Информация",
  },
} as const;

interface AlertsBarProps {
  data: PlatformAlerts;
}

export function AlertsBar({ data }: AlertsBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAlerts = data.alerts.length > 0;

  if (!hasAlerts) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] overflow-hidden">
      {/* Summary bar */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[var(--color-bg-hover)]"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Уведомления
          </span>
          <div className="flex gap-2">
            {(["critical", "warning", "info"] as const).map(
              (sev) =>
                data.summary[sev] > 0 && (
                  <span
                    key={sev}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${severityConfig[sev].bg} ${severityConfig[sev].text}`}
                  >
                    {data.summary[sev]} {severityConfig[sev].label.toLowerCase()}
                  </span>
                ),
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        )}
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-5 py-3 space-y-2">
          {data.alerts.map((alert, idx) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={`${alert.type}-${alert.tenant_id}-${idx}`}
                className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${config.border} ${config.bg}`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.text}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {alert.message}
                  </p>
                  {alert.tenant_name && alert.tenant_id && (
                    <Link
                      href={ROUTES.PLATFORM_TENANT_DETAIL(alert.tenant_id)}
                      className="mt-1 inline-block text-xs text-[var(--color-accent-primary)] hover:underline"
                    >
                      {alert.tenant_name} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
