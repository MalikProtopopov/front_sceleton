"use client";

import { cn } from "@/shared/lib";
import type { UsageEntry } from "@/entities/billing";
import { limitLabels, formatLimit, usageStatusColors } from "../lib/billingConstants";

interface UsageProgressBarProps {
  limitKey: string;
  entry: UsageEntry;
  className?: string;
}

export function UsageProgressBar({ limitKey, entry, className }: UsageProgressBarProps) {
  const meta = limitLabels[limitKey];
  if (!meta) return null;

  const { current, limit, status } = entry;

  if (limit === 0) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">{meta.label}</span>
          <span className="text-[var(--color-text-muted)]">Не включено</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-bg-elevated)]" />
      </div>
    );
  }

  const isUnlimited = limit === -1;
  const percent = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const color = usageStatusColors[status];
  const currentFormatted = formatLimit(current, meta.unit);
  const limitFormatted = isUnlimited ? "∞" : formatLimit(limit, meta.unit);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-text-secondary)]">{meta.label}</span>
        <span className="font-medium text-[var(--color-text-primary)]">
          {currentFormatted} из {limitFormatted}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-bg-elevated)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: isUnlimited ? "5%" : `${percent}%`, backgroundColor: color }}
        />
      </div>
      {status === "warning" && (
        <p className="text-xs text-[var(--color-warning)]">
          Использовано более 80% лимита
        </p>
      )}
      {status === "exceeded" && (
        <p className="text-xs text-[var(--color-error)]">
          Лимит исчерпан
        </p>
      )}
    </div>
  );
}
