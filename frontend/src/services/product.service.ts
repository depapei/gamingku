import { Product } from "../types/product";
import { products } from "../data/products";
import { categories } from "../data/categories";
import { api } from "../lib/axios";
import { promises } from "dns";

// Mock service simulating API calls
export const productService = {
  getProducts: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<Product[]> => {
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    // let param;
    // if (params) {
    //   if (params.search.length > 0) {
    //     param = `?search=${params.search}`;
    //   } else {
    //     param = `?`;
    //   }
    //   if (params.sort) {
    //     switch (params.sort) {
    //       case "price-asc":
    //         param = param + `&sortBy=price&sort=asc`;
    //         break;
    //       case "price-desc":
    //         param = param + `&sortBy=price&sort=desc`;
    //         break;
    //       case "newest":
    //         param = param + `&sortBy=created_at&sort=asc`;
    //         break;
    //       case "best-selling":
    //         param = param + `&sortBy=reviewCount&sort=asc`;
    //         break;
    //     }
    //   }
    // }

    const { data } = await api.get(`/product/`);
    let result = [...data.data];

    if (params?.category) {
      // Find the category and its subcategories
      const targetCategory = categories.find(
        (c) => c.id === params.category || c.slug === params.category,
      );
      if (targetCategory) {
        const subCategoryIds = categories
          .filter((c) => c.parentId === targetCategory.id)
          .map((c) => c.id);

        const validCategoryIds = [targetCategory.id, ...subCategoryIds];
        result = result.filter((p) => validCategoryIds.includes(p.categoryId));
      } else {
        result = result.filter((p) => p.categoryId === params.category);
      }
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
          // Mock sorting by newest (assuming id represents order for now)
          result.reverse();
          break;
        case "best-selling":
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return result;
  },

  getProductBySlug: async (slug: string): Promise<Product | undefined> => {
    // await new Promise((resolve) => setTimeout(resolve, 300));
    const { data } = await api(`/product/${slug}`);
    return data.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { data } = await api.get(`/product/?featured=ea`);
    return data.data;
  },
};
