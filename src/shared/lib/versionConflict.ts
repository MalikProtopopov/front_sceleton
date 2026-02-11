import { AxiosError } from "axios";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/shared/types";

/**
 * Check if error is a version conflict (409 with error_code "version_conflict" or generic 409)
 */
export function isVersionConflict(error: unknown): boolean {
  if (error instanceof AxiosError) {
    if (error.response?.status === 409) {
      const errorCode = (error.response.data as ApiError)?.error_code;
      // If error_code is present, only match version_conflict
      if (errorCode) {
        return errorCode === "version_conflict";
      }
      // Fallback: legacy 409 without error_code is treated as version conflict
      return true;
    }
  }
  return false;
}

/**
 * Check if error is an "already exists" conflict (409 with error_code "already_exists")
 * Returns the resource and field info if available
 */
export function isAlreadyExists(error: unknown): { resource?: string; field?: string } | false {
  if (error instanceof AxiosError && error.response?.status === 409) {
    const data = error.response.data as ApiError;
    if (data?.error_code === "already_exists") {
      return {
        resource: data.resource,
        field: data.field,
      };
    }
  }
  return false;
}

/**
 * Get a user-friendly message for "already exists" errors
 */
function getAlreadyExistsMessage(info: { resource?: string; field?: string }): string {
  const fieldLabels: Record<string, string> = {
    email: "Email",
    slug: "Slug",
    name: "Название",
    domain: "Домен",
  };
  const resourceLabels: Record<string, string> = {
    User: "Пользователь",
    Tenant: "Организация",
    Role: "Роль",
  };

  const field = info.field ? (fieldLabels[info.field] || info.field) : "";
  const resource = info.resource ? (resourceLabels[info.resource] || info.resource) : "";

  if (field && resource) {
    return `${field} уже используется для другого объекта "${resource}"`;
  }
  if (field) {
    return `${field} уже существует`;
  }
  return "Запись с такими данными уже существует";
}

/**
 * Handle version conflict error
 * - Shows user-friendly message
 * - Invalidates query cache to reload fresh data
 * 
 * @param error - The error from mutation
 * @param queryClient - React Query client
 * @param queryKey - Query key to invalidate
 * @returns true if error was a version conflict and was handled
 */
export function handleVersionConflict(
  error: unknown,
  queryClient: QueryClient,
  queryKey: readonly unknown[]
): boolean {
  if (isVersionConflict(error)) {
    // Invalidate cache to get fresh data with correct version
    queryClient.invalidateQueries({ queryKey });
    
    toast.error("Данные были изменены другим пользователем. Страница обновлена.", {
      description: "Пожалуйста, проверьте изменения и попробуйте снова.",
      duration: 5000,
    });
    
    return true;
  }
  return false;
}

/**
 * Get error message from error object
 * Handles 409 (version conflict and already_exists), 422 detail as string or Pydantic-style array
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    // Check for version conflict
    if (isVersionConflict(error)) {
      return "Конфликт версий. Данные были изменены.";
    }

    // Check for already_exists
    const alreadyExists = isAlreadyExists(error);
    if (alreadyExists) {
      return getAlreadyExistsMessage(alreadyExists);
    }

    // Check for 403 specific error codes
    if (error.response?.status === 403) {
      const errorCode = (error.response.data as ApiError)?.error_code;
      if (errorCode === "system_role_protected") {
        return "Системную роль нельзя изменить или удалить";
      }
      if (errorCode === "permission_denied") {
        return "Недостаточно прав для выполнения действия";
      }
      if (errorCode === "insufficient_role") {
        return "У вас недостаточная роль для выполнения действия";
      }
    }

    // Check for validation errors (detail can be string or array)
    const detail = error.response?.data?.detail;
    if (detail != null) {
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (first && typeof first === "object" && "msg" in first && typeof first.msg === "string") {
          return first.msg;
        }
      }
      return defaultMessage;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * Create standard onError handler for mutations with version support
 */
export function createMutationErrorHandler(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  defaultMessage: string
) {
  return (error: unknown) => {
    // Handle version conflict specially
    if (handleVersionConflict(error, queryClient, queryKey)) {
      return;
    }
    
    // Handle other errors
    const message = getErrorMessage(error, defaultMessage);
    toast.error(message);
  };
}
