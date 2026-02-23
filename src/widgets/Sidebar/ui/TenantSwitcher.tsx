"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
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
  const { tenantId: currentTenantId, name: storeName, logoUrl: storeLogo, primaryColor: storeColor } = useTenantStore();
  const { data } = useMyTenants();
  const { mutate: switchInPlace, isPending } = useSwitchTenant();

  const tenants = data?.tenants ?? [];
  const hasMultiple = tenants.length > 1;

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

  const currentTenant = tenants.find((t) => t.tenant_id === currentTenantId);

  // Fall back to tenant store values when API data hasn't loaded yet
  const displayName = currentTenant?.name || storeName || "Организация";
  const displayLogo = currentTenant?.logo_url || storeLogo;
  const displayColor = currentTenant?.primary_color || storeColor || "var(--color-accent-primary)";

  function handleSwitch(tenant: TenantAccessInfo) {
    if (tenant.tenant_id === currentTenantId) {
      setOpen(false);
      return;
    }

    if (tenant.admin_domain) {
      switchTenantByRedirect(tenant);
      return;
    }

    switchInPlace(tenant.tenant_id);
    setOpen(false);
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              Переключение организации…
            </span>
          </div>
        </div>
      )}
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={hasMultiple ? () => setOpen(!open) : undefined}
        disabled={isPending}
        className={cn(
          "flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 transition-colors",
          "h-[var(--header-height)]",
          collapsed && "justify-center px-2",
          hasMultiple && "cursor-pointer hover:bg-[var(--color-bg-hover)]",
          !hasMultiple && "cursor-default",
          isPending && "opacity-60",
        )}
      >
        {displayLogo ? (
          <img
            src={displayLogo}
            alt=""
            className={cn(
              "shrink-0 rounded object-contain",
              collapsed ? "h-7 w-7" : "h-8 w-8",
            )}
          />
        ) : (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded font-bold text-white",
              collapsed ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm",
            )}
            style={{ backgroundColor: displayColor }}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[var(--color-text-primary)]">
              {displayName}
            </span>
            {hasMultiple && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform",
                  open && "rotate-180",
                )}
              />
            )}
          </>
        )}
      </button>

      {open && hasMultiple && (
        <ul className="absolute left-2 right-2 z-50 mt-1 max-h-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-[var(--shadow-lg)]">
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
    </>
  );
}
