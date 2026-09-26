import { api } from "../lib/axios";
import {
  AdminCategoryListParams,
  AdminCategoryListResponse,
  Category,
  CategoryMutationResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category";

/**
 * Normalizes a numeric id for URL interpolation.
 * @param id category id
 * @returns id as string
 */
const toId = (id: number): string => String(id);

/** Client for public and admin category endpoints. */
export const categoryService = {
  /**
   * Fetches the public read-only category list for the storefront.
   * @returns categories ordered by name
   */
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get("/category/");
    return data.data as Category[];
  },

  /**
   * Fetches the paginated admin category list with server search/sort.
   * @param params search, sort and pagination options
   * @returns paginated categories with total/page/limit
   */
  getAdminCategories: async (
    params?: AdminCategoryListParams,
  ): Promise<AdminCategoryListResponse> => {
    const { data } = await api.get("/admin/category/", {
      params: {
        search: params?.search || undefined,
        sortBy: params?.sortBy || undefined,
        sort: params?.sort || undefined,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return {
      data: (data.data ?? []) as Category[],
      total: Number(data.total ?? (data.data ?? []).length),
      page: Number(data.page ?? params?.page ?? 1),
      limit: Number(data.limit ?? params?.limit ?? 10),
    };
  },

  /**
   * Fetches a single admin category including its direct children.
   * @param id category id
   * @returns category detail
   */
  getAdminCategoryById: async (id: number): Promise<Category> => {
    const { data } = await api.get(`/admin/category/${toId(id)}`);
    return data.data as Category;
  },

  /**
   * Looks up a public category by slug via the public list.
   * @param slug category slug
   * @returns matching category or undefined
   */
  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    const categories = await categoryService.getCategories();
    return categories.find((c) => c.slug === slug);
  },

  /**
   * Creates a category. The backend derives the creator from JWT when omitted.
   * @param payload create payload
   * @returns success envelope
   */
  createCategory: async (
    payload: CreateCategoryInput,
  ): Promise<CategoryMutationResponse> => {
    const { data } = await api.post("/admin/category/", payload);
    return data as CategoryMutationResponse;
  },

  /**
   * Updates a category by route id.
   * @param payload update payload
   * @param id route id (source of truth)
   * @returns success envelope
   */
  updateCategory: async (
    payload: UpdateCategoryInput,
    id: number,
  ): Promise<CategoryMutationResponse> => {
    const { data } = await api.put(`/admin/category/${toId(id)}`, {
      ...payload,
      id,
    });
    return data as CategoryMutationResponse;
  },

  /**
   * Deletes a category by id.
   * @param id category id
   * @returns success envelope
   */
  deleteCategory: async (id: number): Promise<CategoryMutationResponse> => {
    const { data } = await api.delete(`/admin/category/${toId(id)}`);
    return data as CategoryMutationResponse;
  },
};
