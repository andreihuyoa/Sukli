/**
 * Inventory Repository
 *
 * Exposes:
 *  - buildInventoryQuery()  — Drizzle query builder for useLiveQuery
 *  - mapToInventoryItem()   — maps a joined row to the InventoryItem view model
 */

import type { InventoryItem, InventoryStockStatus } from "@/types";
import { categories, products, stockLevels } from "../schema";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";

/**
 * Returns active products with their base stock level for the inventory list.
 * One row per product (base stock only — no variant rows).
 */
export function buildInventoryQuery(db: Db, storeId: string) {
  return db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      imageUrls: products.imageUrls,
      categoryName: categories.name,
      quantityOnHand: stockLevels.quantityOnHand,
      reorderPoint: stockLevels.reorderPoint,
    })
    .from(products)
    .leftJoin(
      stockLevels,
      and(eq(stockLevels.productId, products.id), isNull(stockLevels.variantId))
    )
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)));
}

type InventoryRow = Awaited<ReturnType<typeof buildInventoryQuery>>[number];

export function mapToInventoryItem(row: InventoryRow): InventoryItem {
  const qty = row.quantityOnHand ?? 0;
  const reorderPoint = row.reorderPoint ?? 0;

  const status: InventoryStockStatus = qty > reorderPoint ? "optimal" : "low";

  const imageUrls = safeParseJsonArray(row.imageUrls);

  return {
    id: row.id,
    name: row.name,
    category: row.categoryName ?? "Uncategorised",
    priceDisplay: "—", // TODO: link product price table
    available: qty,
    unit: row.unit,
    status,
    imageUrl: imageUrls[0] ?? "",
  };
}

function safeParseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
