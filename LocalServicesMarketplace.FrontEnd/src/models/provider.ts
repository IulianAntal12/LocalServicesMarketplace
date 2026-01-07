// Re-export types from providerService for convenience
export type {
  ProviderListItem,
  ProviderProfile,
  ServiceDto,
  PortfolioImageDto,
  UpdateProfileRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  SearchProvidersParams,
} from "../services/providerService";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export type PriceType = "Hourly" | "Fixed" | "Quote";

export const PRICE_TYPES: PriceType[] = ["Hourly", "Fixed", "Quote"];

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  Hourly: "Per Hour",
  Fixed: "Fixed Price",
  Quote: "Request Quote",
};
