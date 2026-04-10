import { useMemo } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getDb } from "@/db/client";
import { useStore } from "@/context/StoreContext";
import {
  buildInventoryQuery,
  mapToInventoryItem,
} from "@/db/repositories/inventory.repository";
import type { InventoryItem } from "@/types";

export interface UseInventoryResult {
  items: InventoryItem[];
  /** True while fetching from the local DB */
  isLoading: boolean;
  error: Error | null;
}

/**
 * Returns a live-reactive list of InventoryItem view models scoped to the
 * active store.  Automatically re-renders when underlying rows change.
 */
export function useInventory(): UseInventoryResult {
  const db = getDb();
  const { storeId } = useStore();

  // useLiveQuery re-runs the query whenever expo-sqlite emits a change event.
  const query = useMemo(() => buildInventoryQuery(db, storeId), [db, storeId]);
  const { data, error } = useLiveQuery(query);

  const items: InventoryItem[] = useMemo(
    () => (data ?? []).map(mapToInventoryItem),
    [data],
  );

  return {
    items,
    isLoading: data === undefined && !error,
    error: error ?? null,
  };
}
