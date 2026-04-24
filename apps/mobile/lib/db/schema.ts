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
    role: text("role", { enum: ["owner", "manager", "staff"] })
      .notNull()
      .default("staff"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

// ---------------------------------------------------------------------------
// Catalog Bounded Context
// ---------------------------------------------------------------------------

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(), // ULID
  name: text("name").notNull(),
  parentId: text("parent_id"), // self-ref — no FK to avoid circular dependency
  sortOrder: integer("sort_order").notNull().default(0),
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
    unit: text("unit").notNull().default("pc"),
    price: real("price").notNull().default(0),
    costPrice: real("cost_price").notNull().default(0),
    /** Stored as JSON array string: string[] */
    imageUrls: text("image_urls").notNull().default("[]"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
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
    attributes: text("attributes").notNull().default("{}"),
    sku: text("sku"),
    barcode: text("barcode"),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
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
    quantityOnHand: real("quantity_on_hand").notNull().default(0),
    reorderPoint: real("reorder_point").notNull().default(0),
    reorderQuantity: real("reorder_quantity").notNull().default(0),
    location: text("location"),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
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
      enum: ["purchase", "sale", "adjustment", "transfer", "waste"],
    }).notNull(),
    quantityDelta: real("quantity_delta").notNull(), // positive = in, negative = out
    referenceId: text("reference_id"), // e.g. sale order / PO ULID
    note: text("note"),
    performedBy: text("performed_by").references(() => users.id),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("stock_movements_product_idx").on(t.productId),
    index("stock_movements_created_idx").on(t.createdAt),
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
      enum: ["draft", "confirmed", "voided"],
    })
      .notNull()
      .default("draft"),
    totalAmount: real("total_amount").notNull().default(0),
    discountAmount: real("discount_amount").notNull().default(0),
    taxAmount: real("tax_amount").notNull().default(0),
    paymentMethod: text("payment_method", {
      enum: ["cash", "card", "gcash", "maya", "credit", "other"],
    }),
    cashierId: text("cashier_id").references(() => users.id),
    note: text("note"),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("sale_orders_created_idx").on(t.createdAt),
    index("sale_orders_number_idx").on(t.orderNumber),
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
    unitPrice: real("unit_price").notNull(),
    discount: real("discount").notNull().default(0),
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
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
    .notNull()
    .default("pending"),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const purchaseOrders = sqliteTable(
  "purchase_orders",
  {
    id: text("id").primaryKey(), // ULID
    vendorId: text("vendor_id").references(() => vendors.id),
    poNumber: text("po_number").notNull(),
    status: text("status", {
      enum: ["draft", "sent", "received", "cancelled"],
    })
      .notNull()
      .default("draft"),
    totalAmount: real("total_amount").notNull().default(0),
    expectedDate: integer("expected_date", { mode: "timestamp_ms" }),
    receivedDate: integer("received_date", { mode: "timestamp_ms" }),
    note: text("note"),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("purchase_orders_vendor_idx").on(t.vendorId),
    index("purchase_orders_number_idx").on(t.poNumber),
  ]
);

export const purchaseOrderItems = sqliteTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey(), // ULID
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    variantId: text("variant_id").references(() => productVariants.id),
    productName: text("product_name").notNull(), // denormalised snapshot
    quantity: real("quantity").notNull(),
    unitCost: real("unit_cost").notNull(),
    total: real("total").notNull(),
  },
  (t) => [
    index("po_items_po_idx").on(t.purchaseOrderId),
    index("po_items_product_idx").on(t.productId),
  ]
);

// ---------------------------------------------------------------------------
// Expenses (Reporting / Finance support)
// ---------------------------------------------------------------------------

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(), // ULID
    category: text("category").notNull(),
    amount: real("amount").notNull(),
    description: text("description"),
    performedBy: text("performed_by").references(() => users.id),
    syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict"] })
      .notNull()
      .default("pending"),
    lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("expenses_created_idx").on(t.createdAt)]
);
