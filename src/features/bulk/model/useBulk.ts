"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { bulkApi } from "../api/bulkApi";
import type { BulkOperationRequest, BulkResourceType } from "@/entities/bulk";
import { articlesKeys } from "@/features/articles";
import { casesKeys } from "@/features/cases";

function getQueryKeysToInvalidate(resourceType: BulkResourceType) {
  switch (resourceType) {
    case "articles":
      return [articlesKeys.all];
    case "cases":
      return [casesKeys.all];
    case "faq":
      return [["faq"]];
    case "reviews":
      return [["reviews"]];
    default:
      return [];
  }
}

export function useBulkOperation() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (data: BulkOperationRequest) => bulkApi.execute(data),
    errorMessage: "Ошибка при выполнении операции",
    onSuccess: (response, variables) => {
      const keysToInvalidate = getQueryKeysToInvalidate(variables.resource_type);
      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      const { summary } = response;
      if (summary.failed === 0) {
        toast.success(`Успешно обработано: ${summary.succeeded}`);
      } else if (summary.succeeded === 0) {
        toast.error(`Ошибка: не удалось обработать ни одной записи`);
      } else {
        toast.warning(`Обработано ${summary.succeeded} из ${summary.total}. Ошибок: ${summary.failed}`);
      }
    },
  });
}
