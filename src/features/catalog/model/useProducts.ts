"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsApi, productsKeys } from "../api/productsApi";
import { ROUTES } from "@/shared/config";
import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";
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
import type { CreateContentBlockDto, UpdateContentBlockDto, ReorderContentBlocksDto } from "@/entities/content-block";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success("Товар создан");
      router.push(ROUTES.PRODUCT_EDIT(product.id));
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать товар");
      toast.error(message);
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductDto) => productsApi.update(id, data),
    onSuccess: (product) => {
      queryClient.setQueryData(productsKeys.detail(id), (old: unknown) =>
        old ? { ...old, ...product } : product,
      );
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success("Товар обновлён");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, productsKeys.detail(id))) return;
      const message = getErrorMessage(error, "Не удалось обновить товар");
      toast.error(message);
    },
  });
}

export function useDeleteProduct() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success("Товар удалён");
      router.push(ROUTES.PRODUCTS);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить товар");
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCharsDto) => productsApi.bulkUpdateChars(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.chars(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Характеристики сохранены");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось сохранить характеристики");
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCharacteristicCreate) =>
      productsApi.addCharacteristic(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.characteristics(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Характеристика добавлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить характеристику");
      toast.error(message);
    },
  });
}

export function useBulkUpdateCharacteristics(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCharacteristicBulkCreate) =>
      productsApi.bulkUpdateCharacteristics(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.characteristics(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Характеристики сохранены");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось сохранить характеристики");
      toast.error(message);
    },
  });
}

export function useDeleteCharacteristic(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parameterId: string) =>
      productsApi.deleteCharacteristic(productId, parameterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.characteristics(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Характеристика удалена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить характеристику");
      toast.error(message);
    },
  });
}

// --- Images ---

export function useUploadProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, alt, isCover }: { file: File; alt?: string; isCover?: boolean }) =>
      productsApi.uploadImage(productId, file, alt, isCover),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Изображение загружено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось загрузить изображение");
      toast.error(message);
    },
  });
}

export function useUpdateProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      data,
    }: {
      imageId: string;
      data: { alt?: string; sort_order?: number };
    }) => productsApi.updateImage(productId, imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Изображение обновлено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить изображение");
      toast.error(message);
    },
  });
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Изображение удалено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить изображение");
      toast.error(message);
    },
  });
}

export function useReorderProductImages(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => productsApi.reorderImages(productId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось изменить порядок изображений");
      toast.error(message);
    },
  });
}

export function useSetCoverImage(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => productsApi.setCoverImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Обложка установлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось установить обложку");
      toast.error(message);
    },
  });
}

// --- Prices ---

export function useCreateProductPrice(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPriceDto) => productsApi.createPrice(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена добавлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить цену");
      toast.error(message);
    },
  });
}

export function useUpdateProductPrice(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: UpdateProductPriceDto }) =>
      productsApi.updatePrice(productId, priceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена обновлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить цену");
      toast.error(message);
    },
  });
}

export function useDeleteProductPrice(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priceId: string) => productsApi.deletePrice(productId, priceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Цена удалена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить цену");
      toast.error(message);
    },
  });
}

// --- Aliases ---

export function useCreateProductAliases(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductAliasesDto) => productsApi.createAliases(productId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success(`Добавлено псевдонимов: ${result.created}`);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить псевдонимы");
      toast.error(message);
    },
  });
}

export function useDeleteProductAlias(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aliasId: string) => productsApi.deleteAlias(productId, aliasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Псевдоним удалён");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить псевдоним");
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductAnalogDto) => productsApi.createAnalog(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.analogs(productId) });
      toast.success("Аналог добавлен");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить аналог");
      toast.error(message);
    },
  });
}

export function useDeleteProductAnalog(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (analogProductId: string) =>
      productsApi.deleteAnalog(productId, analogProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.analogs(productId) });
      toast.success("Аналог удалён");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить аналог");
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddProductCategoryDto) =>
      productsApi.addCategory(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.categories(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Категория привязана");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось привязать категорию");
      toast.error(message);
    },
  });
}

export function useRemoveProductCategory(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) =>
      productsApi.removeCategory(productId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.categories(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      toast.success("Категория откреплена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось открепить категорию");
      toast.error(message);
    },
  });
}

export function useUpdateProductCategories(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: string[]) =>
      productsApi.updateCategories(productId, categoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.categories(productId) });
      toast.success("Категории обновлены");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить категории");
      toast.error(message);
    },
  });
}

// --- Content Blocks ---

export function useProductContentBlocks(productId: string, locale?: string) {
  return useQuery({
    queryKey: productsKeys.contentBlocks(productId, locale),
    queryFn: () => productsApi.getContentBlocks(productId, locale),
    enabled: !!productId,
  });
}

export function useCreateProductContentBlock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContentBlockDto) => productsApi.createContentBlock(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...productsKeys.all, "content-blocks", productId] });
      toast.success("Блок добавлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось добавить блок";
      toast.error(message);
    },
  });
}

export function useUpdateProductContentBlock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blockId, data }: { blockId: string; data: UpdateContentBlockDto }) =>
      productsApi.updateContentBlock(productId, blockId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...productsKeys.all, "content-blocks", productId] });
      toast.success("Блок обновлён");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить блок";
      toast.error(message);
    },
  });
}

export function useDeleteProductContentBlock(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => productsApi.deleteContentBlock(productId, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...productsKeys.all, "content-blocks", productId] });
      toast.success("Блок удалён");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить блок";
      toast.error(message);
    },
  });
}

export function useReorderProductContentBlocks(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderContentBlocksDto) => productsApi.reorderContentBlocks(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...productsKeys.all, "content-blocks", productId] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить порядок блоков";
      toast.error(message);
    },
  });
}
