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

  /** Populate the store after successful domain resolution */
  setTenant: (info: TenantByDomainResponse) => void;
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

  setTenant: (info) =>
    set({
      tenantId: info.tenant_id,
      slug: info.slug,
      name: info.name,
      logoUrl: info.logo_url,
      primaryColor: info.primary_color,
      siteUrl: info.site_url,
      isResolved: true,
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
    }),
}));
