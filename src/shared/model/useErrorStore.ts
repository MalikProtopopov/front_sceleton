import { create } from "zustand";

// ─── Error types matching backend error_code ───

export type ErrorType =
  | "feature_disabled"
  | "limit_exceeded"
  | "permission_denied"
  | "insufficient_role"
  | "tenant_inactive"
  | "rate_limit"
  | "generic_forbidden";

export interface FeatureDisabledPayload {
  feature: string;
  message?: string;
}

export interface LimitExceededPayload {
  resource: string;
  currentUsage: number;
  limit: number;
  message?: string;
}

export interface PermissionDeniedPayload {
  permission?: string;
  role?: string;
  message?: string;
}

export interface RateLimitPayload {
  retryAfter?: number;
}

export interface GenericForbiddenPayload {
  message?: string;
}

export type ErrorPayload =
  | FeatureDisabledPayload
  | LimitExceededPayload
  | PermissionDeniedPayload
  | RateLimitPayload
  | GenericForbiddenPayload
  | null;

export interface PageError {
  type: ErrorType;
  payload: ErrorPayload;
}

interface ErrorStoreState {
  /** Inline page-level error (replaces page content) */
  pageError: PageError | null;

  /** True when the tenant is fully deactivated (full-screen block) */
  isTenantInactive: boolean;

  setPageError: (type: ErrorType, payload?: ErrorPayload) => void;
  clearPageError: () => void;
  showTenantInactive: () => void;

  reset: () => void;
}

export const useErrorStore = create<ErrorStoreState>((set) => ({
  pageError: null,
  isTenantInactive: false,

  setPageError: (type, payload = null) =>
    set({ pageError: { type, payload } }),

  clearPageError: () =>
    set({ pageError: null }),

  showTenantInactive: () =>
    set({ isTenantInactive: true }),

  reset: () =>
    set({ pageError: null, isTenantInactive: false }),
}));
