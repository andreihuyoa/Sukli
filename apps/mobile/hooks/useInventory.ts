import { useStore } from "@/context/StoreContext";
import { getDb } from "@/lib/db/client";
import {
  buildInventoryQuery,
  mapToInventoryItem,
} from "@/lib/db/repositories/inventory.repository";
import type { InventoryItem } from "@/types";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

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
    [data]
  );

  return {
    items,
    isLoading: data === undefined && !error,
    error: error ?? null,
  };
}
