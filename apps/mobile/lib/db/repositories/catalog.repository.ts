/**
 * Catalog Repository
 *
 * Owns product/category definition writes (Catalog bounded context):
 *  - createCatalogProduct()
 *  - updateCatalogProduct()
 *  - archiveCatalogProduct()
 *
 * Also exposes read-model helpers used by POS:
 *  - buildPosCatalogQuery()
 *  - mapToPosProduct()
 */

import type { PosProduct, PosProductStockLevel } from "@/lib/types/api/catalog";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "../client";
import { createLocalId } from "../id";
import { categories, products, stockLevels, syncOutbox } from "../schema";

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
      storePrice: products.storePrice,
      imageUrls: products.imageUrls,
      categoryName: categories.name,
      quantityOnHand: stockLevels.quantityOnHand,
      lowStockThreshold: stockLevels.lowStockThreshold,
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
    .where(eq(products.isActive, true))
    .orderBy(desc(products.updatedAt));
}

type PosCatalogRow = Awaited<ReturnType<typeof buildPosCatalogQuery>>[number];

export function mapToPosProduct(row: PosCatalogRow): PosProduct {
  const qty = requireNumber(
    row.quantityOnHand,
    "stock_levels.quantity_on_hand"
  );
  const lowStockThreshold = requireNumber(
    row.lowStockThreshold,
    "stock_levels.low_stock_threshold"
  );

  const stockLevel: PosProductStockLevel =
    qty > lowStockThreshold ? "in-stock" : "low";

  const imageUrls = parseJsonArray(row.imageUrls, "products.image_urls");
  const imageUrl = getOptionalImageUri(imageUrls, "products.image_urls");

  return {
    id: row.id,
    name: row.name,
    variant: "", // base product — no variant label
    storePricePhp: row.storePrice,
    stockLevel,
    category: row.categoryName ?? "",
    imageUrl,
  };
}

export interface CatalogProductInput {
  name: string;
  categoryName: string;
  unit: string;
  storePrice: number;
  buyPrice: number;
  imageUrl: string | null;
}

export type CreateCatalogProductInput = CatalogProductInput;

export interface UpdateCatalogProductInput extends CatalogProductInput {
  id: string;
}

export interface ArchiveCatalogProductInput {
  id: string;
}

export interface CatalogMutationResult {
  id: string;
}

export function createCatalogProduct(
  db: Db,
  input: CreateCatalogProductInput
): CatalogMutationResult {
  const value = normalizeCatalogInput(input);
  const now = new Date();
  const productId = createLocalId();
  const operationId = createLocalId();

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
        storePrice: value.storePrice,
        buyPrice: value.buyPrice,
        imageUrls: serializeImageUrls(value.imageUrl),
        isActive: true,
        syncStatus: "pending",
        lastSyncedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    insertOutboxOperation(tx, {
      id: operationId,
      aggregateType: "product",
      aggregateId: productId,
      operation: "create",
      payload: value,
      now,
    });
  });

  return { id: productId };
}

export function updateCatalogProduct(
  db: Db,
  input: UpdateCatalogProductInput
): CatalogMutationResult {
  const value = normalizeCatalogInput(input);
  const now = new Date();
  const operationId = createLocalId();

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
        storePrice: value.storePrice,
        buyPrice: value.buyPrice,
        imageUrls: serializeImageUrls(value.imageUrl),
        syncStatus: "pending",
        lastSyncedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, input.id))
      .run();

    insertOutboxOperation(tx, {
      id: operationId,
      aggregateType: "product",
      aggregateId: input.id,
      operation: "update",
      payload: value,
      now,
    });
  });

  return { id: input.id };
}

export function archiveCatalogProduct(
  db: Db,
  input: ArchiveCatalogProductInput
): CatalogMutationResult {
  const now = new Date();
  const operationId = createLocalId();

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

    insertOutboxOperation(tx, {
      id: operationId,
      aggregateType: "product",
      aggregateId: input.id,
      operation: "archive",
      payload: { id: input.id },
      now,
    });
  });

  return { id: input.id };
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

function normalizeCatalogInput(input: CatalogProductInput) {
  const name = input.name.trim();
  const categoryName = input.categoryName.trim();
  const unit = input.unit.trim();
  const imageUrl = input.imageUrl ? input.imageUrl.trim() : null;

  assertFinitePositive(input.storePrice, "Store price");
  assertFiniteNonNegative(input.buyPrice, "Buy price");

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
    storePrice: roundMoney(input.storePrice),
    buyPrice: roundMoney(input.buyPrice),
    imageUrl,
  };
}

function serializeImageUrls(imageUrl: string | null): string {
  return JSON.stringify(imageUrl ? [imageUrl] : []);
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

function insertOutboxOperation(
  tx: RepositoryTx,
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
