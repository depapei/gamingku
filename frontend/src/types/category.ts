/** Lightweight child category shown inside a category detail response. */
export interface CategoryChild {
  id: number;
  name: string;
  image: string;
  slug?: string;
}

/** Authenticated user snapshot embedded in admin category responses. */
export interface CategoryCreator {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

/** Canonical category read model shared by admin and storefront lists. */
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  image: string;
  createdBy?: number;
  createdByUser?: CategoryCreator;
  childs?: CategoryChild[];
  createdAt?: string;
  updatedAt?: string;
}

/** Payload for creating a category. Creator is derived from JWT when omitted. */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  image: string;
  parentId?: number | null;
  createdBy?: number;
}

/** Payload for updating a category. Route :id remains the source of truth. */
export interface UpdateCategoryInput {
  id?: number;
  name: string;
  slug: string;
  image: string;
  parentId?: number | null;
}

/** Server-driven query options for the admin category table. */
export interface AdminCategoryListParams {
  search?: string;
  sortBy?: string;
  sort?: "asc" | "desc" | string;
  page?: number;
  limit?: number;
}

/** Paginated admin list response envelope. */
export interface AdminCategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

/** Mutation response envelope returned by create/update/delete endpoints. */
export interface CategoryMutationResponse {
  success: boolean;
  message: string;
}
