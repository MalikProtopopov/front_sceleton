import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/shared/config";
import { API_TIMEOUT } from "../config/constants";
import type { ApiError } from "@/shared/types";
import { useErrorStore } from "@/shared/model/useErrorStore";
import { useTenantStore } from "@/shared/model/useTenantStore";

/**
 * Extract error_code from RFC 7807 `type` URL.
 * "https://api.cms.local/errors/feature_disabled" → "feature_disabled"
 * Falls back to `error_code` field for backward compat.
 */
function getErrorCode(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  if (typeof data.type === "string" && data.type.includes("/")) {
    const parts = data.type.split("/");
    return parts[parts.length - 1] || null;
  }
  if (typeof data.error_code === "string") return data.error_code;
  return null;
}

// Token storage functions - imported from auth feature
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let setTokens: (tokens: { access_token: string; refresh_token: string }) => void = () => {};
let clearTokens: () => void = () => {};

// This will be called from the auth module to inject the token functions
export function setTokenHandlers(handlers: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
  clearTokens: () => void;
}) {
  getAccessToken = handlers.getAccessToken;
  getRefreshToken = handlers.getRefreshToken;
  setTokens = handlers.setTokens;
  clearTokens = handlers.clearTokens;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        // Запрещаем браузеру кэшировать ответы API
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
      timeout: API_TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and tenant ID
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // X-Tenant-ID: required on all authenticated requests.
        // On POST /auth/login — only if tenant is known (resolved from domain).
        // On POST /auth/select-tenant — not needed (tenant_id is in the body).
        const tenantId = useTenantStore.getState().tenantId;
        const isSelectTenant =
          config.url?.includes("/auth/select-tenant") && config.method === "post";
        if (tenantId && !isSelectTenant) {
          config.headers["X-Tenant-ID"] = tenantId;
        }

        // FormData must be sent as multipart/form-data with boundary.
        // Do not send Content-Type so axios/browser sets it automatically.
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle 401, 403 and refresh token
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const data = error.response?.data as Record<string, unknown> | undefined;
        const errorCode = getErrorCode(data);
        const store = useErrorStore.getState();

        // ── 403: Authorization / Feature / Limit ──
        if (error.response?.status === 403) {
          switch (errorCode) {
            case "tenant_inactive":
              clearTokens();
              store.showTenantInactive();
              return Promise.reject(error);

            case "feature_disabled": {
              const feature =
                (data?.feature as string) ||
                (typeof data?.detail === "string" ? data.detail : "unknown");
              store.showFeatureDisabled({ feature, message: data?.detail as string });
              return Promise.reject(error);
            }

            case "permission_denied":
              store.showPermissionDenied({
                permission: data?.required_permission as string | undefined,
                message: data?.detail as string | undefined,
              });
              return Promise.reject(error);

            case "insufficient_role":
              store.showPermissionDenied({
                role: data?.required_role as string | undefined,
                message: data?.detail as string | undefined,
              });
              return Promise.reject(error);

            case "limit_exceeded": {
              const resource = data?.resource as string | undefined;
              const currentUsage = data?.current_usage as number | undefined;
              const limit = data?.limit as number | undefined;
              if (resource != null && currentUsage != null && limit != null) {
                store.showLimitExceeded({ resource, currentUsage, limit, message: data?.detail as string });
              }
              return Promise.reject(error);
            }

            case "system_role_protected":
              toast.error("Системную роль нельзя изменить или удалить");
              return Promise.reject(error);

            default:
              store.showGenericForbidden(data?.detail as string | undefined);
              return Promise.reject(error);
          }
        }

        // ── 429: Rate limit ──
        if (error.response?.status === 429) {
          const retryAfter = data?.retry_after as number | undefined;
          store.showRateLimit(retryAfter);
          return Promise.reject(error);
        }

        // ── 404: feature_not_available (public API) ──
        if (error.response?.status === 404 && errorCode === "feature_not_available") {
          const feature = (data?.feature as string) || "unknown";
          store.showFeatureDisabled({ feature });
          return Promise.reject(error);
        }

        // Skip refresh token flow for login endpoint (401 is expected for wrong credentials)
        if (originalRequest.url?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If we're already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            // Make refresh request without interceptors
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const newTokens = response.data;
            setTokens(newTokens);

            // Process queued requests
            this.failedQueue.forEach(({ resolve }) => {
              resolve(newTokens.access_token);
            });
            this.failedQueue = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError as Error);
            });
            this.failedQueue = [];
            clearTokens();

            // Redirect to login (client-side only)
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // HTTP Methods
  async get<T>(url: string, config?: { params?: object }): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.patch<T>(url, data);
    return response.data;
  }

  async delete<T = void>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    return response.data;
  }

  // Upload file via multipart/form-data (Content-Type with boundary set by interceptor/axios)
  async uploadFile<T>(url: string, file: File, fieldName: string = "file"): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    const response = await this.instance.post<T>(url, formData);
    return response.data;
  }

  // Get the raw axios instance if needed
  get axios(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();

