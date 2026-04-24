/**
 * Inventory Repository
 *
 * Exposes:
 *  - buildInventoryQuery()  — Drizzle query builder for useLiveQuery
 *  - mapToInventoryItem()   — maps a joined row to the InventoryItem view model
 */

import type { InventoryItem, InventoryStockStatus } from "@/types";
import { categories, products, stockLevels, stockMovements } from "../schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";

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

export interface InventoryProductInput {
  name: string;
  categoryName: string;
  unit: string;
  price: number;
  costPrice: number;
  quantityOnHand: number;
  reorderPoint: number;
  imageUrl: string | null;
}

export type CreateInventoryProductInput = InventoryProductInput;

export interface UpdateInventoryProductInput extends InventoryProductInput {
  id: string;
}

export interface DeleteInventoryProductInput {
  id: string;
}

export interface InventoryMutationResult {
  id: string;
}

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

export function createInventoryProduct(
  db: Db,
  input: CreateInventoryProductInput
): InventoryMutationResult {
  const value = normalizeProductInput(input);
  const now = new Date();
  const productId = createLocalId();

  db.transaction((tx) => {
    const categoryId = value.categoryName
      ? getOrCreateCategoryId(tx, value.categoryName, now)
      : null;

    tx.insert(products)
      .values({
        id: productId,
        categoryId,
        name: value.name,
        description: null,
        sku: null,
        barcode: null,
        unit: value.unit,
        price: value.price,
        costPrice: value.costPrice,
        imageUrls: serializeImageUrls(value.imageUrl),
        isActive: true,
        syncStatus: "pending",
        lastSyncedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    tx.insert(stockLevels)
      .values({
        id: createLocalId(),
        productId,
        variantId: null,
        quantityOnHand: value.quantityOnHand,
        reorderPoint: value.reorderPoint,
        reorderQuantity: 0,
        location: null,
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .run();

    if (value.quantityOnHand !== 0) {
      tx.insert(stockMovements)
        .values({
          id: createLocalId(),
          productId,
          variantId: null,
          movementType: "adjustment",
          quantityDelta: value.quantityOnHand,
          referenceId: null,
          note: "Initial stock count",
          performedBy: null,
          syncStatus: "pending",
          lastSyncedAt: null,
          createdAt: now,
        })
        .run();
    }
  });

  return { id: productId };
}

export function updateInventoryProduct(
  db: Db,
  input: UpdateInventoryProductInput
): InventoryMutationResult {
  const value = normalizeProductInput(input);
  const now = new Date();

  db.transaction((tx) => {
    const existing = tx
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, input.id), eq(products.isActive, true)))
      .get();

    if (!existing) {
      throw new Error("Product not found.");
    }

    const categoryId = value.categoryName
      ? getOrCreateCategoryId(tx, value.categoryName, now)
      : null;

    tx.update(products)
      .set({
        categoryId,
        name: value.name,
        unit: value.unit,
        price: value.price,
        costPrice: value.costPrice,
        imageUrls: serializeImageUrls(value.imageUrl),
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, input.id))
      .run();

    const existingStock = tx
      .select({
        id: stockLevels.id,
        quantityOnHand: stockLevels.quantityOnHand,
      })
      .from(stockLevels)
      .where(
        and(eq(stockLevels.productId, input.id), isNull(stockLevels.variantId))
      )
      .get();

    if (!existingStock) {
      throw new Error("Base stock level not found.");
    }

    tx.update(stockLevels)
      .set({
        quantityOnHand: value.quantityOnHand,
        reorderPoint: value.reorderPoint,
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(stockLevels.id, existingStock.id))
      .run();

    const delta = value.quantityOnHand - existingStock.quantityOnHand;
    if (delta !== 0) {
      tx.insert(stockMovements)
        .values({
          id: createLocalId(),
          productId: input.id,
          variantId: null,
          movementType: "adjustment",
          quantityDelta: delta,
          referenceId: null,
          note: "Inventory count updated",
          performedBy: null,
          syncStatus: "pending",
          lastSyncedAt: null,
          createdAt: now,
        })
        .run();
    }
  });

  return { id: input.id };
}

export function deleteInventoryProduct(
  db: Db,
  input: DeleteInventoryProductInput
): InventoryMutationResult {
  const now = new Date();

  db.transaction((tx) => {
    const existing = tx
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, input.id), eq(products.isActive, true)))
      .get();

    if (!existing) {
      throw new Error("Product not found.");
    }

    tx.update(products)
      .set({
        isActive: false,
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, input.id))
      .run();
  });

  return { id: input.id };
}

type RepositoryTx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function getOrCreateCategoryId(
  tx: RepositoryTx,
  name: string,
  now: Date
): string {
  const existing = tx
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, name))
    .get();

  if (existing) return existing.id;

  const id = createLocalId();
  tx.insert(categories)
    .values({
      id,
      name,
      parentId: null,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return id;
}

function normalizeProductInput(input: InventoryProductInput) {
  const name = input.name.trim();
  const categoryName = input.categoryName.trim();
  const unit = input.unit.trim();
  const imageUrl = input.imageUrl ? input.imageUrl.trim() : null;

  assertFinitePositive(input.price, "Price");
  assertFiniteNonNegative(input.costPrice, "Cost price");
  assertFiniteNonNegative(input.quantityOnHand, "Stock quantity");
  assertFiniteNonNegative(input.reorderPoint, "Low stock threshold");

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!unit) {
    throw new Error("Product unit is required.");
  }

  return {
    name,
    categoryName,
    unit,
    price: roundMoney(input.price),
    costPrice: roundMoney(input.costPrice),
    quantityOnHand: roundQuantity(input.quantityOnHand),
    reorderPoint: roundQuantity(input.reorderPoint),
    imageUrl,
  };
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} cannot be negative.`);
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function serializeImageUrls(imageUrl: string | null): string {
  return JSON.stringify(imageUrl ? [imageUrl] : []);
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
