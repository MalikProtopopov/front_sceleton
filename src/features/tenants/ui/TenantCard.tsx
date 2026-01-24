"use client";

import { Building2, Globe, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/shared/lib";
import type { Tenant } from "@/entities/tenant";

interface TenantCardProps {
  tenant: Tenant;
  onClick?: () => void;
}

export function TenantCard({ tenant, onClick }: TenantCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-5 transition-all duration-200",
        "hover:border-[var(--color-accent-primary)] hover:shadow-lg",
      )}
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4">
        {tenant.is_active ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle className="h-3.5 w-3.5" />
            Активен
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]">
            <XCircle className="h-3.5 w-3.5" />
            Неактивен
          </span>
        )}
      </div>

      {/* Logo and name */}
      <div className="mb-4 flex items-center gap-4">
        {tenant.logo_url ? (
          <img
            src={tenant.logo_url}
            alt={tenant.name}
            className="h-12 w-12 rounded-lg border border-[var(--color-border)] object-contain"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: tenant.primary_color || "var(--color-accent-primary)" }}
          >
            <Building2 className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
            {tenant.name}
          </h3>
          <p className="truncate text-sm text-[var(--color-text-muted)]">
            {tenant.slug}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        {tenant.domain && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Globe className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{tenant.domain}</span>
          </div>
        )}
        {tenant.contact_email && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{tenant.contact_email}</span>
          </div>
        )}
        {tenant.contact_phone && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Phone className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{tenant.contact_phone}</span>
          </div>
        )}
      </div>

      {/* Color indicator */}
      {tenant.primary_color && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border border-[var(--color-border)]"
            style={{ backgroundColor: tenant.primary_color }}
          />
          <span className="text-xs text-[var(--color-text-muted)]">
            {tenant.primary_color}
          </span>
        </div>
      )}
    </div>
  );
}
