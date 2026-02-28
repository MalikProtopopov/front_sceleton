"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { variantsApi, variantsKeys } from "../api/variantsApi";
import { productsKeys } from "../api/productsApi";
import { getErrorMessage } from "@/shared/lib/versionConflict";
import type {
  OptionGroupCreate,
  OptionGroupUpdate,
  OptionValueCreate,
  OptionValueUpdate,
  VariantCreate,
  VariantUpdate,
  VariantGenerateRequest,
  VariantPriceCreate,
  VariantPriceUpdate,
  VariantInclusionCreate,
  VariantInclusionUpdate,
} from "@/entities/product";

// --- Option Groups ---

export function useOptionGroups(productId: string) {
  return useQuery({
    queryKey: variantsKeys.optionGroups(productId),
    queryFn: () => variantsApi.getOptionGroups(productId),
    enabled: !!productId,
  });
}

export function useCreateOptionGroup(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionGroupCreate) => variantsApi.createOptionGroup(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Группа опций создана");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось создать группу опций")),
  });
}

export function useUpdateOptionGroup(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: OptionGroupUpdate }) =>
      variantsApi.updateOptionGroup(productId, groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Группа опций обновлена");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось обновить группу опций")),
  });
}

export function useDeleteOptionGroup(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => variantsApi.deleteOptionGroup(productId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Группа опций удалена");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить группу опций")),
  });
}

// --- Option Values ---

export function useCreateOptionValue(productId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionValueCreate) =>
      variantsApi.createOptionValue(productId, groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Значение добавлено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось добавить значение")),
  });
}

export function useUpdateOptionValue(productId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: OptionValueUpdate }) =>
      variantsApi.updateOptionValue(productId, groupId, valueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Значение обновлено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось обновить значение")),
  });
}

export function useDeleteOptionValue(productId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valueId: string) =>
      variantsApi.deleteOptionValue(productId, groupId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.optionGroups(productId) });
      toast.success("Значение удалено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить значение")),
  });
}

// --- Variants ---

export function useVariantsList(productId: string) {
  return useQuery({
    queryKey: variantsKeys.variants(productId),
    queryFn: () => variantsApi.getVariants(productId),
    enabled: !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VariantCreate) => variantsApi.createVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Вариант создан");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось создать вариант")),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: VariantUpdate }) =>
      variantsApi.updateVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Вариант обновлён");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось обновить вариант")),
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => variantsApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Вариант удалён");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить вариант")),
  });
}

export function useGenerateVariants(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VariantGenerateRequest) =>
      variantsApi.generateVariants(productId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success(`Создано вариантов: ${result.created_count}`);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось сгенерировать варианты")),
  });
}

// --- Variant Prices ---

export function useVariantPrices(productId: string, variantId: string) {
  return useQuery({
    queryKey: variantsKeys.variantPrices(productId, variantId),
    queryFn: () => variantsApi.getVariantPrices(productId, variantId),
    enabled: !!productId && !!variantId,
  });
}

export function useCreateVariantPrice(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VariantPriceCreate) =>
      variantsApi.createVariantPrice(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantPrices(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена добавлена");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось добавить цену")),
  });
}

export function useUpdateVariantPrice(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: VariantPriceUpdate }) =>
      variantsApi.updateVariantPrice(productId, variantId, priceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantPrices(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена обновлена");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось обновить цену")),
  });
}

export function useDeleteVariantPrice(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (priceId: string) =>
      variantsApi.deleteVariantPrice(productId, variantId, priceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantPrices(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена удалена");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить цену")),
  });
}

// --- Variant Inclusions ---

export function useVariantInclusions(productId: string, variantId: string) {
  return useQuery({
    queryKey: variantsKeys.variantInclusions(productId, variantId),
    queryFn: () => variantsApi.getVariantInclusions(productId, variantId),
    enabled: !!productId && !!variantId,
  });
}

export function useCreateVariantInclusion(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VariantInclusionCreate) =>
      variantsApi.createVariantInclusion(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantInclusions(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Включение добавлено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось добавить включение")),
  });
}

export function useUpdateVariantInclusion(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inclusionId,
      data,
    }: {
      inclusionId: string;
      data: VariantInclusionUpdate;
    }) => variantsApi.updateVariantInclusion(productId, variantId, inclusionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantInclusions(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Включение обновлено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось обновить включение")),
  });
}

export function useDeleteVariantInclusion(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inclusionId: string) =>
      variantsApi.deleteVariantInclusion(productId, variantId, inclusionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantInclusions(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Включение удалено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить включение")),
  });
}

// --- Variant Images ---

export function useVariantImages(productId: string, variantId: string) {
  return useQuery({
    queryKey: variantsKeys.variantImages(productId, variantId),
    queryFn: () => variantsApi.getVariantImages(productId, variantId),
    enabled: !!productId && !!variantId,
  });
}

export function useUploadVariantImage(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, alt, isCover }: { file: File; alt?: string; isCover?: boolean }) =>
      variantsApi.uploadVariantImage(productId, variantId, file, alt, isCover),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantImages(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Изображение загружено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось загрузить изображение")),
  });
}

export function useDeleteVariantImage(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      variantsApi.deleteVariantImage(productId, variantId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantsKeys.variantImages(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: variantsKeys.variants(productId) });
      toast.success("Изображение удалено");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Не удалось удалить изображение")),
  });
}
