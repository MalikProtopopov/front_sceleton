"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { categoriesApi, categoriesKeys } from "../api/categoriesApi";
import { ROUTES } from "@/shared/config";
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
  return useAppMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    successMessage: "Категория создана",
    errorMessage: "Не удалось создать категорию",
    invalidateKeys: [categoriesKeys.lists(), categoriesKeys.tree()],
    onSuccess: (category) => {
      router.push(ROUTES.CATEGORY_EDIT(category.id));
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateCategoryDto) => categoriesApi.update(id, data),
    successMessage: "Категория обновлена",
    errorMessage: "Не удалось обновить категорию",
    invalidateKeys: [categoriesKeys.lists(), categoriesKeys.tree()],
    versionConflictKey: categoriesKeys.detail(id),
    onSuccess: (category) => {
      queryClient.setQueryData(categoriesKeys.detail(id), category);
    },
  });
}

export function useDeleteCategory() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    successMessage: "Категория удалена",
    errorMessage: "Не удалось удалить категорию",
    invalidateKeys: [categoriesKeys.lists(), categoriesKeys.tree()],
    onSuccess: () => {
      router.push(ROUTES.CATEGORIES);
    },
  });
}
