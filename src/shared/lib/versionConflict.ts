import { AxiosError } from "axios";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Check if error is a version conflict (409)
 */
export function isVersionConflict(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 409;
  }
  return false;
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
  queryKey: unknown[]
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
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    // Check for version conflict
    if (error.response?.status === 409) {
      return "Конфликт версий. Данные были изменены.";
    }
    // Check for validation errors
    if (error.response?.data?.detail) {
      return error.response.data.detail;
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
  queryKey: unknown[],
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
