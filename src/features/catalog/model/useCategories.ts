"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoriesApi, categoriesKeys } from "../api/categoriesApi";
import { ROUTES } from "@/shared/config";
import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";
import type {
  CategoryFilterParams,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/entities/product";

export function useCategoriesList(params?: CategoryFilterParams) {
  return useQuery({
    queryKey: categoriesKeys.list(params),
    queryFn: () => categoriesApi.getAll(params),
  });
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: categoriesKeys.tree(),
    queryFn: () => categoriesApi.getTree(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
      toast.success("Категория создана");
      router.push(ROUTES.CATEGORY_EDIT(category.id));
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать категорию");
      toast.error(message);
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryDto) => categoriesApi.update(id, data),
    onSuccess: (category) => {
      queryClient.setQueryData(categoriesKeys.detail(id), category);
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
      toast.success("Категория обновлена");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, categoriesKeys.detail(id))) return;
      const message = getErrorMessage(error, "Не удалось обновить категорию");
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
      toast.success("Категория удалена");
      router.push(ROUTES.CATEGORIES);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить категорию");
      toast.error(message);
    },
  });
}
