"use client";

import { ShieldX } from "lucide-react";
import { Button } from "@/shared/ui/Button";

interface NoAccessPageProps {
  onGoBack?: () => void;
}

export function NoAccessPage({ onGoBack }: NoAccessPageProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error)]/10">
          <ShieldX className="h-10 w-10 text-[var(--color-error)]" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Нет доступа
        </h1>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          У вас нет прав для доступа к этой организации.
        </p>
        {onGoBack && (
          <Button variant="secondary" onClick={onGoBack}>
            Вернуться
          </Button>
        )}
      </div>
    </div>
  );
}
