-- Migration: 0000_initial_schema
-- Generated for: expo-sqlite (Drizzle Kit SQLite dialect)
-- Apply via: useMigrations() hook in _layout.tsx

-- ─── IAM ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
  `id`            TEXT PRIMARY KEY NOT NULL,
  `email`         TEXT NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `role`          TEXT NOT NULL CHECK (`role` IN ('owner','manager','staff')),
  `created_at`    INTEGER NOT NULL,
  `updated_at`    INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_idx` ON `users` (`email`);

-- ─── Catalog ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `categories` (
  `id`         TEXT PRIMARY KEY NOT NULL,
  `name`       TEXT NOT NULL,
  `parent_id`  TEXT,
  `sort_order` INTEGER NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `products` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `category_id`    TEXT REFERENCES `categories`(`id`),
  `name`           TEXT NOT NULL,
  `description`    TEXT,
  `sku`            TEXT,
  `barcode`        TEXT,
  `unit`           TEXT NOT NULL,
  `price`          REAL NOT NULL,
  `cost_price`     REAL NOT NULL,
  `image_urls`     TEXT NOT NULL,
  `is_active`      INTEGER NOT NULL,
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL,
  `updated_at`     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `products_category_idx` ON `products` (`category_id`);
CREATE INDEX IF NOT EXISTS `products_sku_idx` ON `products` (`sku`);
CREATE INDEX IF NOT EXISTS `products_barcode_idx` ON `products` (`barcode`);

CREATE TABLE IF NOT EXISTS `product_variants` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `product_id`     TEXT NOT NULL REFERENCES `products`(`id`),
  `attributes`     TEXT NOT NULL,
  `sku`            TEXT,
  `barcode`        TEXT,
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL,
  `updated_at`     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `product_variants_product_idx` ON `product_variants` (`product_id`);

-- ─── Inventory ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `stock_levels` (
  `id`               TEXT PRIMARY KEY NOT NULL,
  `product_id`       TEXT NOT NULL REFERENCES `products`(`id`),
  `variant_id`       TEXT REFERENCES `product_variants`(`id`),
  `quantity_on_hand` REAL NOT NULL,
  `reorder_point`    REAL NOT NULL,
  `reorder_quantity` REAL NOT NULL,
  `location`         TEXT,
  `sync_status`      TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at`   INTEGER,
  `updated_at`       INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `stock_levels_product_variant_idx`
  ON `stock_levels` (`product_id`, `variant_id`);
CREATE INDEX IF NOT EXISTS `stock_levels_product_idx` ON `stock_levels` (`product_id`);

CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `product_id`     TEXT NOT NULL REFERENCES `products`(`id`),
  `variant_id`     TEXT REFERENCES `product_variants`(`id`),
  `movement_type`  TEXT NOT NULL CHECK (`movement_type` IN ('purchase','sale','adjustment','transfer','waste')),
  `quantity_delta` REAL NOT NULL,
  `reference_id`   TEXT,
  `note`           TEXT,
  `performed_by`   TEXT REFERENCES `users`(`id`),
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `stock_movements_product_idx` ON `stock_movements` (`product_id`);
CREATE INDEX IF NOT EXISTS `stock_movements_created_idx` ON `stock_movements` (`created_at`);

-- ─── Sales ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `sale_orders` (
  `id`              TEXT PRIMARY KEY NOT NULL,
  `order_number`    TEXT NOT NULL,
  `status`          TEXT NOT NULL CHECK (`status` IN ('draft','confirmed','voided')),
  `total_amount`    REAL NOT NULL,
  `discount_amount` REAL NOT NULL,
  `tax_amount`      REAL NOT NULL,
  `payment_method`  TEXT CHECK (`payment_method` IN ('cash','card','gcash','maya','credit','other')),
  `cashier_id`      TEXT REFERENCES `users`(`id`),
  `note`            TEXT,
  `sync_status`     TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at`  INTEGER,
  `created_at`      INTEGER NOT NULL,
  `updated_at`      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `sale_orders_created_idx` ON `sale_orders` (`created_at`);
CREATE INDEX IF NOT EXISTS `sale_orders_number_idx`
  ON `sale_orders` (`order_number`);

CREATE TABLE IF NOT EXISTS `sale_order_items` (
  `id`           TEXT PRIMARY KEY NOT NULL,
  `order_id`     TEXT NOT NULL REFERENCES `sale_orders`(`id`),
  `product_id`   TEXT NOT NULL REFERENCES `products`(`id`),
  `variant_id`   TEXT REFERENCES `product_variants`(`id`),
  `product_name` TEXT NOT NULL,
  `sku`          TEXT,
  `quantity`     REAL NOT NULL,
  `unit_price`   REAL NOT NULL,
  `discount`     REAL NOT NULL,
  `total`        REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS `sale_order_items_order_idx` ON `sale_order_items` (`order_id`);
CREATE INDEX IF NOT EXISTS `sale_order_items_product_idx` ON `sale_order_items` (`product_id`);

-- ─── Procurement ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `vendors` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `name`           TEXT NOT NULL,
  `contact_name`   TEXT,
  `phone`          TEXT,
  `email`          TEXT,
  `address`        TEXT,
  `notes`          TEXT,
  `is_active`      INTEGER NOT NULL,
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL,
  `updated_at`     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `vendor_id`      TEXT REFERENCES `vendors`(`id`),
  `po_number`      TEXT NOT NULL,
  `status`         TEXT NOT NULL CHECK (`status` IN ('draft','sent','received','cancelled')),
  `total_amount`   REAL NOT NULL,
  `expected_date`  INTEGER,
  `received_date`  INTEGER,
  `note`           TEXT,
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL,
  `updated_at`     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `purchase_orders_vendor_idx` ON `purchase_orders` (`vendor_id`);
CREATE INDEX IF NOT EXISTS `purchase_orders_number_idx`
  ON `purchase_orders` (`po_number`);

CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id`                TEXT PRIMARY KEY NOT NULL,
  `purchase_order_id` TEXT NOT NULL REFERENCES `purchase_orders`(`id`),
  `product_id`        TEXT NOT NULL REFERENCES `products`(`id`),
  `variant_id`        TEXT REFERENCES `product_variants`(`id`),
  `product_name`      TEXT NOT NULL,
  `quantity`          REAL NOT NULL,
  `unit_cost`         REAL NOT NULL,
  `total`             REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS `po_items_po_idx` ON `purchase_order_items` (`purchase_order_id`);
CREATE INDEX IF NOT EXISTS `po_items_product_idx` ON `purchase_order_items` (`product_id`);

-- ─── Expenses ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `expenses` (
  `id`             TEXT PRIMARY KEY NOT NULL,
  `category`       TEXT NOT NULL,
  `amount`         REAL NOT NULL,
  `description`    TEXT,
  `performed_by`   TEXT REFERENCES `users`(`id`),
  `sync_status`    TEXT NOT NULL CHECK (`sync_status` IN ('synced','pending','conflict')),
  `last_synced_at` INTEGER,
  `created_at`     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `expenses_created_idx` ON `expenses` (`created_at`);
