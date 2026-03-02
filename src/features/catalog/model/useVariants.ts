"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
import { variantsApi, variantsKeys } from "../api/variantsApi";
import { productsKeys } from "../api/productsApi";
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
  return useAppMutation({
    mutationFn: (data: OptionGroupCreate) => variantsApi.createOptionGroup(productId, data),
    successMessage: "Группа опций создана",
    errorMessage: "Не удалось создать группу опций",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
  });
}

export function useUpdateOptionGroup(productId: string) {
  return useAppMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: OptionGroupUpdate }) =>
      variantsApi.updateOptionGroup(productId, groupId, data),
    successMessage: "Группа опций обновлена",
    errorMessage: "Не удалось обновить группу опций",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
  });
}

export function useDeleteOptionGroup(productId: string) {
  return useAppMutation({
    mutationFn: (groupId: string) => variantsApi.deleteOptionGroup(productId, groupId),
    successMessage: "Группа опций удалена",
    errorMessage: "Не удалось удалить группу опций",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
  });
}

// --- Option Values ---

export function useCreateOptionValue(productId: string, groupId: string) {
  return useAppMutation({
    mutationFn: (data: OptionValueCreate) =>
      variantsApi.createOptionValue(productId, groupId, data),
    successMessage: "Значение добавлено",
    errorMessage: "Не удалось добавить значение",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
  });
}

export function useUpdateOptionValue(productId: string, groupId: string) {
  return useAppMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: OptionValueUpdate }) =>
      variantsApi.updateOptionValue(productId, groupId, valueId, data),
    successMessage: "Значение обновлено",
    errorMessage: "Не удалось обновить значение",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
  });
}

export function useDeleteOptionValue(productId: string, groupId: string) {
  return useAppMutation({
    mutationFn: (valueId: string) =>
      variantsApi.deleteOptionValue(productId, groupId, valueId),
    successMessage: "Значение удалено",
    errorMessage: "Не удалось удалить значение",
    invalidateKeys: [variantsKeys.optionGroups(productId)],
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
  return useAppMutation({
    mutationFn: (data: VariantCreate) => variantsApi.createVariant(productId, data),
    successMessage: "Вариант создан",
    errorMessage: "Не удалось создать вариант",
    invalidateKeys: [variantsKeys.variants(productId), productsKeys.detail(productId)],
  });
}

export function useUpdateVariant(productId: string) {
  return useAppMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: VariantUpdate }) =>
      variantsApi.updateVariant(productId, variantId, data),
    successMessage: "Вариант обновлён",
    errorMessage: "Не удалось обновить вариант",
    invalidateKeys: [variantsKeys.variants(productId)],
  });
}

export function useDeleteVariant(productId: string) {
  return useAppMutation({
    mutationFn: (variantId: string) => variantsApi.deleteVariant(productId, variantId),
    successMessage: "Вариант удалён",
    errorMessage: "Не удалось удалить вариант",
    invalidateKeys: [variantsKeys.variants(productId), productsKeys.detail(productId)],
  });
}

export function useGenerateVariants(productId: string) {
  return useAppMutation({
    mutationFn: (data: VariantGenerateRequest) =>
      variantsApi.generateVariants(productId, data),
    successMessage: (result) => `Создано вариантов: ${result.created_count}`,
    errorMessage: "Не удалось сгенерировать варианты",
    invalidateKeys: [variantsKeys.variants(productId), productsKeys.detail(productId)],
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
  return useAppMutation({
    mutationFn: (data: VariantPriceCreate) =>
      variantsApi.createVariantPrice(productId, variantId, data),
    successMessage: "Цена добавлена",
    errorMessage: "Не удалось добавить цену",
    invalidateKeys: [
      variantsKeys.variantPrices(productId, variantId),
      variantsKeys.variants(productId),
      productsKeys.detail(productId),
    ],
  });
}

export function useUpdateVariantPrice(productId: string, variantId: string) {
  return useAppMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: VariantPriceUpdate }) =>
      variantsApi.updateVariantPrice(productId, variantId, priceId, data),
    successMessage: "Цена обновлена",
    errorMessage: "Не удалось обновить цену",
    invalidateKeys: [
      variantsKeys.variantPrices(productId, variantId),
      variantsKeys.variants(productId),
      productsKeys.detail(productId),
    ],
  });
}

export function useDeleteVariantPrice(productId: string, variantId: string) {
  return useAppMutation({
    mutationFn: (priceId: string) =>
      variantsApi.deleteVariantPrice(productId, variantId, priceId),
    successMessage: "Цена удалена",
    errorMessage: "Не удалось удалить цену",
    invalidateKeys: [
      variantsKeys.variantPrices(productId, variantId),
      variantsKeys.variants(productId),
      productsKeys.detail(productId),
    ],
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
  return useAppMutation({
    mutationFn: (data: VariantInclusionCreate) =>
      variantsApi.createVariantInclusion(productId, variantId, data),
    successMessage: "Включение добавлено",
    errorMessage: "Не удалось добавить включение",
    invalidateKeys: [
      variantsKeys.variantInclusions(productId, variantId),
      variantsKeys.variants(productId),
    ],
  });
}

export function useUpdateVariantInclusion(productId: string, variantId: string) {
  return useAppMutation({
    mutationFn: ({
      inclusionId,
      data,
    }: {
      inclusionId: string;
      data: VariantInclusionUpdate;
    }) => variantsApi.updateVariantInclusion(productId, variantId, inclusionId, data),
    successMessage: "Включение обновлено",
    errorMessage: "Не удалось обновить включение",
    invalidateKeys: [
      variantsKeys.variantInclusions(productId, variantId),
      variantsKeys.variants(productId),
    ],
  });
}

export function useDeleteVariantInclusion(productId: string, variantId: string) {
  return useAppMutation({
    mutationFn: (inclusionId: string) =>
      variantsApi.deleteVariantInclusion(productId, variantId, inclusionId),
    successMessage: "Включение удалено",
    errorMessage: "Не удалось удалить включение",
    invalidateKeys: [
      variantsKeys.variantInclusions(productId, variantId),
      variantsKeys.variants(productId),
    ],
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
  return useAppMutation({
    mutationFn: ({ file, alt, isCover }: { file: File; alt?: string; isCover?: boolean }) =>
      variantsApi.uploadVariantImage(productId, variantId, file, alt, isCover),
    successMessage: "Изображение загружено",
    errorMessage: "Не удалось загрузить изображение",
    invalidateKeys: [
      variantsKeys.variantImages(productId, variantId),
      variantsKeys.variants(productId),
    ],
  });
}

export function useDeleteVariantImage(productId: string, variantId: string) {
  return useAppMutation({
    mutationFn: (imageId: string) =>
      variantsApi.deleteVariantImage(productId, variantId, imageId),
    successMessage: "Изображение удалено",
    errorMessage: "Не удалось удалить изображение",
    invalidateKeys: [
      variantsKeys.variantImages(productId, variantId),
      variantsKeys.variants(productId),
    ],
  });
}
