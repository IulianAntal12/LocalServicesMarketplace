import api from "./api";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },
};
