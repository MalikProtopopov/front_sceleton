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

// Legacy — kept for backward compat during migration
export interface ProductChar {
  id: string;
  name: string;
  value_text: string;
  uom_id: string | null;
}

// ---------- Parameters (dictionary of characteristics) ----------

export type ParameterValueType = "string" | "number" | "enum" | "bool" | "range";
export type ParameterScope = "global" | "category";

export interface ParameterValue {
  id: string;
  parameter_id: string;
  label: string;
  slug: string;
  code: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Parameter {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  value_type: ParameterValueType;
  uom_id: string | null;
  scope: ParameterScope;
  description: string | null;
  constraints: Record<string, unknown> | null;
  is_filterable: boolean;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  values: ParameterValue[];
  category_ids: string[];
}

// ---------- Product characteristics (normalized) ----------

export type SourceType = "manual" | "import" | "system";

export interface ProductCharacteristic {
  id: string;
  product_id: string;
  parameter_id: string;
  parameter_value_id: string | null;
  value_text: string | null;
  value_number: number | null;
  value_bool: boolean | null;
  uom_id: string | null;
  source_type: SourceType;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
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

// Legacy — kept for backward compat during migration
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

// --- Parameter DTOs ---

export interface ParameterCreate {
  name: string;
  slug?: string;
  value_type: ParameterValueType;
  uom_id?: string;
  scope?: ParameterScope;
  description?: string;
  constraints?: Record<string, unknown>;
  is_filterable?: boolean;
  is_required?: boolean;
  sort_order?: number;
  category_ids?: string[];
  values?: ParameterValueCreate[];
}

export interface ParameterUpdate {
  name?: string;
  slug?: string;
  description?: string;
  uom_id?: string | null;
  scope?: ParameterScope;
  constraints?: Record<string, unknown>;
  is_filterable?: boolean;
  is_required?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface ParameterValueCreate {
  label: string;
  slug?: string;
  code?: string;
  sort_order?: number;
}

export interface ParameterValueUpdate {
  label?: string;
  slug?: string;
  code?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ParameterCategorySet {
  category_ids: string[];
}

// --- Product characteristic DTOs ---

export interface ProductCharacteristicCreate {
  parameter_id: string;
  parameter_value_id?: string;
  value_text?: string;
  value_number?: number;
  value_bool?: boolean;
  uom_id?: string;
  source_type?: SourceType;
}

export interface ProductCharacteristicBulkItem {
  parameter_id: string;
  parameter_value_ids?: string[];
  value_text?: string;
  value_number?: number;
  value_bool?: boolean;
  uom_id?: string;
}

export interface ProductCharacteristicBulkCreate {
  characteristics: ProductCharacteristicBulkItem[];
}

export interface ProductCharacteristicBulkResponse {
  created: number;
  updated: number;
  deleted: number;
}

export interface AddProductCategoryDto {
  category_id: string;
  is_primary?: boolean;
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

export interface ParameterFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  valueType?: ParameterValueType;
  scope?: ParameterScope;
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

export const PARAMETER_VALUE_TYPE_LABELS: Record<ParameterValueType, string> = {
  enum: "Список",
  number: "Число",
  string: "Строка",
  bool: "Да/Нет",
  range: "Диапазон",
};

export const PARAMETER_SCOPE_LABELS: Record<ParameterScope, string> = {
  global: "Глобальный",
  category: "По категориям",
};
