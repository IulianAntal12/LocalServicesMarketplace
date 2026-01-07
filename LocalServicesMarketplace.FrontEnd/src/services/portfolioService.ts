import api from "./api";

export interface PortfolioImage {
  id: number;
  imageUrl: string;
  description: string | null;
  displayOrder: number;
  uploadedAt: string;
}

export interface UploadImageResponse {
  imageId: number;
  imageUrl: string;
  fileName: string;
}

export interface PortfolioCountResponse {
  count: number;
}

export const portfolioService = {
  // Get current provider's portfolio
  getMyPortfolio: async (): Promise<PortfolioImage[]> => {
    const response = await api.get<PortfolioImage[]>("/portfolio/my");
    return response.data;
  },

  // Get any provider's portfolio (public)
  getProviderPortfolio: async (
    providerId: string
  ): Promise<PortfolioImage[]> => {
    const response = await api.get<PortfolioImage[]>(
      `/portfolio/provider/${providerId}`
    );
    return response.data;
  },

  // Get portfolio count
  getProviderPortfolioCount: async (providerId: string): Promise<number> => {
    const response = await api.get<PortfolioCountResponse>(
      `/portfolio/provider/${providerId}/count`
    );
    return response.data.count;
  },

  // Upload image
  uploadImage: async (
    file: File,
    description?: string
  ): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    const response = await api.post<UploadImageResponse>(
      "/portfolio/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete image
  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/portfolio/${imageId}`);
  },

  // Reorder image
  reorderImage: async (imageId: number, newOrder: number): Promise<void> => {
    await api.put(`/portfolio/${imageId}/reorder`, { newOrder });
  },
};
