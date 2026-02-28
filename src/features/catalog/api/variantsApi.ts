import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  OptionGroup,
  OptionGroupCreate,
  OptionGroupUpdate,
  OptionValue,
  OptionValueCreate,
  OptionValueUpdate,
  ProductVariant,
  VariantCreate,
  VariantUpdate,
  VariantGenerateRequest,
  VariantGenerateResponse,
  VariantPrice,
  VariantPriceCreate,
  VariantPriceUpdate,
  VariantInclusion,
  VariantInclusionCreate,
  VariantInclusionUpdate,
  VariantImage,
} from "@/entities/product";

export const variantsApi = {
  // --- Option Groups ---

  getOptionGroups: (productId: string) =>
    apiClient.get<OptionGroup[]>(API_ENDPOINTS.PRODUCTS.OPTION_GROUPS(productId)),

  createOptionGroup: (productId: string, data: OptionGroupCreate) =>
    apiClient.post<OptionGroup>(API_ENDPOINTS.PRODUCTS.OPTION_GROUPS(productId), data),

  updateOptionGroup: (productId: string, groupId: string, data: OptionGroupUpdate) =>
    apiClient.patch<OptionGroup>(
      API_ENDPOINTS.PRODUCTS.OPTION_GROUP_BY_ID(productId, groupId),
      data,
    ),

  deleteOptionGroup: (productId: string, groupId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.OPTION_GROUP_BY_ID(productId, groupId)),

  // --- Option Values ---

  createOptionValue: (productId: string, groupId: string, data: OptionValueCreate) =>
    apiClient.post<OptionValue>(
      API_ENDPOINTS.PRODUCTS.OPTION_VALUES(productId, groupId),
      data,
    ),

  updateOptionValue: (
    productId: string,
    groupId: string,
    valueId: string,
    data: OptionValueUpdate,
  ) =>
    apiClient.patch<OptionValue>(
      API_ENDPOINTS.PRODUCTS.OPTION_VALUE_BY_ID(productId, groupId, valueId),
      data,
    ),

  deleteOptionValue: (productId: string, groupId: string, valueId: string) =>
    apiClient.delete(
      API_ENDPOINTS.PRODUCTS.OPTION_VALUE_BY_ID(productId, groupId, valueId),
    ),

  // --- Variants ---

  getVariants: (productId: string) =>
    apiClient.get<ProductVariant[]>(API_ENDPOINTS.PRODUCTS.VARIANTS(productId)),

  getVariant: (productId: string, variantId: string) =>
    apiClient.get<ProductVariant>(
      API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(productId, variantId),
    ),

  createVariant: (productId: string, data: VariantCreate) =>
    apiClient.post<ProductVariant>(API_ENDPOINTS.PRODUCTS.VARIANTS(productId), data),

  updateVariant: (productId: string, variantId: string, data: VariantUpdate) =>
    apiClient.patch<ProductVariant>(
      API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(productId, variantId),
      data,
    ),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete(API_ENDPOINTS.PRODUCTS.VARIANT_BY_ID(productId, variantId)),

  generateVariants: (productId: string, data: VariantGenerateRequest) =>
    apiClient.post<VariantGenerateResponse>(
      API_ENDPOINTS.PRODUCTS.VARIANTS_GENERATE(productId),
      data,
    ),

  // --- Variant Prices ---

  getVariantPrices: (productId: string, variantId: string) =>
    apiClient.get<VariantPrice[]>(
      API_ENDPOINTS.PRODUCTS.VARIANT_PRICES(productId, variantId),
    ),

  createVariantPrice: (productId: string, variantId: string, data: VariantPriceCreate) =>
    apiClient.post<VariantPrice>(
      API_ENDPOINTS.PRODUCTS.VARIANT_PRICES(productId, variantId),
      data,
    ),

  updateVariantPrice: (
    productId: string,
    variantId: string,
    priceId: string,
    data: VariantPriceUpdate,
  ) =>
    apiClient.patch<VariantPrice>(
      API_ENDPOINTS.PRODUCTS.VARIANT_PRICE_BY_ID(productId, variantId, priceId),
      data,
    ),

  deleteVariantPrice: (productId: string, variantId: string, priceId: string) =>
    apiClient.delete(
      API_ENDPOINTS.PRODUCTS.VARIANT_PRICE_BY_ID(productId, variantId, priceId),
    ),

  // --- Variant Inclusions ---

  getVariantInclusions: (productId: string, variantId: string) =>
    apiClient.get<VariantInclusion[]>(
      API_ENDPOINTS.PRODUCTS.VARIANT_INCLUSIONS(productId, variantId),
    ),

  createVariantInclusion: (
    productId: string,
    variantId: string,
    data: VariantInclusionCreate,
  ) =>
    apiClient.post<VariantInclusion>(
      API_ENDPOINTS.PRODUCTS.VARIANT_INCLUSIONS(productId, variantId),
      data,
    ),

  updateVariantInclusion: (
    productId: string,
    variantId: string,
    inclusionId: string,
    data: VariantInclusionUpdate,
  ) =>
    apiClient.patch<VariantInclusion>(
      API_ENDPOINTS.PRODUCTS.VARIANT_INCLUSION_BY_ID(productId, variantId, inclusionId),
      data,
    ),

  deleteVariantInclusion: (productId: string, variantId: string, inclusionId: string) =>
    apiClient.delete(
      API_ENDPOINTS.PRODUCTS.VARIANT_INCLUSION_BY_ID(productId, variantId, inclusionId),
    ),

  // --- Variant Images ---

  getVariantImages: (productId: string, variantId: string) =>
    apiClient.get<VariantImage[]>(
      API_ENDPOINTS.PRODUCTS.VARIANT_IMAGES(productId, variantId),
    ),

  uploadVariantImage: (
    productId: string,
    variantId: string,
    file: File,
    alt?: string,
    isCover?: boolean,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);
    if (isCover) formData.append("is_cover", "true");
    return apiClient.post<VariantImage>(
      API_ENDPOINTS.PRODUCTS.VARIANT_IMAGES(productId, variantId),
      formData,
    );
  },

  deleteVariantImage: (productId: string, variantId: string, imageId: string) =>
    apiClient.delete(
      API_ENDPOINTS.PRODUCTS.VARIANT_IMAGE_BY_ID(productId, variantId, imageId),
    ),
};

export const variantsKeys = {
  all: ["variants"] as const,
  optionGroups: (productId: string) => [...variantsKeys.all, "option-groups", productId] as const,
  variants: (productId: string) => [...variantsKeys.all, "list", productId] as const,
  variant: (productId: string, variantId: string) =>
    [...variantsKeys.all, "detail", productId, variantId] as const,
  variantPrices: (productId: string, variantId: string) =>
    [...variantsKeys.all, "prices", productId, variantId] as const,
  variantInclusions: (productId: string, variantId: string) =>
    [...variantsKeys.all, "inclusions", productId, variantId] as const,
  variantImages: (productId: string, variantId: string) =>
    [...variantsKeys.all, "images", productId, variantId] as const,
};
