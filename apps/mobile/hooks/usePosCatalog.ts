import { useStore } from "@/context/StoreContext";
import { getDb } from "@/lib/db/client";
import {
  buildPosCatalogQuery,
  mapToPosProduct,
} from "@/lib/db/repositories/catalog.repository";
import type { PosProduct } from "@/types";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

export interface UsePosCatalogResult {
  products: PosProduct[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Returns a live-reactive list of PosProduct view models for the POS grid,
 * scoped to the active store.
 */
export function usePosCatalog(): UsePosCatalogResult {
  const db = getDb();
  const { storeId } = useStore();

  const query = useMemo(() => buildPosCatalogQuery(db, storeId), [db, storeId]);
  const { data, error } = useLiveQuery(query);

  const products: PosProduct[] = useMemo(
    () => (data ?? []).map(mapToPosProduct),
    [data]
  );

  return {
    products,
    isLoading: data === undefined && !error,
    error: error ?? null,
  };
}
