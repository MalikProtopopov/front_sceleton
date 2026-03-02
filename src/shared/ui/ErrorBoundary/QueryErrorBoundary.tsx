"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "./ErrorBoundary";

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[300px] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Ошибка загрузки данных
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Не удалось загрузить данные. Попробуйте ещё раз.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-primary-hover)]"
            >
              Повторить
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
