import type { PosProduct } from "@/types";

export interface UsePosCatalogResult {
  products: PosProduct[];
  isLoading: boolean;
  error: Error | null;
}

export function usePosCatalog(): UsePosCatalogResult {
  return { products: [], isLoading: false, error: null };
}
