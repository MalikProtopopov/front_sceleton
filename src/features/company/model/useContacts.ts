"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { contactsApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreateContactDto, UpdateContactDto } from "@/entities/company";

export function useContactsList() {
  return useQuery({
    queryKey: companyKeys.contacts.list(),
    queryFn: () => contactsApi.getAll(),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: companyKeys.contacts.detail(id),
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateContactDto) => contactsApi.create(data),
    successMessage: "Контакт создан",
    errorMessage: "Не удалось создать контакт",
    invalidateKeys: [companyKeys.contacts.list()],
    onSuccess: (item) => {
      router.push(ROUTES.CONTACT_EDIT(item.id));
    },
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateContactDto) => contactsApi.update(id, data),
    successMessage: "Контакт обновлен",
    errorMessage: "Не удалось обновить контакт",
    invalidateKeys: [companyKeys.contacts.list()],
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.contacts.detail(id), item);
    },
  });
}

export function useDeleteContact() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    successMessage: "Контакт удален",
    errorMessage: "Не удалось удалить контакт",
    invalidateKeys: [companyKeys.contacts.list()],
    onSuccess: () => router.push(ROUTES.CONTACTS_LIST),
  });
}
