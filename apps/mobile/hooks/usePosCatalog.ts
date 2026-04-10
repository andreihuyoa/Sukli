import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getDb } from "@/db/client";
import { useStore } from "@/context/StoreContext";
import {
  buildPosCatalogQuery,
  mapToPosProduct,
} from "@/db/repositories/catalog.repository";
import type { PosProduct } from "@/types";

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
    [data],
  );

  return {
    products,
    isLoading: data === undefined && !error,
    error: error ?? null,
  };
}
