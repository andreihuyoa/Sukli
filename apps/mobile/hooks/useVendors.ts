import { useStore } from "@/context/StoreContext";
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
 * Returns live-reactive supplier and price-list data scoped to the active
 * store.  Both queries update automatically when rows change.
 */
export function useVendors(): UseVendorsResult {
  const db = getDb();
  const { storeId } = useStore();

  const vendorQuery = useMemo(
    () => buildVendorsQuery(db, storeId),
    [db, storeId]
  );
  const priceListQuery = useMemo(
    () => buildPriceListQuery(db, storeId),
    [db, storeId]
  );

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
