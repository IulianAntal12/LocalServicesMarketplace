export { default as api } from "./api";
export { authService } from "./authService";
export { providerService } from "./providerService";
export { categoryService } from "./categoryService";
export { portfolioService } from "./portfolioService";

// Re-export types
export type { Category } from "./categoryService";
export type { PortfolioImage, UploadImageResponse } from "./portfolioService";
