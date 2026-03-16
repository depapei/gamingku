import { Category } from '../types/category';
import { categories } from '../data/categories';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return categories;
  },
  
  getCategoryBySlug: async (slug: string): Promise<Category | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return categories.find(c => c.slug === slug);
  }
};
