import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import {
  AdminCategoryListParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category";
import { queryClient } from "../lib/queryClient";

/** Query keys separating the public cache from the admin cache. */
export const categoryKeys = {
  /** Public storefront list key. */
  public: ["categories"] as const,
  /** Admin list key parameterized by table params. */
  adminList: (params?: AdminCategoryListParams) =>
    ["admin", "categories", params ?? {}] as const,
  /** Admin detail key for a single category. */
  adminDetail: (id: number | undefined) =>
    ["admin", "categories", id] as const,
};

/**
 * Fetches the public storefront category list.
 * @returns query result with categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.public,
    queryFn: () => categoryService.getCategories(),
  });
};

/**
 * Fetches the paginated admin category list with server search/sort.
 * @param params search, sort and pagination options
 * @returns paginated query result keeping previous page data
 */
export const useAdminCategories = (params?: AdminCategoryListParams) => {
  return useQuery({
    queryKey: categoryKeys.adminList(params),
    queryFn: () => categoryService.getAdminCategories(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Fetches a single admin category including children.
 * @param id category id
 * @returns detail query result, disabled when id is missing
 */
export const useCategoryDetail = (id: number | undefined) => {
  return useQuery({
    queryKey: categoryKeys.adminDetail(id),
    queryFn: () => categoryService.getAdminCategoryById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
};

/**
 * Creates a category and refreshes admin + public caches.
 * @returns mutation for category creation
 */
export const createCategory = () => {
  return useMutation({
    mutationFn: async (payload: CreateCategoryInput) =>
      categoryService.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.public });
    },
  });
};

/** Input accepted by the update mutation (payload plus route id). */
export interface UpdateCategoryVariables {
  /** Route id, the source of truth. */
  id: number;
  /** Update payload. */
  payload: UpdateCategoryInput;
}

/**
 * Updates a category and refreshes admin + public caches.
 * @returns mutation for category updates
 */
export const updateCategory = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: UpdateCategoryVariables) =>
      categoryService.updateCategory(payload, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.public });
    },
  });
};

/**
 * Deletes a category and refreshes admin + public caches.
 * @returns mutation for category deletion
 */
export const deleteCategory = () => {
  return useMutation({
    mutationFn: async (id: number) => categoryService.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.public });
    },
  });
};
