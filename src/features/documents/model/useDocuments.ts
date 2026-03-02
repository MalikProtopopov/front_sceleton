import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { documentsApi, documentsKeys } from "../api/documentsApi";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilterParams,
} from "@/entities/document";
import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";

export function useDocuments(params?: DocumentFilterParams) {
  return useQuery({
    queryKey: documentsKeys.list(params),
    queryFn: () => documentsApi.getAll(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  return useAppMutation({
    mutationFn: (data: CreateDocumentDto) => documentsApi.create(data),
    invalidateKeys: [documentsKeys.lists()],
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentsApi.update(id, data),
    successMessage: "Документ обновлён",
    invalidateKeys: [documentsKeys.lists()],
    onSuccess: (document, variables) => {
      queryClient.setQueryData(documentsKeys.detail(variables.id), document);
    },
    onError: (error, variables) => {
      if (handleVersionConflict(error, queryClient, documentsKeys.detail(variables.id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось обновить документ");
      toast.error(message);
    },
  });
}

export function useDeleteDocument() {
  return useAppMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    invalidateKeys: [documentsKeys.lists()],
  });
}

export function usePublishDocument() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => documentsApi.publish(id),
    invalidateKeys: [documentsKeys.lists()],
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}

export function useUnpublishDocument() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => documentsApi.unpublish(id),
    invalidateKeys: [documentsKeys.lists()],
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}

export function useUploadDocumentFile() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      documentsApi.uploadFile(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDocumentFile() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => documentsApi.deleteFile(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}
