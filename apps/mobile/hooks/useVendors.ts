import type { Supplier, VendorPriceListRow } from "@/types";

export interface UseVendorsResult {
  suppliers: Supplier[];
  priceList: VendorPriceListRow[];
  isLoading: boolean;
  error: Error | null;
}

export function useVendors(): UseVendorsResult {
  return { suppliers: [], priceList: [], isLoading: false, error: null };
}
