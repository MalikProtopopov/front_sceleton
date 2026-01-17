import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Employee, EmployeeLocale, CreateEmployeeDto, UpdateEmployeeDto, CreateEmployeeLocaleDto, UpdateEmployeeLocaleDto, EmployeeFilterParams } from "@/entities/employee";

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
};

// Query keys factory
export const employeesKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesKeys.all, "list"] as const,
  list: (params?: EmployeeFilterParams) => [...employeesKeys.lists(), params] as const,
  details: () => [...employeesKeys.all, "detail"] as const,
  detail: (id: string) => [...employeesKeys.details(), id] as const,
};

