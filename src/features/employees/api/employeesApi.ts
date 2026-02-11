import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Employee, EmployeeLocale, CreateEmployeeDto, UpdateEmployeeDto, CreateEmployeeLocaleDto, UpdateEmployeeLocaleDto, EmployeeFilterParams } from "@/entities/employee";
import type { ContentBlock, CreateContentBlockDto, UpdateContentBlockDto, ReorderContentBlocksDto } from "@/entities/content-block";

export const employeesApi = {
  getAll: (params?: EmployeeFilterParams) =>
    apiClient.get<PaginatedResponse<Employee>>(API_ENDPOINTS.EMPLOYEES.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Employee>(API_ENDPOINTS.EMPLOYEES.BY_ID(id)),

  create: (data: CreateEmployeeDto) =>
    apiClient.post<Employee>(API_ENDPOINTS.EMPLOYEES.LIST, data),

  update: (id: string, data: UpdateEmployeeDto) =>
    apiClient.patch<Employee>(API_ENDPOINTS.EMPLOYEES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.EMPLOYEES.BY_ID(id)),

  // Locales
  createLocale: (employeeId: string, data: CreateEmployeeLocaleDto) =>
    apiClient.post<EmployeeLocale>(API_ENDPOINTS.EMPLOYEES.LOCALES(employeeId), data),

  updateLocale: (employeeId: string, localeId: string, data: UpdateEmployeeLocaleDto) =>
    apiClient.patch<EmployeeLocale>(API_ENDPOINTS.EMPLOYEES.LOCALE_BY_ID(employeeId, localeId), data),

  deleteLocale: (employeeId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.EMPLOYEES.LOCALE_BY_ID(employeeId, localeId)),

  // Content Blocks
  getContentBlocks: (employeeId: string, locale?: string) =>
    apiClient.get<ContentBlock[]>(API_ENDPOINTS.EMPLOYEES.CONTENT_BLOCKS(employeeId), {
      params: locale ? { locale } : undefined,
    }),

  createContentBlock: (employeeId: string, data: CreateContentBlockDto) =>
    apiClient.post<ContentBlock>(API_ENDPOINTS.EMPLOYEES.CONTENT_BLOCKS(employeeId), data),

  updateContentBlock: (employeeId: string, blockId: string, data: UpdateContentBlockDto) =>
    apiClient.patch<ContentBlock>(API_ENDPOINTS.EMPLOYEES.CONTENT_BLOCK_BY_ID(employeeId, blockId), data),

  deleteContentBlock: (employeeId: string, blockId: string) =>
    apiClient.delete(API_ENDPOINTS.EMPLOYEES.CONTENT_BLOCK_BY_ID(employeeId, blockId)),

  reorderContentBlocks: (employeeId: string, data: ReorderContentBlocksDto) =>
    apiClient.post<ContentBlock[]>(API_ENDPOINTS.EMPLOYEES.CONTENT_BLOCKS_REORDER(employeeId), data),
};

// Query keys factory
export const employeesKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesKeys.all, "list"] as const,
  list: (params?: EmployeeFilterParams) => [...employeesKeys.lists(), params] as const,
  details: () => [...employeesKeys.all, "detail"] as const,
  detail: (id: string) => [...employeesKeys.details(), id] as const,
  contentBlocks: (employeeId: string, locale?: string) => [...employeesKeys.all, "content-blocks", employeeId, locale] as const,
};

