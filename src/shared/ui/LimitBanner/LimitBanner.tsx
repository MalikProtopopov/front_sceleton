"use client";

import Link from "next/link";
import { AlertTriangle, Info, XCircle, Lock } from "lucide-react";
import { cn } from "@/shared/lib";
import { RESOURCE_NAMES } from "@/shared/lib/accessConstants";
import { ROUTES } from "@/shared/config";
import type { UsageEntry } from "@/entities/billing";

interface LimitBannerProps {
  limitKey: string;
  entry: UsageEntry;
  className?: string;
}

export function LimitBanner({ limitKey, entry, className }: LimitBannerProps) {
  const { current, limit, status } = entry;

  // Unlimited — don't show anything
  if (limit === null) return null;

  const label = RESOURCE_NAMES[limitKey] ?? limitKey;

  if (status === "not_available") {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3", className)}>
        <Lock className="h-5 w-5 flex-shrink-0 text-[var(--color-text-muted)]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Недоступно в вашем тарифе
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Раздел не входит в текущий план.{" "}
            <Link href={ROUTES.BILLING_PLANS} className="text-[var(--color-accent-primary)] underline hover:no-underline">
              Обновить тариф
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === "exceeded") {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-950/20", className)}>
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Лимит исчерпан: {current} из {limit} {label}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            Невозможно создать новые записи.{" "}
            <Link href={ROUTES.BILLING_PLANS} className="underline hover:no-underline">
              Расширить тариф
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === "warning") {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/20", className)}>
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Осталось мало: {current} из {limit} {label}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Рекомендуем расширить тариф заранее.{" "}
            <Link href={ROUTES.BILLING_PLANS} className="underline hover:no-underline">
              Посмотреть тарифы
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // status === "ok" — subtle info bar
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5", className)}>
      <Info className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
      <p className="text-sm text-[var(--color-text-secondary)]">
        {label.charAt(0).toUpperCase() + label.slice(1)}: <span className="font-medium tabular-nums">{current}</span> из <span className="font-medium tabular-nums">{limit}</span>
      </p>
    </div>
  );
}
