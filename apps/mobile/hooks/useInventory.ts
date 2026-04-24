import { getDb } from "@/lib/db/client";
import {
  buildInventoryQuery,
  createInventoryProduct,
  deleteInventoryProduct,
  mapToInventoryItem,
  type InventoryProductInput,
  updateInventoryProduct,
} from "@/lib/db/repositories/inventory.repository";
import type { InventoryItem } from "@/types";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useCallback, useMemo } from "react";

export type InventoryProductFormInput = InventoryProductInput;

export interface UseInventoryResult {
  items: InventoryItem[];
  /** True while fetching from the local DB */
  isLoading: boolean;
  error: Error | null;
  createItem: (input: InventoryProductFormInput) => void;
  updateItem: (id: string, input: InventoryProductFormInput) => void;
  deleteItem: (id: string) => void;
}

/**
 * Returns a live-reactive list of InventoryItem view models backed by the
 * local SQLite database. Automatically re-renders when underlying rows change.
 */
export function useInventory(): UseInventoryResult {
  const db = getDb();

  // useLiveQuery re-runs the query whenever expo-sqlite emits a change event.
  const query = useMemo(() => buildInventoryQuery(db), [db]);
  const { data, error } = useLiveQuery(query);

  const items: InventoryItem[] = useMemo(
    () => (data ?? []).map(mapToInventoryItem),
    [data]
  );

  const createItem = useCallback(
    (input: InventoryProductFormInput) => {
      createInventoryProduct(db, input);
    },
    [db]
  );

  const updateItem = useCallback(
    (id: string, input: InventoryProductFormInput) => {
      updateInventoryProduct(db, { ...input, id });
    },
    [db]
  );

  const deleteItem = useCallback(
    (id: string) => {
      deleteInventoryProduct(db, { id });
    },
    [db]
  );

  return {
    items,
    isLoading: data === undefined && !error,
    error: error ?? null,
    createItem,
    updateItem,
    deleteItem,
  };
}
