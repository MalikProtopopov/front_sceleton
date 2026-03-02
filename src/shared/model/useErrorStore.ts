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

type ErrorPayload =
  | FeatureDisabledPayload
  | LimitExceededPayload
  | PermissionDeniedPayload
  | RateLimitPayload
  | GenericForbiddenPayload
  | null;

interface ErrorStoreState {
  visible: boolean;
  type: ErrorType | null;
  payload: ErrorPayload;

  /** True when the tenant is fully deactivated (full-screen block) */
  isTenantInactive: boolean;

  showFeatureDisabled: (payload: FeatureDisabledPayload) => void;
  showLimitExceeded: (payload: LimitExceededPayload) => void;
  showPermissionDenied: (payload: PermissionDeniedPayload) => void;
  showTenantInactive: () => void;
  showRateLimit: (retryAfter?: number) => void;
  showGenericForbidden: (message?: string) => void;

  dismiss: () => void;
  reset: () => void;
}

export const useErrorStore = create<ErrorStoreState>((set) => ({
  visible: false,
  type: null,
  payload: null,
  isTenantInactive: false,

  showFeatureDisabled: (payload) =>
    set({ visible: true, type: "feature_disabled", payload }),

  showLimitExceeded: (payload) =>
    set({ visible: true, type: "limit_exceeded", payload }),

  showPermissionDenied: (payload) =>
    set({ visible: true, type: "permission_denied", payload }),

  showTenantInactive: () =>
    set({ isTenantInactive: true }),

  showRateLimit: (retryAfter) =>
    set({ visible: true, type: "rate_limit", payload: { retryAfter } }),

  showGenericForbidden: (message) =>
    set({ visible: true, type: "generic_forbidden", payload: { message } }),

  dismiss: () =>
    set({ visible: false, type: null, payload: null }),

  reset: () =>
    set({ visible: false, type: null, payload: null, isTenantInactive: false }),
}));
