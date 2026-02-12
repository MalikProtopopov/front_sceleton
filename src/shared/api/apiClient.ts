import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/shared/config";
import type { ApiError } from "@/shared/types";
import { useGlobalErrors } from "@/shared/model/useGlobalErrors";
import { useTenantStore } from "@/shared/model/useTenantStore";

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
      timeout: 30000, // 30 seconds
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

        // Add X-Tenant-ID to every request (resolved from domain at startup)
        const tenantId = useTenantStore.getState().tenantId;
        if (tenantId) {
          config.headers["X-Tenant-ID"] = tenantId;
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

        // Handle 403 errors with specific error codes
        if (error.response?.status === 403) {
          const data = error.response.data;
          const errorCode = data?.error_code;

          if (errorCode === "tenant_inactive") {
            // Clear tokens — they won't work while tenant is suspended
            clearTokens();
            useGlobalErrors.getState().setTenantInactive();
            return Promise.reject(error);
          }

          if (errorCode === "feature_disabled") {
            // Use the dedicated "feature" field, fall back to detail
            const featureName = data?.feature || (typeof data?.detail === "string" ? data.detail : "unknown");
            useGlobalErrors.getState().setFeatureDisabled(featureName);
            return Promise.reject(error);
          }

          if (errorCode === "permission_denied" || errorCode === "insufficient_role") {
            // User-level restriction: their role lacks the permission
            const detail = typeof data?.detail === "string" ? data.detail : "Недостаточно прав для выполнения действия";
            toast.error(detail, {
              description: "Обратитесь к администратору организации для обновления роли.",
            });
            return Promise.reject(error);
          }

          if (errorCode === "system_role_protected") {
            toast.error("Системную роль нельзя изменить или удалить");
            return Promise.reject(error);
          }
        }

        // Handle 429 rate limit
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers?.["retry-after"];
          const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
          const message = seconds && !isNaN(seconds)
            ? `Слишком много запросов. Повторите через ${seconds} сек.`
            : "Слишком много запросов. Подождите немного и попробуйте снова.";
          toast.error(message);
          return Promise.reject(error);
        }

        // Handle 404 feature_not_available (public API returns 404 for disabled features)
        if (error.response?.status === 404) {
          const errorCode = error.response.data?.error_code;
          if (errorCode === "feature_not_available") {
            const featureName = error.response.data?.feature || "unknown";
            useGlobalErrors.getState().setFeatureDisabled(featureName);
            return Promise.reject(error);
          }
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

  // Upload file via multipart/form-data
  async uploadFile<T>(url: string, file: File, fieldName: string = "file"): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Get the raw axios instance if needed
  get axios(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();

