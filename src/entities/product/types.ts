// Product catalog entity types

export interface UOM {
  id: string;
  name: string;
  code: string;
  symbol: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface ProductChar {
  id: string;
  name: string;
  value_text: string;
  uom_id: string | null;
}

export interface ProductAlias {
  id: string;
  alias: string;
}

export interface ProductCategoryLink {
  id: string;
  category_id: string;
  is_primary: boolean;
}

export type PriceType = "regular" | "sale" | "wholesale" | "cost";

export interface ProductPrice {
  id: string;
  price_type: PriceType;
  amount: string;
  currency: string;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
}

export type AnalogRelation = "equivalent" | "better" | "worse";

export interface ProductAnalog {
  analog_product_id: string;
  sku: string;
  title: string;
  relation: AnalogRelation;
  notes: string | null;
}

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  slug: string;
  title: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  uom_id: string | null;
  is_active: boolean;
  version: number;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  chars: ProductChar[];
  aliases: ProductAlias[];
  categories: ProductCategoryLink[];
  prices: ProductPrice[];
}

// --- Request DTOs ---

export interface CreateProductDto {
  sku: string;
  slug: string;
  title: string;
  brand?: string;
  model?: string;
  description?: string;
  uom_id?: string | null;
  is_active?: boolean;
  category_ids?: string[];
}

export interface UpdateProductDto {
  sku?: string;
  slug?: string;
  title?: string;
  brand?: string | null;
  model?: string | null;
  description?: string | null;
  uom_id?: string | null;
  is_active?: boolean;
  version: number;
}

export interface CreateCategoryDto {
  title: string;
  slug: string;
  parent_id?: string | null;
  description?: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCategoryDto {
  title?: string;
  slug?: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  version: number;
}

export interface CreateUOMDto {
  name: string;
  code: string;
  symbol?: string;
}

export interface UpdateUOMDto {
  name?: string;
  code?: string;
  symbol?: string | null;
  is_active?: boolean;
}

export interface BulkCharsDto {
  created?: Array<{ name: string; value_text: string; uom_id?: string | null }>;
  updated?: Array<{ id: string; name?: string; value_text?: string; uom_id?: string | null }>;
  deleted?: string[];
}

export interface BulkCharsResponse {
  created: number;
  updated: number;
  deleted: number;
}

export interface CreateProductPriceDto {
  price_type: PriceType;
  amount: number;
  currency?: string;
  valid_from?: string | null;
  valid_to?: string | null;
}

export interface UpdateProductPriceDto {
  price_type?: PriceType;
  amount?: number;
  currency?: string;
  valid_from?: string | null;
  valid_to?: string | null;
}

export interface CreateProductAliasesDto {
  aliases: string[];
}

export interface CreateProductAnalogDto {
  analog_product_id: string;
  relation: AnalogRelation;
  notes?: string | null;
}

// --- Filter params ---

export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  category_id?: string;
  isActive?: boolean;
}

export interface CategoryFilterParams {
  page?: number;
  pageSize?: number;
  parent_id?: string;
}

// --- Display helpers ---

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  regular: "Основная",
  sale: "Акционная",
  wholesale: "Оптовая",
  cost: "Себестоимость",
};

export const ANALOG_RELATION_LABELS: Record<AnalogRelation, string> = {
  equivalent: "Полный аналог",
  better: "Аналог лучше",
  worse: "Аналог хуже",
};
