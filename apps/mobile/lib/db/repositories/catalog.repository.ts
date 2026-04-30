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

import type { PosProduct, PosProductStockLevel } from "@/lib/types/api/catalog";
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
  const qty = requireNumber(
    row.quantityOnHand,
    "stock_levels.quantity_on_hand"
  );
  const reorderPoint = requireNumber(
    row.reorderPoint,
    "stock_levels.reorder_point"
  );

  const stockLevel: PosProductStockLevel =
    qty > reorderPoint ? "in-stock" : "low";

  const imageUrls = parseJsonArray(row.imageUrls, "products.image_urls");
  const imageUrl = getOptionalImageUri(imageUrls, "products.image_urls");

  return {
    id: row.id,
    name: row.name,
    variant: "", // base product — no variant label
    unitPricePhp: row.price,
    stockLevel,
    category: row.categoryName ?? "",
    imageUrl,
  };
}

function parseJsonArray(raw: string, fieldName: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldName} must contain a JSON array.`);
    }

    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON in ${fieldName}.`, { cause: error });
  }
}

function requireNumber(value: number | null, fieldName: string): number {
  if (value === null) {
    throw new Error(`Missing required database value: ${fieldName}.`);
  }

  return value;
}

function getOptionalImageUri(values: string[], fieldName: string): string {
  if (values.length === 0) {
    return "";
  }

  const [uri] = values;
  if (typeof uri !== "string") {
    throw new Error(`${fieldName} must contain image URI strings.`);
  }

  return uri;
}
