import { getDb } from "@/lib/db/client";
import {
  archiveCatalogProduct,
  createCatalogProduct,
  updateCatalogProduct,
  type CatalogProductInput,
} from "@/lib/db/repositories/catalog.repository";
import {
  buildInventoryQuery,
  mapToInventoryItem,
  upsertBaseStockLevel,
} from "@/lib/db/repositories/inventory.repository";
import type { InventoryItem } from "@/lib/types/api/inventory";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useCallback, useMemo } from "react";

export type InventoryProductFormInput = CatalogProductInput & {
  quantityOnHand: number;
  lowStockThreshold: number;
};

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
      const { quantityOnHand, lowStockThreshold, ...catalogInput } = input;
      const { id } = createCatalogProduct(db, catalogInput);
      upsertBaseStockLevel(db, {
        productId: id,
        quantityOnHand,
        lowStockThreshold,
        movementNoteWhenChanged: "Initial stock count",
      });
    },
    [db]
  );

  const updateItem = useCallback(
    (id: string, input: InventoryProductFormInput) => {
      const { quantityOnHand, lowStockThreshold, ...catalogInput } = input;
      updateCatalogProduct(db, { ...catalogInput, id });
      upsertBaseStockLevel(db, {
        productId: id,
        quantityOnHand,
        lowStockThreshold,
        movementNoteWhenChanged: "Inventory count updated",
      });
    },
    [db]
  );

  const deleteItem = useCallback(
    (id: string) => {
      archiveCatalogProduct(db, { id });
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
