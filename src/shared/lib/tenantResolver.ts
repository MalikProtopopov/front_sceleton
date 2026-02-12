import type { TenantByDomainResponse } from "@/entities/tenant";

/**
 * Resolve the current tenant from the browser hostname.
 *
 * - For production domains (e.g. admin.client1.com) it calls
 *   GET /public/tenants/by-domain/{hostname}.
 * - For localhost / 127.0.0.1 development it falls back to the
 *   NEXT_PUBLIC_TENANT_ID env var and fetches tenant info by ID.
 *
 * Uses raw `fetch()` because this runs before the Axios API client
 * (and its auth interceptors) are initialized.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const FALLBACK_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "";

function isLocalhost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.endsWith(".local")
  );
}

export async function resolveTenant(
  hostname: string,
): Promise<TenantByDomainResponse> {
  // --- Local development shortcut ---
  if (isLocalhost(hostname)) {
    if (!FALLBACK_TENANT_ID) {
      throw new Error(
        "Local development requires NEXT_PUBLIC_TENANT_ID in .env. " +
          "Set it to the UUID of the tenant you want to work with.",
      );
    }

    const resp = await fetch(
      `${API_BASE}/public/tenants/${FALLBACK_TENANT_ID}`,
    );

    if (!resp.ok) {
      throw new Error(
        `Failed to load tenant by ID (${FALLBACK_TENANT_ID}): ${resp.status}`,
      );
    }

    return resp.json();
  }

  // --- Production: resolve by domain ---
  const resp = await fetch(
    `${API_BASE}/public/tenants/by-domain/${encodeURIComponent(hostname)}`,
  );

  if (!resp.ok) {
    if (resp.status === 404) {
      throw new Error(`DOMAIN_NOT_FOUND:${hostname}`);
    }
    throw new Error(
      `Tenant resolution failed for ${hostname}: ${resp.status}`,
    );
  }

  return resp.json();
}
