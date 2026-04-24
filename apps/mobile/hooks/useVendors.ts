import { getDb } from "@/lib/db/client";
import {
  buildPriceListQuery,
  buildVendorsQuery,
  mapToSupplier,
  mapToVendorPriceListRow,
} from "@/lib/db/repositories/vendors.repository";
import type { Supplier, VendorPriceListRow } from "@/types";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

export interface UseVendorsResult {
  suppliers: Supplier[];
  priceList: VendorPriceListRow[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Returns live-reactive supplier and price-list data. Both queries update
 * automatically when rows change.
 */
export function useVendors(): UseVendorsResult {
  const db = getDb();

  const vendorQuery = useMemo(() => buildVendorsQuery(db), [db]);
  const priceListQuery = useMemo(() => buildPriceListQuery(db), [db]);

  const { data: vendorData, error: vendorError } = useLiveQuery(vendorQuery);
  const { data: priceListData, error: priceListError } =
    useLiveQuery(priceListQuery);

  const suppliers: Supplier[] = useMemo(
    () => (vendorData ?? []).map(mapToSupplier),
    [vendorData]
  );

  const priceList: VendorPriceListRow[] = useMemo(
    () => (priceListData ?? []).map(mapToVendorPriceListRow),
    [priceListData]
  );

  const error = vendorError ?? priceListError ?? null;
  const isLoading =
    (vendorData === undefined || priceListData === undefined) && !error;

  return { suppliers, priceList, isLoading, error };
}
