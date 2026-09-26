import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import {
  AdminProductListParams,
  CreateProductInput,
  UpdateProductVariables,
} from "../types/product";
import { queryClient } from "../lib/queryClient";

/** Query keys separating the public cache from the admin cache. */
export const productKeys = {
  /** Public storefront list key. */
  public: ["products"] as const,
  /** Public storefront list key parameterized by filters. */
  publicList: (params?: { category?: string; search?: string; sort?: string }) =>
    ["products", params ?? {}] as const,
  /** Public detail key for a single product. */
  publicDetail: (slug: string) => ["product", slug] as const,
  /** Admin list key parameterized by table params. */
  adminList: (params?: AdminProductListParams) =>
    ["admin", "products", params ?? {}] as const,
  /** Admin detail key for a single product. */
  adminDetail: (slug: string | undefined) =>
    ["admin", "products", slug] as const,
};

/**
 * Fetches the public storefront product list with client-side filters.
 * @param params optional category/search/sort options
 * @returns query result with products
 */
export const useProducts = (params?: {
  category?: string;
  search?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: productKeys.publicList(params),
    queryFn: async () => await productService.getProducts(params),
  });
};

/**
 * Fetches a single public product by slug.
 * @param slug product slug
 * @returns detail query result, disabled when slug is missing
 */
export const useProductDetail = (slug: string) => {
  return useQuery({
    queryKey: productKeys.publicDetail(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
};

/**
 * Fetches featured products for the homepage.
 * @returns query result with featured products
 */
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeaturedProducts(),
  });
};

/**
 * Fetches the paginated admin product list with server search/sort.
 * @param params search, sort and pagination options
 * @returns paginated query result keeping previous page data
 */
export const useAdminProducts = (params?: AdminProductListParams) => {
  return useQuery({
    queryKey: productKeys.adminList(params),
    queryFn: () => productService.getAdminProducts(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Fetches a single admin product including variants and specifications.
 * @param slug product slug
 * @returns detail query result, disabled when slug is missing
 */
export const useAdminProductDetail = (slug: string | undefined) => {
  return useQuery({
    queryKey: productKeys.adminDetail(slug),
    queryFn: () => productService.getAdminProductBySlug(slug as string),
    enabled: typeof slug === "string" && slug.length > 0,
  });
};

/**
 * Creates a product and refreshes admin + public caches.
 * @returns mutation for product creation
 */
export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (payload: CreateProductInput) =>
      productService.createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: productKeys.public });
    },
  });
};

/**
 * Updates a product and refreshes admin + public caches.
 * @returns mutation for product updates
 */
export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ slug, payload }: UpdateProductVariables) =>
      productService.updateProduct(payload, slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: productKeys.public });
    },
  });
};

/**
 * Deletes a product and refreshes admin + public caches.
 * @returns mutation for product deletion
 */
export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (slug: string) => productService.deleteProduct(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: productKeys.public });
    },
  });
};
