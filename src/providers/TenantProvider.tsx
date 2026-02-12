"use client";

import { useEffect, useState } from "react";
import { useTenantStore } from "@/shared/model/useTenantStore";
import { resolveTenant } from "@/shared/lib/tenantResolver";
import { Spinner, DomainNotFoundPage } from "@/shared/ui";

/**
 * Resolves the current tenant from `window.location.hostname` before
 * rendering the rest of the app.  Must be the outermost client provider
 * so that the tenant ID is available before any API calls.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { isResolved, error, setTenant, setError } = useTenantStore();
  const [failedHostname, setFailedHostname] = useState<string>("");

  useEffect(() => {
    // If already resolved (e.g. HMR re-mount), skip
    if (isResolved) return;

    const hostname = window.location.hostname;

    resolveTenant(hostname)
      .then((info) => {
        setTenant(info);
        applyBranding(info.primary_color);
      })
      .catch((err: Error) => {
        const msg = err.message || "Unknown error";
        if (msg.startsWith("DOMAIN_NOT_FOUND:")) {
          setFailedHostname(msg.replace("DOMAIN_NOT_FOUND:", ""));
        }
        setError(msg);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Loading state ---
  if (!isResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // --- Domain not found ---
  if (error?.startsWith("DOMAIN_NOT_FOUND:") || failedHostname) {
    return <DomainNotFoundPage hostname={failedHostname || undefined} />;
  }

  // --- Other resolution errors (network, bad tenant ID, etc.) ---
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-xl font-bold text-[var(--color-text-primary)]">
            Ошибка загрузки
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Не удалось определить организацию. Попробуйте обновить страницу.
          </p>
          <p className="mt-4 font-mono text-xs text-[var(--color-text-muted)]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Branding helpers
// ---------------------------------------------------------------------------

/**
 * Apply the tenant's primary color as CSS custom properties so that
 * the entire design-system (`--color-accent-primary` etc.) picks it up.
 */
function applyBranding(primaryColor: string | null) {
  if (!primaryColor) return;

  const root = document.documentElement;
  root.style.setProperty("--color-accent-primary", primaryColor);
  root.style.setProperty(
    "--color-accent-primary-hover",
    darkenColor(primaryColor, 0.1),
  );
  root.style.setProperty("--color-border-focus", primaryColor);
}

/**
 * Darken a hex colour by a given ratio (0-1).
 * E.g. darkenColor("#FF006E", 0.1) → 10 % darker.
 */
function darkenColor(hex: string, amount: number): string {
  const sanitized = hex.replace("#", "");
  const num = parseInt(sanitized, 16);

  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.round(r * (1 - amount)));
  g = Math.max(0, Math.round(g * (1 - amount)));
  b = Math.max(0, Math.round(b * (1 - amount)));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
