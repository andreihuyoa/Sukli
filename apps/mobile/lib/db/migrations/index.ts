/**
 * Static migration manifest for expo-sqlite / Drizzle useMigrations().
 */

export interface DrizzleMigrations {
  journal: {
    entries: {
      idx: number;
      when: number;
      tag: string;
      breakpoints: boolean;
    }[];
  };
  migrations: Record<string, string>;
}

export const baseSchemaSql = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\`            TEXT PRIMARY KEY NOT NULL,
  \`email\`         TEXT NOT NULL UNIQUE,
  \`password_hash\` TEXT NOT NULL,
  \`role\`          TEXT NOT NULL CHECK (\`role\` IN ('owner','manager','staff')),
  \`created_at\`    INTEGER NOT NULL,
  \`updated_at\`    INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`users_email_idx\` ON \`users\` (\`email\`);

CREATE TABLE IF NOT EXISTS \`store_profiles\` (
  \`user_id\`         TEXT PRIMARY KEY NOT NULL,
  \`store_name\`      TEXT NOT NULL,
  \`icon_uri\`        TEXT,
  \`display_name\`    TEXT NOT NULL,
  \`currency\`        TEXT NOT NULL,
  \`setup_completed\` INTEGER NOT NULL,
  \`created_at\`      INTEGER NOT NULL,
  \`updated_at\`      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\`         TEXT PRIMARY KEY NOT NULL,
  \`name\`       TEXT NOT NULL,
  \`parent_id\`  TEXT,
  \`sort_order\` INTEGER NOT NULL,
  \`created_at\` INTEGER NOT NULL,
  \`updated_at\` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`category_id\`    TEXT REFERENCES \`categories\`(\`id\`),
  \`name\`           TEXT NOT NULL,
  \`description\`    TEXT,
  \`sku\`            TEXT,
  \`barcode\`        TEXT,
  \`unit\`           TEXT NOT NULL,
  \`store_price\`    REAL NOT NULL,
  \`buy_price\`      REAL NOT NULL,
  \`image_urls\`     TEXT NOT NULL,
  \`is_active\`      INTEGER NOT NULL,
  \`sync_status\`    TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`products_category_idx\` ON \`products\` (\`category_id\`);
CREATE INDEX IF NOT EXISTS \`products_sku_idx\` ON \`products\` (\`sku\`);
CREATE INDEX IF NOT EXISTS \`products_barcode_idx\` ON \`products\` (\`barcode\`);

CREATE TABLE IF NOT EXISTS \`product_variants\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`product_id\`     TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`attributes\`     TEXT NOT NULL,
  \`sku\`            TEXT,
  \`barcode\`        TEXT,
  \`sync_status\`    TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`product_variants_product_idx\` ON \`product_variants\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`stock_levels\` (
  \`id\`                  TEXT PRIMARY KEY NOT NULL,
  \`product_id\`          TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`          TEXT REFERENCES \`product_variants\`(\`id\`),
  \`quantity_on_hand\`    REAL NOT NULL,
  \`low_stock_threshold\` REAL NOT NULL,
  \`sync_status\`         TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\`      INTEGER,
  \`updated_at\`          INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`stock_levels_product_variant_idx\`
  ON \`stock_levels\` (\`product_id\`, \`variant_id\`);
CREATE INDEX IF NOT EXISTS \`stock_levels_product_idx\` ON \`stock_levels\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`stock_movements\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`product_id\`     TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`     TEXT REFERENCES \`product_variants\`(\`id\`),
  \`movement_type\`  TEXT NOT NULL CHECK (\`movement_type\` IN ('sale','restock','adjustment','void')),
  \`quantity_delta\` REAL NOT NULL,
  \`reference_id\`   TEXT,
  \`operation_id\`   TEXT NOT NULL UNIQUE,
  \`note\`           TEXT,
  \`sync_status\`    TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`stock_movements_product_idx\` ON \`stock_movements\` (\`product_id\`);
CREATE INDEX IF NOT EXISTS \`stock_movements_created_idx\` ON \`stock_movements\` (\`created_at\`);
CREATE UNIQUE INDEX IF NOT EXISTS \`stock_movements_operation_idx\` ON \`stock_movements\` (\`operation_id\`);

CREATE TABLE IF NOT EXISTS \`sale_orders\` (
  \`id\`              TEXT PRIMARY KEY NOT NULL,
  \`order_number\`    TEXT NOT NULL,
  \`status\`          TEXT NOT NULL CHECK (\`status\` IN ('draft','completed','voided')),
  \`total_amount\`    REAL NOT NULL,
  \`discount_amount\` REAL NOT NULL,
  \`payment_method\`  TEXT CHECK (\`payment_method\` IN ('cash','card','gcash','maya','credit','other')),
  \`cashier_id\`      TEXT REFERENCES \`users\`(\`id\`),
  \`operation_id\`    TEXT NOT NULL UNIQUE,
  \`note\`            TEXT,
  \`sync_status\`     TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\`  INTEGER,
  \`created_at\`      INTEGER NOT NULL,
  \`updated_at\`      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`sale_orders_created_idx\` ON \`sale_orders\` (\`created_at\`);
CREATE INDEX IF NOT EXISTS \`sale_orders_number_idx\` ON \`sale_orders\` (\`order_number\`);
CREATE UNIQUE INDEX IF NOT EXISTS \`sale_orders_operation_idx\` ON \`sale_orders\` (\`operation_id\`);

CREATE TABLE IF NOT EXISTS \`sale_order_items\` (
  \`id\`                TEXT PRIMARY KEY NOT NULL,
  \`order_id\`          TEXT NOT NULL REFERENCES \`sale_orders\`(\`id\`),
  \`product_id\`        TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`        TEXT REFERENCES \`product_variants\`(\`id\`),
  \`product_name\`      TEXT NOT NULL,
  \`sku\`               TEXT,
  \`quantity\`          REAL NOT NULL,
  \`store_price\`       REAL NOT NULL,
  \`buy_price_at_sale\` REAL NOT NULL,
  \`discount\`          REAL NOT NULL,
  \`total\`             REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS \`sale_order_items_order_idx\` ON \`sale_order_items\` (\`order_id\`);
CREATE INDEX IF NOT EXISTS \`sale_order_items_product_idx\` ON \`sale_order_items\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`vendors\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`name\`           TEXT NOT NULL,
  \`contact_name\`   TEXT,
  \`phone\`          TEXT,
  \`email\`          TEXT,
  \`address\`        TEXT,
  \`notes\`          TEXT,
  \`is_active\`      INTEGER NOT NULL,
  \`sync_status\`    TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS \`vendor_catalog_items\` (
  \`id\`                 TEXT PRIMARY KEY NOT NULL,
  \`vendor_id\`          TEXT REFERENCES \`vendors\`(\`id\`),
  \`product_name\`       TEXT NOT NULL,
  \`unit_description\`   TEXT NOT NULL,
  \`buy_price\`          REAL NOT NULL,
  \`min_order_quantity\` INTEGER,
  \`sync_status\`        TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\`     INTEGER,
  \`created_at\`         INTEGER NOT NULL,
  \`updated_at\`         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`vendor_catalog_items_vendor_idx\` ON \`vendor_catalog_items\` (\`vendor_id\`);
CREATE INDEX IF NOT EXISTS \`vendor_catalog_items_product_name_idx\` ON \`vendor_catalog_items\` (\`product_name\`);

CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`vendor_id\`      TEXT REFERENCES \`vendors\`(\`id\`),
  \`title\`          TEXT NOT NULL,
  \`category\`       TEXT NOT NULL,
  \`amount\`         REAL NOT NULL,
  \`expense_date\`   INTEGER NOT NULL,
  \`note\`           TEXT,
  \`sync_status\`    TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL,
  \`deleted_at\`     INTEGER
);
CREATE INDEX IF NOT EXISTS \`expenses_vendor_idx\` ON \`expenses\` (\`vendor_id\`);
CREATE INDEX IF NOT EXISTS \`expenses_date_idx\` ON \`expenses\` (\`expense_date\`);

CREATE TABLE IF NOT EXISTS \`sync_outbox\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`aggregate_type\` TEXT NOT NULL,
  \`aggregate_id\`   TEXT NOT NULL,
  \`operation\`      TEXT NOT NULL,
  \`payload\`        TEXT NOT NULL,
  \`status\`         TEXT NOT NULL CHECK (\`status\` IN ('pending','synced','failed')),
  \`attempt_count\`  INTEGER NOT NULL,
  \`created_at\`     INTEGER NOT NULL,
  \`synced_at\`      INTEGER,
  \`error\`          TEXT
);
CREATE INDEX IF NOT EXISTS \`sync_outbox_status_created_idx\` ON \`sync_outbox\` (\`status\`, \`created_at\`);
CREATE INDEX IF NOT EXISTS \`sync_outbox_aggregate_idx\` ON \`sync_outbox\` (\`aggregate_type\`, \`aggregate_id\`);
`.trim();

export const migrations: DrizzleMigrations = {
  journal: {
    entries: [
      {
        idx: 0,
        when: 1744300000000,
        tag: "0000_initial_schema",
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000: baseSchemaSql,
  },
};
