import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Product,
  ProductDetail,
  ProductImage,
  ProductChar,
  ProductPrice,
  ProductAlias,
  ProductAnalog,
  ProductFilterParams,
  CreateProductDto,
  UpdateProductDto,
  BulkCharsDto,
  BulkCharsResponse,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  CreateProductAliasesDto,
  CreateProductAnalogDto,
} from "@/entities/product";

export const productsApi = {
  getAll: (params?: ProductFilterParams) =>
    apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.LIST, { params }),

  getById: (id: string, include?: string) =>
    apiClient.get<ProductDetail>(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
      params: include ? { include } : undefined,
    }),

  create: (data: CreateProductDto) =>
    apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.LIST, data),

  update: (id: string, data: UpdateProductDto) =>
    apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id)),

  // Characteristics (EAV)
  getChars: (productId: string) =>
    apiClient.get<ProductChar[]>(API_ENDPOINTS.PRODUCTS.CHARS(productId)),

  bulkUpdateChars: (productId: string, data: BulkCharsDto) =>
    apiClient.put<BulkCharsResponse>(API_ENDPOINTS.PRODUCTS.CHARS(productId), data),

  // Images
  getImages: (productId: string) =>
    apiClient.get<ProductImage[]>(API_ENDPOINTS.PRODUCTS.IMAGES(productId)),

  uploadImage: (productId: string, file: File, alt?: string, isCover?: boolean) => {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);
    if (isCover) formData.append("is_cover", "true");
    return apiClient.post<ProductImage>(API_ENDPOINTS.PRODUCTS.IMAGES(productId), formData);
  },

  updateImage: (productId: string, imageId: string, data: { alt?: string; sort_order?: number }) =>
    apiClient.patch<ProductImage>(API_ENDPOINTS.PRODUCTS.IMAGE_BY_ID(productId, imageId), data),

  deleteImage: (productId: string, imageId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.IMAGE_BY_ID(productId, imageId)),

  reorderImages: (productId: string, orderedIds: string[]) =>
    apiClient.put(API_ENDPOINTS.PRODUCTS.IMAGES_REORDER(productId), { ordered_ids: orderedIds }),

  setCoverImage: (productId: string, imageId: string) =>
    apiClient.post(API_ENDPOINTS.PRODUCTS.IMAGE_SET_COVER(productId, imageId)),

  // Prices
  getPrices: (productId: string) =>
    apiClient.get<ProductPrice[]>(API_ENDPOINTS.PRODUCTS.PRICES(productId)),

  createPrice: (productId: string, data: CreateProductPriceDto) =>
    apiClient.post<ProductPrice>(API_ENDPOINTS.PRODUCTS.PRICES(productId), data),

  updatePrice: (productId: string, priceId: string, data: UpdateProductPriceDto) =>
    apiClient.patch<ProductPrice>(API_ENDPOINTS.PRODUCTS.PRICE_BY_ID(productId, priceId), data),

  deletePrice: (productId: string, priceId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.PRICE_BY_ID(productId, priceId)),

  // Aliases
  getAliases: (productId: string) =>
    apiClient.get<ProductAlias[]>(API_ENDPOINTS.PRODUCTS.ALIASES(productId)),

  createAliases: (productId: string, data: CreateProductAliasesDto) =>
    apiClient.post<{ created: number; skipped: number }>(
      API_ENDPOINTS.PRODUCTS.ALIASES(productId),
      data,
    ),

  deleteAlias: (productId: string, aliasId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.ALIAS_BY_ID(productId, aliasId)),

  // Analogs
  getAnalogs: (productId: string) =>
    apiClient.get<ProductAnalog[]>(API_ENDPOINTS.PRODUCTS.ANALOGS(productId)),

  createAnalog: (productId: string, data: CreateProductAnalogDto) =>
    apiClient.post<{ success: boolean }>(API_ENDPOINTS.PRODUCTS.ANALOGS(productId), data),

  deleteAnalog: (productId: string, analogProductId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.ANALOG_BY_ID(productId, analogProductId)),

  // Categories link
  updateCategories: (productId: string, categoryIds: string[]) =>
    apiClient.put<{ count: number }>(
      API_ENDPOINTS.PRODUCTS.CATEGORIES_LINK(productId),
      categoryIds,
    ),
};

export const productsKeys = {
  all: ["products"] as const,
  lists: () => [...productsKeys.all, "list"] as const,
  list: (params?: ProductFilterParams) => [...productsKeys.lists(), params] as const,
  details: () => [...productsKeys.all, "detail"] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  chars: (id: string) => [...productsKeys.all, "chars", id] as const,
  images: (id: string) => [...productsKeys.all, "images", id] as const,
  prices: (id: string) => [...productsKeys.all, "prices", id] as const,
  aliases: (id: string) => [...productsKeys.all, "aliases", id] as const,
  analogs: (id: string) => [...productsKeys.all, "analogs", id] as const,
};
