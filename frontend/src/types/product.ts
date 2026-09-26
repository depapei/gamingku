/** Storefront variant with plain string options (public API view model). */
export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

/** Storefront specifications map (public API view model). */
export interface ProductSpecifications {
  brand?: string;
  connection?: string;
  weight?: string;
  size?: string;
  dpi?: string;
  switchType?: string;
  [key: string]: string | undefined;
}

/** Storefront product read model used by shop, cart and compare. */
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  variants?: ProductVariant[];
  featured?: boolean;
  specifications?: ProductSpecifications;
}

/** Admin variant option matching the backend `ResOption` DTO. */
export interface ProductVariantOption {
  id?: number;
  name: string;
  isAvailable: boolean;
}

/** Admin variant matching the backend `ResVariant` DTO. */
export interface AdminProductVariant {
  id?: number;
  name: string;
  options: ProductVariantOption[];
}

/** Admin specification entry matching the backend `ResSpec` DTO. */
export interface ProductSpecItem {
  key: string;
  name: string;
}

/** Canonical admin product read model shared by list and detail. */
export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: number;
  category?: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  description: string;
  variants?: AdminProductVariant[];
  featured?: boolean;
  specifications?: ProductSpecItem[];
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload for creating a product. Creator is derived from JWT when omitted. */
export interface CreateProductInput {
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: number;
  images: string[];
  description: string;
  featured?: boolean;
  variants?: AdminProductVariant[];
  specifications?: ProductSpecItem[];
  createdBy?: number;
}

/** Payload for updating a product. Route :slug remains the source of truth. */
export interface UpdateProductInput {
  slug?: string;
  name: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: number;
  images: string[];
  description: string;
  featured?: boolean;
  variants?: AdminProductVariant[];
  specifications?: ProductSpecItem[];
}

/** Server-driven query options for the admin product table. */
export interface AdminProductListParams {
  category?: string;
  search?: string;
  sortBy?: string;
  sort?: "asc" | "desc" | string;
  page?: number;
  limit?: number;
}

/** Paginated admin list response envelope. */
export interface AdminProductListResponse {
  data: AdminProduct[];
  total: number;
  page: number;
  limit: number;
}

/** Mutation response envelope returned by create/update/delete endpoints. */
export interface ProductMutationResponse {
  success: boolean;
  message: string;
}

/** Input accepted by the update mutation (payload plus route slug). */
export interface UpdateProductVariables {
  /** Route slug, the source of truth. */
  slug: string;
  /** Update payload. */
  payload: UpdateProductInput;
}
