import { Category } from "../types/category";
import { categories } from "../data/categories";
import { api } from "../lib/axios";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    // await new Promise(resolve => setTimeout(resolve, 300));
    const { data } = await api("/category/");
    return data.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return categories.find((c) => c.slug === slug);
  },

  createCategory: async (payload: Category): Promise<Response | undefined> => {
    const { data } = await api.post("/admin/category/", payload);
    return data.success;
  },

  updateCategory: async (
    payload: Category,
    id: number,
  ): Promise<Response | undefined> => {
    const { data } = await api.put(`/admin/category/${id}`, payload);
    return data.success;
  },

  deleteCategory: async (id: number): Promise<Response | undefined> => {
    const { data } = await api.delete(`/admin/category/${id}`);
    return data.success;
  },
};
