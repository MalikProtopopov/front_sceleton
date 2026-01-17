import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { BulkOperationRequest, BulkOperationResponse } from "@/entities/bulk";

export const bulkApi = {
  execute: (data: BulkOperationRequest) =>
    apiClient.post<BulkOperationResponse>(API_ENDPOINTS.BULK, data),
};

