"use client";

import { Building2, ExternalLink } from "lucide-react";
import { getRoleLabel } from "@/entities/user";
import type { TenantOption } from "@/entities/user";

interface TenantRedirectScreenProps {
  tenant: TenantOption;
  message: string;
  onBack: () => void;
}

export function TenantRedirectScreen({ tenant, message, onBack }: TenantRedirectScreenProps) {
  const handleRedirect = () => {
    if (tenant.admin_domain) {
      window.location.href = `https://${tenant.admin_domain}`;
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-[var(--shadow-lg)]">
        {/* Tenant logo / initial */}
        <div className="mb-6 flex justify-center">
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-16 w-16 rounded-[var(--radius-lg)] object-contain"
            />
          ) : (
            <span
              className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] text-xl font-bold text-white"
              style={{ backgroundColor: tenant.primary_color || "var(--color-accent-primary)" }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-[var(--color-text-primary)]">
          Другая организация
        </h2>

        <p className="mb-4 text-center text-sm text-[var(--color-text-secondary)]">
          {message}
        </p>

        <p
          className="mb-1 text-center text-lg font-bold"
          style={{ color: tenant.primary_color || "var(--color-accent-primary)" }}
        >
          {tenant.name}
        </p>

        {tenant.role && (
          <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
            Роль: {getRoleLabel(tenant.role)}
          </p>
        )}
        {!tenant.role && <div className="mb-6" />}

        {tenant.admin_domain ? (
          <button
            type="button"
            onClick={handleRedirect}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: tenant.primary_color || "var(--color-accent-primary)" }}
          >
            Перейти в {tenant.admin_domain}
            <ExternalLink className="h-4 w-4" />
          </button>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-center text-sm text-[var(--color-text-secondary)]">
            <Building2 className="mx-auto mb-2 h-5 w-5 text-[var(--color-warning)]" />
            Обратитесь к администратору вашей организации для получения ссылки на панель управления.
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-4 w-full text-center text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          Вернуться к форме входа
        </button>
      </div>
    </div>
  );
}
