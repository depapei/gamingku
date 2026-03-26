import { useMutation, useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import { Category } from "../types/category";
import { queryClient } from "../lib/queryClient";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 0,
  });
};

export const createCategory = () => {
  return useMutation({
    mutationFn: async (payload: Category) =>
      categoryService.createCategory(payload),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      console.log("POST", res);
      return res;
    },
  });
};

export const updateCategory = () => {
  return useMutation({
    mutationFn: async (payload: Category) => {
      await categoryService.updateCategory(payload, payload.id);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      console.log("PUT", res);
      return res;
    },
  });
};

export const deleteCategory = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      await categoryService.deleteCategory(id);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      console.log("DELETE", res);
      return res;
    },
  });
};
