import { create } from "zustand";
import type { TenantByDomainResponse } from "@/entities/tenant";

interface TenantStoreState {
  /** UUID of the current tenant */
  tenantId: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  siteUrl: string | null;
  /** True once the tenant has been resolved (successfully or via fallback) */
  isResolved: boolean;
  /** Non-null when domain resolution failed */
  error: string | null;
  /** True when the SPA is running on a shared/generic domain (no tenant pre-resolved) */
  isSharedDomain: boolean;

  /** Populate the store after successful domain resolution */
  setTenant: (info: TenantByDomainResponse) => void;
  /** Enter shared-domain mode (domain didn't resolve to a specific tenant) */
  setSharedDomain: () => void;
  /** Record a resolution error */
  setError: (error: string) => void;
  /** Reset back to initial state */
  reset: () => void;
}

export const useTenantStore = create<TenantStoreState>((set) => ({
  tenantId: "",
  slug: "",
  name: "",
  logoUrl: null,
  primaryColor: null,
  siteUrl: null,
  isResolved: false,
  error: null,
  isSharedDomain: false,

  setTenant: (info) =>
    set({
      tenantId: info.tenant_id,
      slug: info.slug,
      name: info.name,
      logoUrl: info.logo_url,
      primaryColor: info.primary_color,
      siteUrl: info.site_url,
      isResolved: true,
      isSharedDomain: false,
      error: null,
    }),

  setSharedDomain: () =>
    set({
      isResolved: true,
      isSharedDomain: true,
      error: null,
    }),

  setError: (error) =>
    set({
      isResolved: true,
      error,
    }),

  reset: () =>
    set({
      tenantId: "",
      slug: "",
      name: "",
      logoUrl: null,
      primaryColor: null,
      siteUrl: null,
      isResolved: false,
      error: null,
      isSharedDomain: false,
    }),
}));
