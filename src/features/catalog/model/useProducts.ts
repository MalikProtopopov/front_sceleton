"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createContentBlockHooks } from "@/shared/lib";
import { productsApi, productsKeys } from "../api/productsApi";
import { ROUTES } from "@/shared/config";
import type {
  ProductFilterParams,
  CreateProductDto,
  UpdateProductDto,
  BulkCharsDto,
  ProductCharacteristicCreate,
  ProductCharacteristicBulkCreate,
  AddProductCategoryDto,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  CreateProductAliasesDto,
  CreateProductAnalogDto,
} from "@/entities/product";


// --- Product CRUD ---

export function useProductsList(params?: ProductFilterParams) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => productsApi.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsApi.getById(id, "aliases,categories,prices"),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    successMessage: "Товар создан",
    errorMessage: "Не удалось создать товар",
    invalidateKeys: [productsKeys.lists()],
    onSuccess: (product) => router.push(ROUTES.PRODUCT_EDIT(product.id)),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateProductDto) => productsApi.update(id, data),
    successMessage: "Товар обновлён",
    errorMessage: "Не удалось обновить товар",
    invalidateKeys: [productsKeys.lists()],
    versionConflictKey: productsKeys.detail(id),
    onSuccess: (product) => {
      queryClient.setQueryData(productsKeys.detail(id), (old: unknown) =>
        old ? { ...old, ...product } : product,
      );
    },
  });
}

export function useDeleteProduct() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    successMessage: "Товар удалён",
    errorMessage: "Не удалось удалить товар",
    invalidateKeys: [productsKeys.lists()],
    onSuccess: () => router.push(ROUTES.PRODUCTS),
  });
}

// --- Characteristics ---

export function useProductChars(productId: string) {
  return useQuery({
    queryKey: productsKeys.chars(productId),
    queryFn: () => productsApi.getChars(productId),
    enabled: !!productId,
  });
}

export function useBulkUpdateChars(productId: string) {
  return useAppMutation({
    mutationFn: (data: BulkCharsDto) => productsApi.bulkUpdateChars(productId, data),
    successMessage: "Характеристики сохранены",
    errorMessage: "Не удалось сохранить характеристики",
    invalidateKeys: [productsKeys.chars(productId), productsKeys.detail(productId)],
  });
}

// --- Characteristics (normalized) ---

export function useProductCharacteristics(productId: string) {
  return useQuery({
    queryKey: productsKeys.characteristics(productId),
    queryFn: () => productsApi.getCharacteristics(productId),
    enabled: !!productId,
  });
}

export function useAddCharacteristic(productId: string) {
  return useAppMutation({
    mutationFn: (data: ProductCharacteristicCreate) =>
      productsApi.addCharacteristic(productId, data),
    successMessage: "Характеристика добавлена",
    errorMessage: "Не удалось добавить характеристику",
    invalidateKeys: [productsKeys.characteristics(productId), productsKeys.detail(productId)],
  });
}

export function useBulkUpdateCharacteristics(productId: string) {
  return useAppMutation({
    mutationFn: (data: ProductCharacteristicBulkCreate) =>
      productsApi.bulkUpdateCharacteristics(productId, data),
    successMessage: "Характеристики сохранены",
    errorMessage: "Не удалось сохранить характеристики",
    invalidateKeys: [productsKeys.characteristics(productId), productsKeys.detail(productId)],
  });
}

export function useDeleteCharacteristic(productId: string) {
  return useAppMutation({
    mutationFn: (parameterId: string) =>
      productsApi.deleteCharacteristic(productId, parameterId),
    successMessage: "Характеристика удалена",
    errorMessage: "Не удалось удалить характеристику",
    invalidateKeys: [productsKeys.characteristics(productId), productsKeys.detail(productId)],
  });
}

// --- Images ---

