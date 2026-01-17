"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactDto) => contactsApi.create(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.contacts.list() });
      toast.success("Контакт создан");
      router.push(ROUTES.CONTACT_EDIT(item.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать контакт";
      toast.error(message);
    },
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactDto) => contactsApi.update(id, data),
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.contacts.detail(id), item);
      queryClient.invalidateQueries({ queryKey: companyKeys.contacts.list() });
      toast.success("Контакт обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить контакт";
      toast.error(message);
    },
  });
}

export function useDeleteContact() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.contacts.list() });
      toast.success("Контакт удален");
      router.push(ROUTES.CONTACTS_LIST);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить контакт";
      toast.error(message);
    },
  });
}

