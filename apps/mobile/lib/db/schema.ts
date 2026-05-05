/**
 * Drizzle Schema (SQLite / expo-sqlite dialect)
 *
 * Single source of truth for all table definitions used by the mobile app.
 * Types are mapped to SQLite storage:
 *  - ULID PKs          -> text
 *  - TIMESTAMPTZ       -> integer (mode: "timestamp_ms") — Unix epoch ms
 *  - NUMERIC / DECIMAL -> real
 *  - ENUMs             -> text (validated at the application layer)
 *  - JSONB arrays      -> text (JSON.stringify / JSON.parse at repo layer)
 */

import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// IAM Bounded Context
// ---------------------------------------------------------------------------

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // ULID
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["owner", "manager", "staff"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const storeProfiles = sqliteTable("store_profiles", {
  userId: text("user_id").primaryKey(),
  storeName: text("store_name").notNull(),
  iconUri: text("icon_uri"),
  displayName: text("display_name").notNull(),
  currency: text("currency").notNull(),
  taxRate: real("tax_rate").notNull(),
  setupCompleted: integer("setup_completed", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------------------------------------------------------------------------
// Catalog Bounded Context
// ---------------------------------------------------------------------------

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(), // ULID
  name: text("name").notNull(),
  parentId: text("parent_id"), // self-ref — no FK to avoid circular dependency
  sortOrder: integer("sort_order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(), // ULID
    categoryId: text("category_id").references(() => categories.id),
    name: text("name").notNull(),
    description: text("description"),
    sku: text("sku"),
    barcode: text("barcode"),
    unit: text("unit").notNull(),
    storePrice: real("store_price").notNull(),
    buyPrice: real("buy_price").notNull(),
    /** Stored as JSON array string: string[] */
    imageUrls: text("image_urls").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_sku_idx").on(t.sku),
    index("products_barcode_idx").on(t.barcode),
  ]
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(), // ULID
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    /** Stored as JSON object string: Record<string, string> e.g. {"Size":"L","Color":"Red"} */
    attributes: text("attributes").notNull(),
    sku: text("sku"),
    barcode: text("barcode"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)]
);

// ---------------------------------------------------------------------------
// Inventory Bounded Context
// ---------------------------------------------------------------------------

export const stockLevels = sqliteTable(
  "stock_levels",
  {
    id: text("id").primaryKey(), // ULID
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    variantId: text("variant_id").references(() => productVariants.id),
    quantityOnHand: real("quantity_on_hand").notNull(),
    lowStockThreshold: real("low_stock_threshold").notNull(),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    uniqueIndex("stock_levels_product_variant_idx").on(
      t.productId,
      t.variantId
    ),
    index("stock_levels_product_idx").on(t.productId),
  ]
);

export const stockMovements = sqliteTable(
  "stock_movements",
  {
    id: text("id").primaryKey(), // ULID
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    variantId: text("variant_id").references(() => productVariants.id),
    movementType: text("movement_type", {
      enum: ["sale", "restock", "adjustment", "void"],
    }).notNull(),
    quantityDelta: real("quantity_delta").notNull(), // positive = in, negative = out
    referenceId: text("reference_id"), // e.g. sale order / PO ULID
    operationId: text("operation_id").notNull().unique(),
    note: text("note"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("stock_movements_product_idx").on(t.productId),
    index("stock_movements_created_idx").on(t.createdAt),
    uniqueIndex("stock_movements_operation_idx").on(t.operationId),
  ]
);

// ---------------------------------------------------------------------------
// Sales Bounded Context
// ---------------------------------------------------------------------------

export const saleOrders = sqliteTable(
  "sale_orders",
  {
    id: text("id").primaryKey(), // ULID
    orderNumber: text("order_number").notNull(),
    status: text("status", {
      enum: ["draft", "completed", "voided"],
    }).notNull(),
    totalAmount: real("total_amount").notNull(),
    discountAmount: real("discount_amount").notNull(),
    taxAmount: real("tax_amount").notNull(),
    paymentMethod: text("payment_method", {
      enum: ["cash", "card", "gcash", "maya", "credit", "other"],
    }),
    cashierId: text("cashier_id").references(() => users.id),
    operationId: text("operation_id").notNull().unique(),
    note: text("note"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("sale_orders_created_idx").on(t.createdAt),
    index("sale_orders_number_idx").on(t.orderNumber),
    uniqueIndex("sale_orders_operation_idx").on(t.operationId),
  ]
);

export const saleOrderItems = sqliteTable(
  "sale_order_items",
  {
    id: text("id").primaryKey(), // ULID
    orderId: text("order_id")
      .notNull()
      .references(() => saleOrders.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    variantId: text("variant_id").references(() => productVariants.id),
    productName: text("product_name").notNull(), // denormalised snapshot
    sku: text("sku"),
    quantity: real("quantity").notNull(),
    storePrice: real("store_price").notNull(),
    buyPriceAtSale: real("buy_price_at_sale").notNull(),
    discount: real("discount").notNull(),
    total: real("total").notNull(),
  },
  (t) => [
    index("sale_order_items_order_idx").on(t.orderId),
    index("sale_order_items_product_idx").on(t.productId),
  ]
);

// ---------------------------------------------------------------------------
// Procurement Bounded Context
// ---------------------------------------------------------------------------

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey(), // ULID
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  syncStatus: text("sync_status", {
    enum: ["synced", "pending", "conflict"],
  }).notNull(),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const vendorCatalogItems = sqliteTable(
  "vendor_catalog_items",
  {
    id: text("id").primaryKey(), // ULID
    vendorId: text("vendor_id").references(() => vendors.id),
    productName: text("product_name").notNull(),
    unitDescription: text("unit_description").notNull(),
    buyPrice: real("buy_price").notNull(),
    minOrderQuantity: integer("min_order_quantity"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("vendor_catalog_items_vendor_idx").on(t.vendorId),
    index("vendor_catalog_items_product_name_idx").on(t.productName),
  ]
);

// ---------------------------------------------------------------------------
// Finance Bounded Context
// ---------------------------------------------------------------------------

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(), // ULID
    vendorId: text("vendor_id").references(() => vendors.id),
    title: text("title").notNull(),
    category: text("category").notNull(),
    amount: real("amount").notNull(),
    expenseDate: integer("expense_date", { mode: "timestamp_ms" }).notNull(),
    note: text("note"),
    syncStatus: text("sync_status", {
      enum: ["synced", "pending", "conflict"],
    }).notNull(),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("expenses_vendor_idx").on(t.vendorId),
    index("expenses_date_idx").on(t.expenseDate),
  ]
);

// ---------------------------------------------------------------------------
// Sync Layer
// ---------------------------------------------------------------------------

export const syncOutbox = sqliteTable(
  "sync_outbox",
  {
    id: text("id").primaryKey(), // ULID / operation id
    aggregateType: text("aggregate_type").notNull(),
    aggregateId: text("aggregate_id").notNull(),
    operation: text("operation").notNull(),
    payload: text("payload").notNull(),
    status: text("status", {
      enum: ["pending", "synced", "failed"],
    }).notNull(),
    attemptCount: integer("attempt_count").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
    error: text("error"),
  },
  (t) => [
    index("sync_outbox_status_created_idx").on(t.status, t.createdAt),
    index("sync_outbox_aggregate_idx").on(t.aggregateType, t.aggregateId),
  ]
);
