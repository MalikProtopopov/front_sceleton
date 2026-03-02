"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useLeadsList, leadsKeys, leadsApi } from "@/features/leads";
import type { Inquiry, InquiryStatus, InquiryFilterParams } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";
import type { PaginatedResponse } from "@/shared/types";
import { KANBAN_PAGE_SIZE } from "@/shared/config";
import { KanbanBoard } from "./KanbanBoard";

interface LeadsKanbanProps {
  filters?: Partial<InquiryFilterParams>;
}

export function LeadsKanban({ filters }: LeadsKanbanProps) {
  const queryClient = useQueryClient();

  const kanbanFilters: InquiryFilterParams = {
    ...filters,
    pageSize: KANBAN_PAGE_SIZE,
  };

  const { data, isLoading } = useLeadsList(kanbanFilters);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      return leadsApi.updateStatus(id, status);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: leadsKeys.list(kanbanFilters) });

      const previousData = queryClient.getQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters)
      );

      queryClient.setQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, status } : item
            ),
          };
        }
      );

      setUpdatingIds((prev) => new Set(prev).add(id));

      return { previousData };
    },
    onSuccess: (_data, { status }) => {
      const statusLabel = INQUIRY_STATUS_CONFIG[status].label;
      toast.success(`Статус изменен: ${statusLabel}`);
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(leadsKeys.list(kanbanFilters), context.previousData);
      }
      const message = error instanceof Error ? error.message : "Не удалось обновить статус";
      toast.error(message);
    },
    onSettled: (_data, _error, { id }) => {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: leadsKeys.list(kanbanFilters) });

      const previousData = queryClient.getQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters)
      );

      queryClient.setQueryData<PaginatedResponse<Inquiry>>(
        leadsKeys.list(kanbanFilters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Лид удален");
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(leadsKeys.list(kanbanFilters), context.previousData);
      }
      const message = error instanceof Error ? error.message : "Не удалось удалить лид";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
    },
  });

  const handleStatusChange = useCallback(
    (id: string, status: InquiryStatus) => {
      updateStatusMutation.mutate({ id, status });
    },
    [updateStatusMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return (
    <KanbanBoard
      items={data?.items || []}
      isLoading={isLoading}
      updatingIds={updatingIds}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
    />
  );
}
