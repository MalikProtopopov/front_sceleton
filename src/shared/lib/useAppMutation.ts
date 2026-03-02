"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleVersionConflict, getErrorMessage } from "./versionConflict";
import { handleLocaleError } from "./localeErrors";

export interface AppMutationOptions<TData = unknown, TVariables = void> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  invalidateKeys?: readonly (readonly unknown[])[];
  versionConflictKey?: readonly unknown[];
  useLocaleError?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Standardized mutation hook that handles toast notifications,
 * query invalidation, version conflicts, and locale errors.
 */
export function useAppMutation<TData = unknown, TVariables = void>(
  options: AppMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data: TData, variables: TVariables) => {
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key as readonly unknown[] });
        }
      }

      if (options.successMessage) {
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(data, variables)
            : options.successMessage;
        toast.success(message);
      }

      options.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables: TVariables) => {
      if (options.onError) {
        options.onError(error, variables);
        return;
      }

      if (options.useLocaleError) {
        handleLocaleError(error);
        return;
      }

      if (options.versionConflictKey) {
        if (handleVersionConflict(error, queryClient, options.versionConflictKey)) {
          return;
        }
      }

      const message = getErrorMessage(error, options.errorMessage || "Произошла ошибка");
      toast.error(message);
    },
  });
}
