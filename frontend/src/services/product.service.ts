import { api } from "../lib/axios";
import {
  AdminProduct,
  AdminProductListParams,
  AdminProductListResponse,
  CreateProductInput,
  Product,
  ProductMutationResponse,
  UpdateProductInput,
} from "../types/product";

/** Query options for the product list endpoint. */
export interface ProductListParams {
  category?: string;
  search?: string;
  sort?: string;
}

/** Encodes a product slug for URL interpolation. */
const toSlug = (slug: string): string => encodeURIComponent(slug);

/** Client for public and admin product endpoints. */
export const productService = {
  /**
   * Fetches products and applies optional category, search and sort filters.
   * @param params optional category/search/sort options
   * @returns filtered products
   */
  getProducts: async (params?: ProductListParams): Promise<Product[]> => {
    const { data } = await api.get(`/product/`);
    let result = [...(data.data as Product[])];

    if (params?.category) {
      result = result.filter(
        (p) => String(p.categoryId) === String(params.category),
      );
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      );
    }

    if (params?.sort) {
      switch (params.sort) {
        case "price-asc":
          result.sort(
            (a, b) =>
              (a.discountPrice || a.price) - (b.discountPrice || b.price),
          );
          break;
        case "price-desc":
          result.sort(
            (a, b) =>
              (b.discountPrice || b.price) - (a.discountPrice || a.price),
          );
          break;
        case "newest":
          result.reverse();
          break;
        case "best-selling":
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return result;
  },

  /**
   * Fetches a single product by slug.
   * @param slug product slug
   * @returns product detail
   */
  getProductBySlug: async (slug: string): Promise<Product | undefined> => {
    const { data } = await api(`/product/${toSlug(slug)}`);
    return data.data as Product | undefined;
  },

  /**
   * Fetches featured products for the homepage.
   * @returns featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data } = await api.get(`/product/?featured=ea`);
    return data.data as Product[];
  },

  /**
   * Fetches the paginated admin product list with server search/sort.
   * @param params search, sort and pagination options
   * @returns paginated products with total/page/limit
   */
  getAdminProducts: async (
    params?: AdminProductListParams,
  ): Promise<AdminProductListResponse> => {
    const { data } = await api.get("/admin/product/", {
      params: {
        category: params?.category || undefined,
        search: params?.search || undefined,
        sortBy: params?.sortBy || undefined,
        sort: params?.sort || undefined,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return {
      data: (data.data ?? []) as AdminProduct[],
      total: Number(data.total ?? (data.data ?? []).length),
      page: Number(data.page ?? params?.page ?? 1),
      limit: Number(data.limit ?? params?.limit ?? 10),
    };
  },

  /**
   * Fetches a single admin product including variants and specifications.
   * @param slug product slug
   * @returns product detail
   */
  getAdminProductBySlug: async (slug: string): Promise<AdminProduct> => {
    const { data } = await api.get(`/admin/product/${toSlug(slug)}`);
    return data.data as AdminProduct;
  },

  /**
   * Creates a product. The backend derives the creator from JWT when omitted.
   * @param payload create payload
   * @returns success envelope
   */
  createProduct: async (
    payload: CreateProductInput,
  ): Promise<ProductMutationResponse> => {
    const { data } = await api.post("/admin/product/", payload);
    return data as ProductMutationResponse;
  },

  /**
   * Updates a product by route slug.
   * @param payload update payload
   * @param slug route slug (source of truth)
   * @returns success envelope
   */
  updateProduct: async (
    payload: UpdateProductInput,
    slug: string,
  ): Promise<ProductMutationResponse> => {
    const { data } = await api.put(`/admin/product/${toSlug(slug)}`, {
      ...payload,
      slug,
    });
    return data as ProductMutationResponse;
  },

  /**
   * Deletes a product by slug.
   * @param slug product slug
   * @returns success envelope
   */
  deleteProduct: async (slug: string): Promise<ProductMutationResponse> => {
    const { data } = await api.delete(`/admin/product/${toSlug(slug)}`);
    return data as ProductMutationResponse;
  },
};
