"use client";

import { Building2, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib";
import { getRoleLabel } from "@/entities/user";
import type { TenantOption } from "@/entities/user";

interface TenantPickerProps {
  tenants: TenantOption[];
  isLoading: boolean;
  onSelect: (tenantId: string) => void;
  onBack: () => void;
}

export function TenantPicker({ tenants, isLoading, onSelect, onBack }: TenantPickerProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10">
          <Building2 className="h-7 w-7 text-[var(--color-accent-primary)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Выберите организацию
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Ваш аккаунт связан с несколькими организациями
        </p>
      </div>

      <div className="space-y-2">
        {tenants.map((tenant) => (
          <button
            key={tenant.tenant_id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(tenant.tenant_id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 text-left transition-all",
              "hover:border-[var(--color-accent-primary)] hover:shadow-[var(--shadow-md)]",
              isLoading && "pointer-events-none opacity-60",
            )}
          >
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-[var(--radius-md)] object-contain"
              />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sm font-bold text-white"
                style={{ backgroundColor: tenant.primary_color || "var(--color-accent-primary)" }}
              >
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-[var(--color-text-primary)]">
                {tenant.name}
              </div>
              {tenant.role && (
                <div className="truncate text-xs text-[var(--color-text-muted)]">
                  {getRoleLabel(tenant.role)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Вход...</span>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="mt-6 w-full text-center text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        Войти другим аккаунтом
      </button>
    </div>
  );
}
