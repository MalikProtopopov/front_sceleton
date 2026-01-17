/**
 * Locale Management Error Handling
 * 
 * Utilities for handling locale-specific API errors:
 * - locale_already_exists (409)
 * - minimum_locales_required (400)
 * - slug already exists (409)
 */

import { toast } from "sonner";
import type { AxiosError } from "axios";

// Extended API Error interface for locale operations
interface LocaleApiError {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  error_code?: string;
  resource?: string;
  locale?: string;
  field?: string;
  value?: string;
}

/**
 * Check if error is "locale already exists"
 */
export function isLocaleAlreadyExistsError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError?.error_code === "locale_already_exists" || 
         (apiError?.status === 409 && Boolean(apiError?.detail?.includes("locale")));
}

/**
 * Check if error is "minimum locales required"
 */
export function isMinimumLocalesError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError?.error_code === "minimum_locales_required" ||
         (apiError?.status === 400 && Boolean(apiError?.detail?.includes("last locale")));
}

/**
 * Check if error is "slug already exists"
 */
export function isSlugExistsError(error: unknown): boolean {
  const apiError = extractApiError(error);
  return apiError?.field === "slug" || 
         (apiError?.status === 409 && Boolean(apiError?.detail?.includes("slug")));
}

/**
 * Extract API error from various error formats
 */
function extractApiError(error: unknown): LocaleApiError | null {
  if (!error) return null;

  // Axios error
  const axiosError = error as AxiosError<LocaleApiError>;
  if (axiosError.response?.data) {
    return axiosError.response.data;
  }

  // Plain object error
  if (typeof error === "object" && error !== null) {
    return error as LocaleApiError;
  }

  return null;
}

/**
 * Get user-friendly error message for locale errors
 */
export function getLocaleErrorMessage(error: unknown): string {
  const apiError = extractApiError(error);

  if (!apiError) {
    return "Произошла ошибка при работе с локалью";
  }

  // Locale already exists
  if (apiError.error_code === "locale_already_exists" || 
      (apiError.status === 409 && apiError.detail?.includes("locale"))) {
    const locale = apiError.locale || "этого языка";
    return `Локаль для ${locale.toUpperCase()} уже существует`;
  }

  // Minimum locales required
  if (apiError.error_code === "minimum_locales_required" ||
      (apiError.status === 400 && apiError.detail?.includes("last locale"))) {
    return "Нельзя удалить последнюю локаль. Должна остаться хотя бы одна.";
  }

  // Slug already exists
  if (apiError.field === "slug" || 
      (apiError.status === 409 && apiError.detail?.includes("slug"))) {
    const slug = apiError.value || "";
    const locale = apiError.locale || "";
    return slug 
      ? `Slug "${slug}" уже используется${locale ? ` для языка ${locale.toUpperCase()}` : ""}`
      : "Такой slug уже существует";
  }

  // Not found
  if (apiError.status === 404) {
    return "Локаль не найдена. Возможно, она была удалена.";
  }

  // Permission denied
  if (apiError.status === 403) {
    return "Недостаточно прав для выполнения операции";
  }

  // Validation error
  if (apiError.status === 422) {
    return apiError.detail || "Ошибка валидации данных";
  }

  // Default error message
  return apiError.detail || "Произошла ошибка";
}

/**
 * Handle locale error with toast notification
 */
export function handleLocaleError(error: unknown): void {
  const message = getLocaleErrorMessage(error);
  toast.error(message);
}

/**
 * Handle locale error and return the message (useful for form validation)
 */
export function handleLocaleErrorWithMessage(error: unknown): string {
  const message = getLocaleErrorMessage(error);
  toast.error(message);
  return message;
}

/**
 * Check if it's safe to delete a locale (not the last one)
 */
export function canDeleteLocale(localesCount: number): boolean {
  return localesCount > 1;
}

/**
 * Get available locales for creation (excluding existing ones)
 */
export function getAvailableLocalesForCreation(
  allLocales: string[],
  existingLocales: string[]
): string[] {
  return allLocales.filter(locale => !existingLocales.includes(locale));
}

