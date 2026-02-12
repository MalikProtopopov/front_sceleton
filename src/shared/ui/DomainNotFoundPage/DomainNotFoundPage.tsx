"use client";

import { AlertTriangle } from "lucide-react";

interface DomainNotFoundPageProps {
  hostname?: string;
}

export function DomainNotFoundPage({ hostname }: DomainNotFoundPageProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
          <AlertTriangle className="h-10 w-10 text-[var(--color-warning)]" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Домен не настроен
        </h1>
        {hostname && (
          <p className="mb-4 font-mono text-sm text-[var(--color-text-muted)]">
            {hostname}
          </p>
        )}
        <p className="mb-6 text-[var(--color-text-secondary)]">
          Данный адрес не связан ни с одной организацией.
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Обратитесь к <strong>администратору платформы</strong> для настройки домена.
        </p>
      </div>
    </div>
  );
}
