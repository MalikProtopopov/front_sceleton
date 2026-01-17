"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addressesApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreateAddressDto, UpdateAddressDto, CreateAddressLocaleDto, UpdateAddressLocaleDto } from "@/entities/company";
import { handleLocaleError } from "@/shared/lib/localeErrors";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressDto) => addressesApi.create(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.list() });
      toast.success("Адрес создан");
      router.push(ROUTES.ADDRESS_EDIT(item.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать адрес";
      toast.error(message);
    },
  });
}

export function useUpdateAddress(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddressDto) => addressesApi.update(id, data),
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.addresses.detail(id), item);
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.list() });
      toast.success("Адрес обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить адрес";
      toast.error(message);
    },
  });
}

export function useDeleteAddress() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.list() });
      toast.success("Адрес удален");
      router.push(ROUTES.ADDRESSES);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить адрес";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateAddressLocale(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressLocaleDto) => addressesApi.createLocale(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.detail(addressId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateAddressLocale(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateAddressLocaleDto }) =>
      addressesApi.updateLocale(addressId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.detail(addressId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteAddressLocale(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => addressesApi.deleteLocale(addressId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.addresses.detail(addressId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

