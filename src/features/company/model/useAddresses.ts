"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createLocaleHooks } from "@/shared/lib";
import { addressesApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreateAddressDto, UpdateAddressDto, CreateAddressLocaleDto, UpdateAddressLocaleDto } from "@/entities/company";

export function useAddressesList() {
  return useQuery({
    queryKey: companyKeys.addresses.list(),
    queryFn: () => addressesApi.getAll(),
  });
}

export function useAddress(id: string) {
  return useQuery({
    queryKey: companyKeys.addresses.detail(id),
    queryFn: () => addressesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAddress() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateAddressDto) => addressesApi.create(data),
    successMessage: "Адрес создан",
    errorMessage: "Не удалось создать адрес",
    invalidateKeys: [companyKeys.addresses.list()],
    onSuccess: (item) => {
      router.push(ROUTES.ADDRESS_EDIT(item.id));
    },
  });
}

export function useUpdateAddress(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateAddressDto) => addressesApi.update(id, data),
    successMessage: "Адрес обновлен",
    errorMessage: "Не удалось обновить адрес",
    invalidateKeys: [companyKeys.addresses.list()],
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.addresses.detail(id), item);
    },
  });
}

export function useDeleteAddress() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    successMessage: "Адрес удален",
    errorMessage: "Не удалось удалить адрес",
    invalidateKeys: [companyKeys.addresses.list()],
    onSuccess: () => router.push(ROUTES.ADDRESSES),
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateAddressLocale,
  useUpdateLocale: useUpdateAddressLocale,
  useDeleteLocale: useDeleteAddressLocale,
} = createLocaleHooks<CreateAddressLocaleDto, UpdateAddressLocaleDto>(addressesApi, companyKeys.addresses.detail);
