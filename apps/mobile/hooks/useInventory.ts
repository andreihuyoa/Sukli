import type { InventoryItem } from "@/types";

export interface UseInventoryResult {
  items: InventoryItem[];
  /** True while fetching from API / local DB */
  isLoading: boolean;
  error: Error | null;
}

/**
 * Inventory list for the stock screen. Replace the body with React Query / sync
 * when the backend is available.
 */
export function useInventory(): UseInventoryResult {
  return { items: [], isLoading: false, error: null };
}
