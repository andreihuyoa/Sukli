/**
 * Catalog Repository
 *
 * Exposes:
 *  - buildPosCatalogQuery()  — returns a Drizzle query builder for useLiveQuery
 *  - mapToPosProduct()       — maps a joined row to the PosProduct view model
 *
 * Design note: we separate query builders from data-mapping so hooks can pass
 * the builder directly to useLiveQuery without wrapping it in a closure.
 */

import type { PosProduct, PosProductStockLevel } from "@/types";
import { categories, products, stockLevels } from "../schema";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";

/**
 * Returns a live query that fetches active products with their base-variant
 * stock level and category name for the POS grid.
 *
 * Joins:
 *  products → stockLevels (LEFT, no variant — base stock)
 *  products → categories  (LEFT)
 *
 * Filtered to active products only.
 */
export function buildPosCatalogQuery(db: Db) {
  return db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      price: products.price,
      imageUrls: products.imageUrls,
      categoryName: categories.name,
      quantityOnHand: stockLevels.quantityOnHand,
      reorderPoint: stockLevels.reorderPoint,
    })
    .from(products)
    .leftJoin(
      stockLevels,
      and(
        eq(stockLevels.productId, products.id),
        isNull(stockLevels.variantId) // base stock only
      )
    )
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.isActive, true));
}

type PosCatalogRow = Awaited<ReturnType<typeof buildPosCatalogQuery>>[number];

export function mapToPosProduct(row: PosCatalogRow): PosProduct {
  const qty = row.quantityOnHand ?? 0;
  const reorderPoint = row.reorderPoint ?? 0;

  const stockLevel: PosProductStockLevel =
    qty > reorderPoint ? "in-stock" : "low";

  const imageUrls = safeParseJsonArray(row.imageUrls);

  return {
    id: row.id,
    name: row.name,
    variant: "", // base product — no variant label
    unitPricePhp: row.price,
    stockLevel,
    category: row.categoryName ?? "Uncategorised",
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
