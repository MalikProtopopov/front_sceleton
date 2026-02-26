import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Parameter,
  ParameterValue,
  ParameterFilterParams,
  ParameterCreate,
  ParameterUpdate,
  ParameterValueCreate,
  ParameterValueUpdate,
  ParameterCategorySet,
} from "@/entities/product";

export const parametersApi = {
  getAll: (params?: ParameterFilterParams) =>
    apiClient.get<PaginatedResponse<Parameter>>(API_ENDPOINTS.PARAMETERS.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Parameter>(API_ENDPOINTS.PARAMETERS.BY_ID(id)),

  create: (data: ParameterCreate) =>
    apiClient.post<Parameter>(API_ENDPOINTS.PARAMETERS.LIST, data),

  update: (id: string, data: ParameterUpdate) =>
    apiClient.patch<Parameter>(API_ENDPOINTS.PARAMETERS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.PARAMETERS.BY_ID(id)),

  // Values (enum type)
  addValue: (parameterId: string, data: ParameterValueCreate) =>
    apiClient.post<ParameterValue>(API_ENDPOINTS.PARAMETERS.VALUES(parameterId), data),

  updateValue: (parameterId: string, valueId: string, data: ParameterValueUpdate) =>
    apiClient.patch<ParameterValue>(
      API_ENDPOINTS.PARAMETERS.VALUE_BY_ID(parameterId, valueId),
      data,
    ),

  deleteValue: (parameterId: string, valueId: string) =>
    apiClient.delete(API_ENDPOINTS.PARAMETERS.VALUE_BY_ID(parameterId, valueId)),

  // Category binding
  setCategories: (parameterId: string, data: ParameterCategorySet) =>
    apiClient.put<{ count: number }>(API_ENDPOINTS.PARAMETERS.CATEGORIES(parameterId), data),
};

export const parametersKeys = {
  all: ["parameters"] as const,
  lists: () => [...parametersKeys.all, "list"] as const,
  list: (params?: ParameterFilterParams) => [...parametersKeys.lists(), params] as const,
  details: () => [...parametersKeys.all, "detail"] as const,
  detail: (id: string) => [...parametersKeys.details(), id] as const,
};
