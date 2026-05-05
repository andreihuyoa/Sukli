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
import { createLocalId } from "../id";
import {
  categories,
  products,
  stockLevels,
  stockMovements,
  syncOutbox,
} from "../schema";

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
      storePrice: products.storePrice,
      buyPrice: products.buyPrice,
      imageUrls: products.imageUrls,
      categoryName: categories.name,
      quantityOnHand: stockLevels.quantityOnHand,
      lowStockThreshold: stockLevels.lowStockThreshold,
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
  const lowStockThreshold = requireNumber(
    row.lowStockThreshold,
    "stock_levels.low_stock_threshold"
  );

  const status: InventoryStockStatus =
    qty > lowStockThreshold ? "optimal" : "low";

  const imageUrls = parseJsonArray(row.imageUrls, "products.image_urls");
  const imageUrl = getOptionalImageUri(imageUrls, "products.image_urls");

  return {
    id: row.id,
    name: row.name,
    category: row.categoryName ?? "",
    storePrice: row.storePrice,
    buyPrice: row.buyPrice,
    lowStockThreshold,
    storePriceDisplay: formatPeso(row.storePrice),
    available: qty,
    unit: row.unit,
    status,
    imageUrl,
  };
}
export interface UpsertBaseStockLevelInput {
  productId: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  movementNoteWhenChanged: string;
}

export function upsertBaseStockLevel(
  db: Db,
  input: UpsertBaseStockLevelInput
): void {
  const now = new Date();
  const quantityOnHand = roundQuantity(input.quantityOnHand);
  const lowStockThreshold = roundQuantity(input.lowStockThreshold);
  const operationId = createLocalId();

  assertFiniteNonNegative(quantityOnHand, "Stock quantity");
  assertFiniteNonNegative(lowStockThreshold, "Low stock threshold");

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
          lowStockThreshold,
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
            operationId,
            note: input.movementNoteWhenChanged,
            syncStatus: "pending",
            lastSyncedAt: null,
            createdAt: now,
          })
          .run();

        insertOutboxOperation(tx, {
          id: operationId,
          aggregateType: "stock_movement",
          aggregateId: input.productId,
          operation: "adjust",
          payload: {
            productId: input.productId,
            quantityDelta: quantityOnHand,
            note: input.movementNoteWhenChanged,
          },
          now,
        });
      }
      return;
    }

    tx.update(stockLevels)
      .set({
        quantityOnHand,
        lowStockThreshold,
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(stockLevels.id, existingStock.id))
      .run();

    const delta = quantityOnHand - existingStock.quantityOnHand;
    if (delta !== 0) {
      const movementId = createLocalId();
      tx.insert(stockMovements)
        .values({
          id: movementId,
          productId: input.productId,
          variantId: null,
          movementType: "adjustment",
          quantityDelta: delta,
          referenceId: null,
          operationId,
          note: input.movementNoteWhenChanged,
          syncStatus: "pending",
          lastSyncedAt: null,
          createdAt: now,
        })
        .run();

      insertOutboxOperation(tx, {
        id: operationId,
        aggregateType: "stock_movement",
        aggregateId: movementId,
        operation: "adjust",
        payload: {
          productId: input.productId,
          quantityDelta: delta,
          note: input.movementNoteWhenChanged,
        },
        now,
      });
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

function insertOutboxOperation(
  tx: Parameters<Parameters<Db["transaction"]>[0]>[0],
  input: {
    id: string;
    aggregateType: string;
    aggregateId: string;
    operation: string;
    payload: unknown;
    now: Date;
  }
): void {
  tx.insert(syncOutbox)
    .values({
      id: input.id,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      operation: input.operation,
      payload: JSON.stringify(input.payload),
      status: "pending",
      attemptCount: 0,
      createdAt: input.now,
      syncedAt: null,
      error: null,
    })
    .run();
}