export function useUploadProductImage(productId: string) {
  return useAppMutation({
    mutationFn: ({ file, alt, isCover }: { file: File; alt?: string; isCover?: boolean }) =>
      productsApi.uploadImage(productId, file, alt, isCover),
    successMessage: "Изображение загружено",
    errorMessage: "Не удалось загрузить изображение",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useUpdateProductImage(productId: string) {
  return useAppMutation({
    mutationFn: ({ imageId, data }: { imageId: string; data: { alt?: string; sort_order?: number } }) =>
      productsApi.updateImage(productId, imageId, data),
    successMessage: "Изображение обновлено",
    errorMessage: "Не удалось обновить изображение",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useDeleteProductImage(productId: string) {
  return useAppMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(productId, imageId),
    successMessage: "Изображение удалено",
    errorMessage: "Не удалось удалить изображение",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useReorderProductImages(productId: string) {
  return useAppMutation({
    mutationFn: (orderedIds: string[]) => productsApi.reorderImages(productId, orderedIds),
    errorMessage: "Не удалось изменить порядок изображений",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useSetCoverImage(productId: string) {
  return useAppMutation({
    mutationFn: (imageId: string) => productsApi.setCoverImage(productId, imageId),
    successMessage: "Обложка установлена",
    errorMessage: "Не удалось установить обложку",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

// --- Prices ---

export function useCreateProductPrice(productId: string) {
  return useAppMutation({
    mutationFn: (data: CreateProductPriceDto) => productsApi.createPrice(productId, data),
    successMessage: "Цена добавлена",
    errorMessage: "Не удалось добавить цену",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useUpdateProductPrice(productId: string) {
  return useAppMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: UpdateProductPriceDto }) =>
      productsApi.updatePrice(productId, priceId, data),
    successMessage: "Цена обновлена",
    errorMessage: "Не удалось обновить цену",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useDeleteProductPrice(productId: string) {
  return useAppMutation({
    mutationFn: (priceId: string) => productsApi.deletePrice(productId, priceId),
    successMessage: "Цена удалена",
    errorMessage: "Не удалось удалить цену",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

// --- Aliases ---

export function useCreateProductAliases(productId: string) {
  return useAppMutation({
    mutationFn: (data: CreateProductAliasesDto) => productsApi.createAliases(productId, data),
    successMessage: (result) => `Добавлено псевдонимов: ${result.created}`,
    errorMessage: "Не удалось добавить псевдонимы",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

export function useDeleteProductAlias(productId: string) {
  return useAppMutation({
    mutationFn: (aliasId: string) => productsApi.deleteAlias(productId, aliasId),
    successMessage: "Псевдоним удалён",
    errorMessage: "Не удалось удалить псевдоним",
    invalidateKeys: [productsKeys.detail(productId)],
  });
}

// --- Analogs ---

export function useProductAnalogs(productId: string) {
  return useQuery({
    queryKey: productsKeys.analogs(productId),
    queryFn: () => productsApi.getAnalogs(productId),
    enabled: !!productId,
  });
}

export function useCreateProductAnalog(productId: string) {
  return useAppMutation({
    mutationFn: (data: CreateProductAnalogDto) => productsApi.createAnalog(productId, data),
    successMessage: "Аналог добавлен",
    errorMessage: "Не удалось добавить аналог",
    invalidateKeys: [productsKeys.analogs(productId)],
  });
}

export function useDeleteProductAnalog(productId: string) {
  return useAppMutation({
    mutationFn: (analogProductId: string) =>
      productsApi.deleteAnalog(productId, analogProductId),
    successMessage: "Аналог удалён",
    errorMessage: "Не удалось удалить аналог",
    invalidateKeys: [productsKeys.analogs(productId)],
  });
}

// --- Categories link ---

export function useProductCategories(productId: string) {
  return useQuery({
    queryKey: productsKeys.categories(productId),
    queryFn: () => productsApi.getCategories(productId),
    enabled: !!productId,
  });
}

export function useAddProductCategory(productId: string) {
  return useAppMutation({
    mutationFn: (data: AddProductCategoryDto) => productsApi.addCategory(productId, data),
    successMessage: "Категория привязана",
    errorMessage: "Не удалось привязать категорию",
    invalidateKeys: [productsKeys.categories(productId), productsKeys.detail(productId)],
  });
}

export function useRemoveProductCategory(productId: string) {
  return useAppMutation({
    mutationFn: (linkId: string) => productsApi.removeCategory(productId, linkId),
    successMessage: "Категория откреплена",
    errorMessage: "Не удалось открепить категорию",
    invalidateKeys: [productsKeys.categories(productId), productsKeys.detail(productId)],
  });
}

export function useUpdateProductCategories(productId: string) {
  return useAppMutation({
    mutationFn: (categoryIds: string[]) =>
      productsApi.updateCategories(productId, categoryIds),
    successMessage: "Категории обновлены",
    errorMessage: "Не удалось обновить категории",
    invalidateKeys: [productsKeys.detail(productId), productsKeys.categories(productId)],
  });
}

// --- Content Blocks ---

export const {
  useContentBlocks: useProductContentBlocks,
  useCreateContentBlock: useCreateProductContentBlock,
  useUpdateContentBlock: useUpdateProductContentBlock,
  useDeleteContentBlock: useDeleteProductContentBlock,
  useReorderContentBlocks: useReorderProductContentBlocks,
} = createContentBlockHooks(productsApi, productsKeys);
