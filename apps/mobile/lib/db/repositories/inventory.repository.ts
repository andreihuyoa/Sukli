/**
 * Inventory Repository
 *
 * Owns stock-level and stock-movement writes (Inventory bounded context):
 *  - upsertBaseStockLevel()
 *
 * Product/category definition writes belong to Catalog repository.
 */

import type {
  InventoryItem,
  InventoryStockStatus,
} from "@/lib/types/api/inventory";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";
import { categories, products, stockLevels, stockMovements } from "../schema";

/**
 * Returns active products with their base stock level for the inventory list.
 * One row per product (base stock only — no variant rows).
 */
export function buildInventoryQuery(db: Db) {
  return db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      price: products.price,
      costPrice: products.costPrice,
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
    .where(eq(products.isActive, true))
    .orderBy(desc(products.updatedAt));
}

type InventoryRow = Awaited<ReturnType<typeof buildInventoryQuery>>[number];

export function mapToInventoryItem(row: InventoryRow): InventoryItem {
  const qty = requireNumber(
    row.quantityOnHand,
    "stock_levels.quantity_on_hand"
  );
  const reorderPoint = requireNumber(
    row.reorderPoint,
    "stock_levels.reorder_point"
  );

  const status: InventoryStockStatus = qty > reorderPoint ? "optimal" : "low";

  const imageUrls = parseJsonArray(row.imageUrls, "products.image_urls");
  const imageUrl = getOptionalImageUri(imageUrls, "products.image_urls");

  return {
    id: row.id,
    name: row.name,
    category: row.categoryName ?? "",
    price: row.price,
    costPrice: row.costPrice,
    reorderPoint,
    priceDisplay: formatPeso(row.price),
    available: qty,
    unit: row.unit,
    status,
    imageUrl,
  };
}
export interface UpsertBaseStockLevelInput {
  productId: string;
  quantityOnHand: number;
  reorderPoint: number;
  movementNoteWhenChanged: string;
}

export function upsertBaseStockLevel(
  db: Db,
  input: UpsertBaseStockLevelInput
): void {
  const now = new Date();
  const quantityOnHand = roundQuantity(input.quantityOnHand);
  const reorderPoint = roundQuantity(input.reorderPoint);

  assertFiniteNonNegative(quantityOnHand, "Stock quantity");
  assertFiniteNonNegative(reorderPoint, "Low stock threshold");

  db.transaction((tx) => {
    const existingStock = tx
      .select({
        id: stockLevels.id,
        quantityOnHand: stockLevels.quantityOnHand,
      })
      .from(stockLevels)
      .where(
        and(
          eq(stockLevels.productId, input.productId),
          isNull(stockLevels.variantId)
        )
      )
      .get();

    if (!existingStock) {
      tx.insert(stockLevels)
        .values({
          id: createLocalId(),
          productId: input.productId,
          variantId: null,
          quantityOnHand,
          reorderPoint,
          reorderQuantity: 0,
          location: null,
          syncStatus: "pending",
          lastSyncedAt: null,
          updatedAt: now,
        })
        .run();

      if (quantityOnHand !== 0) {
        tx.insert(stockMovements)
          .values({
            id: createLocalId(),
            productId: input.productId,
            variantId: null,
            movementType: "adjustment",
            quantityDelta: quantityOnHand,
            referenceId: null,
            note: input.movementNoteWhenChanged,
            performedBy: null,
            syncStatus: "pending",
            lastSyncedAt: null,
            createdAt: now,
          })
          .run();
      }
      return;
    }

    tx.update(stockLevels)
      .set({
        quantityOnHand,
        reorderPoint,
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(stockLevels.id, existingStock.id))
      .run();

    const delta = quantityOnHand - existingStock.quantityOnHand;
    if (delta !== 0) {
      tx.insert(stockMovements)
        .values({
          id: createLocalId(),
          productId: input.productId,
          variantId: null,
          movementType: "adjustment",
          quantityDelta: delta,
          referenceId: null,
          note: input.movementNoteWhenChanged,
          performedBy: null,
          syncStatus: "pending",
          lastSyncedAt: null,
          createdAt: now,
        })
        .run();
    }
  });
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} cannot be negative.`);
  }
}

function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function createLocalId(): string {
  let timestamp = Date.now();
  let id = "";

  for (let index = 0; index < 10; index += 1) {
    id = ULID_ALPHABET[timestamp % 32] + id;
    timestamp = Math.floor(timestamp / 32);
  }

  for (let index = 0; index < 16; index += 1) {
    id += ULID_ALPHABET[Math.floor(Math.random() * ULID_ALPHABET.length)];
  }

  return id;
}
