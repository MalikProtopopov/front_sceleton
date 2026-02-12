"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib";
import { useTenantStore } from "@/shared/model/useTenantStore";
import {
  useMyTenants,
  useSwitchTenant,
  switchTenantByRedirect,
} from "@/features/auth";
import type { TenantAccessInfo } from "@/entities/tenant";

interface TenantSwitcherProps {
  collapsed?: boolean;
}

export function TenantSwitcher({ collapsed = false }: TenantSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { tenantId: currentTenantId } = useTenantStore();
  const { data } = useMyTenants();
  const { mutate: switchInPlace, isPending } = useSwitchTenant();

  const tenants = data?.tenants ?? [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Don't render if user only belongs to one (or zero) tenants
  if (tenants.length <= 1) return null;

  const currentTenant = tenants.find((t) => t.tenant_id === currentTenantId);

  function handleSwitch(tenant: TenantAccessInfo) {
    if (tenant.tenant_id === currentTenantId) {
      setOpen(false);
      return;
    }

    // Variant A: redirect if tenant has its own admin domain
    if (tenant.admin_domain) {
      switchTenantByRedirect(tenant);
      return;
    }

    // Variant B: in-place switch via API
    switchInPlace(tenant.tenant_id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative mx-3 mb-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={cn(
          "flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-left transition-colors hover:bg-[var(--color-bg-hover)]",
          collapsed && "justify-center px-2",
          isPending && "opacity-60",
        )}
      >
        {currentTenant?.logo_url ? (
          <img
            src={currentTenant.logo_url}
            alt=""
            className="h-5 w-5 shrink-0 rounded object-contain"
          />
        ) : (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
            style={{
              backgroundColor:
                currentTenant?.primary_color || "var(--color-accent-primary)",
            }}
          >
            {(currentTenant?.name ?? "T").charAt(0).toUpperCase()}
          </span>
        )}

        {!collapsed && (
          <>
            <span className="flex-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
              {currentTenant?.name ?? "Организация"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-[var(--shadow-lg)]">
          {tenants.map((t) => {
            const isCurrent = t.tenant_id === currentTenantId;
            return (
              <li key={t.tenant_id}>
                <button
                  type="button"
                  onClick={() => handleSwitch(t)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-bg-hover)]",
                    isCurrent && "bg-[var(--color-bg-elevated)]",
                  )}
                >
                  {t.logo_url ? (
                    <img
                      src={t.logo_url}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{
                        backgroundColor:
                          t.primary_color || "var(--color-accent-primary)",
                      }}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-[var(--color-text-primary)]">
                      {t.name}
                    </div>
                    {t.admin_domain && (
                      <div className="truncate text-xs text-[var(--color-text-muted)]">
                        {t.admin_domain}
                      </div>
                    )}
                  </div>

                  {isCurrent && (
                    <Check className="h-4 w-4 shrink-0 text-[var(--color-accent-primary)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
