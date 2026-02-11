"use client";

import { ShieldOff } from "lucide-react";

export function TenantInactivePage() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
          <ShieldOff className="h-10 w-10 text-[var(--color-danger)]" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Организация приостановлена
        </h1>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          Ваша организация приостановлена. Доступ к системе временно ограничен.
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Обратитесь в <strong>службу поддержки платформы</strong> для восстановления доступа.
        </p>
      </div>
    </div>
  );
}
