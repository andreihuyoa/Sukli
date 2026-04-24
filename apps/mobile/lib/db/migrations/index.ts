/**
 * Static migration manifest for expo-sqlite / Drizzle useMigrations().
 *
 * When adding a new migration:
 *   1. Write the SQL in a new .sql file in this directory (for reference).
 *   2. Add a new const below with the SQL as a template literal.
 *   3. Append a new journal entry with the next idx.
 *   4. Add the SQL to the migrations record keyed as m0001, m0002, etc.
 */

/**
 * Shape expected by drizzle-orm/expo-sqlite's useMigrations().
 *
 * IMPORTANT: The `migrations` record is keyed by `m${idx.padStart(4,'0')}`,
 * i.e. "m0000", "m0001" … — NOT by the tag name.
 * See: drizzle-orm/expo-sqlite/migrator.js:
 *   `migrations[\`m${journalEntry.idx.toString().padStart(4,"0")}\`]`
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

// ─── 0000: Initial schema ─────────────────────────────────────────────────────

const sql0000 = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\`            TEXT PRIMARY KEY NOT NULL,
  \`email\`         TEXT NOT NULL UNIQUE,
  \`password_hash\` TEXT NOT NULL,
  \`role\`          TEXT NOT NULL DEFAULT 'staff' CHECK (\`role\` IN ('owner','manager','staff')),
  \`created_at\`    INTEGER NOT NULL,
  \`updated_at\`    INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`users_email_idx\` ON \`users\` (\`email\`);

CREATE TABLE IF NOT EXISTS \`stores\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`name\`           TEXT NOT NULL,
  \`address\`        TEXT,
  \`currency\`       TEXT NOT NULL DEFAULT 'PHP',
  \`owner_id\`       TEXT NOT NULL REFERENCES \`users\`(\`id\`),
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`stores_owner_idx\` ON \`stores\` (\`owner_id\`);

CREATE TABLE IF NOT EXISTS \`store_members\` (
  \`id\`        TEXT PRIMARY KEY NOT NULL,
  \`store_id\`  TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`user_id\`   TEXT NOT NULL REFERENCES \`users\`(\`id\`),
  \`role\`      TEXT NOT NULL DEFAULT 'staff' CHECK (\`role\` IN ('manager','staff')),
  \`joined_at\` INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`store_members_store_user_idx\` ON \`store_members\` (\`store_id\`, \`user_id\`);

CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\`         TEXT PRIMARY KEY NOT NULL,
  \`store_id\`   TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`name\`       TEXT NOT NULL,
  \`parent_id\`  TEXT,
  \`sort_order\` INTEGER NOT NULL DEFAULT 0,
  \`created_at\` INTEGER NOT NULL,
  \`updated_at\` INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`categories_store_idx\` ON \`categories\` (\`store_id\`);

CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`store_id\`       TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`category_id\`    TEXT REFERENCES \`categories\`(\`id\`),
  \`name\`           TEXT NOT NULL,
  \`description\`    TEXT,
  \`sku\`            TEXT,
  \`barcode\`        TEXT,
  \`unit\`           TEXT NOT NULL DEFAULT 'pc',
  \`image_urls\`     TEXT NOT NULL DEFAULT '[]',
  \`is_active\`      INTEGER NOT NULL DEFAULT 1,
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`products_store_idx\`    ON \`products\` (\`store_id\`);
CREATE INDEX IF NOT EXISTS \`products_category_idx\` ON \`products\` (\`category_id\`);
CREATE INDEX IF NOT EXISTS \`products_sku_idx\`      ON \`products\` (\`store_id\`, \`sku\`);
CREATE INDEX IF NOT EXISTS \`products_barcode_idx\`  ON \`products\` (\`store_id\`, \`barcode\`);

CREATE TABLE IF NOT EXISTS \`product_variants\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`product_id\`     TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`attributes\`     TEXT NOT NULL DEFAULT '{}',
  \`sku\`            TEXT,
  \`barcode\`        TEXT,
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`product_variants_product_idx\` ON \`product_variants\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`stock_levels\` (
  \`id\`               TEXT PRIMARY KEY NOT NULL,
  \`store_id\`         TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`product_id\`       TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`       TEXT REFERENCES \`product_variants\`(\`id\`),
  \`quantity_on_hand\` REAL NOT NULL DEFAULT 0,
  \`reorder_point\`    REAL NOT NULL DEFAULT 0,
  \`reorder_quantity\` REAL NOT NULL DEFAULT 0,
  \`location\`         TEXT,
  \`sync_status\`      TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\`   INTEGER,
  \`updated_at\`       INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`stock_levels_store_product_variant_idx\`
  ON \`stock_levels\` (\`store_id\`, \`product_id\`, \`variant_id\`);
CREATE INDEX IF NOT EXISTS \`stock_levels_store_idx\` ON \`stock_levels\` (\`store_id\`);

CREATE TABLE IF NOT EXISTS \`stock_movements\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`store_id\`       TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`product_id\`     TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`     TEXT REFERENCES \`product_variants\`(\`id\`),
  \`movement_type\`  TEXT NOT NULL CHECK (\`movement_type\` IN ('purchase','sale','adjustment','transfer','waste')),
  \`quantity_delta\` REAL NOT NULL,
  \`reference_id\`   TEXT,
  \`note\`           TEXT,
  \`performed_by\`   TEXT REFERENCES \`users\`(\`id\`),
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`stock_movements_store_idx\`   ON \`stock_movements\` (\`store_id\`);
CREATE INDEX IF NOT EXISTS \`stock_movements_product_idx\` ON \`stock_movements\` (\`product_id\`);
CREATE INDEX IF NOT EXISTS \`stock_movements_created_idx\` ON \`stock_movements\` (\`created_at\`);

CREATE TABLE IF NOT EXISTS \`sale_orders\` (
  \`id\`              TEXT PRIMARY KEY NOT NULL,
  \`store_id\`        TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`order_number\`    TEXT NOT NULL,
  \`status\`          TEXT NOT NULL DEFAULT 'draft' CHECK (\`status\` IN ('draft','confirmed','voided')),
  \`total_amount\`    REAL NOT NULL DEFAULT 0,
  \`discount_amount\` REAL NOT NULL DEFAULT 0,
  \`tax_amount\`      REAL NOT NULL DEFAULT 0,
  \`payment_method\`  TEXT CHECK (\`payment_method\` IN ('cash','card','gcash','maya','credit','other')),
  \`cashier_id\`      TEXT REFERENCES \`users\`(\`id\`),
  \`note\`            TEXT,
  \`sync_status\`     TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\`  INTEGER,
  \`created_at\`      INTEGER NOT NULL,
  \`updated_at\`      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`sale_orders_store_idx\`   ON \`sale_orders\` (\`store_id\`);
CREATE INDEX IF NOT EXISTS \`sale_orders_created_idx\` ON \`sale_orders\` (\`created_at\`);
CREATE UNIQUE INDEX IF NOT EXISTS \`sale_orders_store_number_idx\`
  ON \`sale_orders\` (\`store_id\`, \`order_number\`);

CREATE TABLE IF NOT EXISTS \`sale_order_items\` (
  \`id\`           TEXT PRIMARY KEY NOT NULL,
  \`order_id\`     TEXT NOT NULL REFERENCES \`sale_orders\`(\`id\`),
  \`product_id\`   TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`   TEXT REFERENCES \`product_variants\`(\`id\`),
  \`product_name\` TEXT NOT NULL,
  \`sku\`          TEXT,
  \`quantity\`     REAL NOT NULL,
  \`unit_price\`   REAL NOT NULL,
  \`discount\`     REAL NOT NULL DEFAULT 0,
  \`total\`        REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS \`sale_order_items_order_idx\`   ON \`sale_order_items\` (\`order_id\`);
CREATE INDEX IF NOT EXISTS \`sale_order_items_product_idx\` ON \`sale_order_items\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`vendors\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`store_id\`       TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`name\`           TEXT NOT NULL,
  \`contact_name\`   TEXT,
  \`phone\`          TEXT,
  \`email\`          TEXT,
  \`address\`        TEXT,
  \`notes\`          TEXT,
  \`is_active\`      INTEGER NOT NULL DEFAULT 1,
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`vendors_store_idx\` ON \`vendors\` (\`store_id\`);

CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`store_id\`       TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`vendor_id\`      TEXT REFERENCES \`vendors\`(\`id\`),
  \`po_number\`      TEXT NOT NULL,
  \`status\`         TEXT NOT NULL DEFAULT 'draft' CHECK (\`status\` IN ('draft','sent','received','cancelled')),
  \`total_amount\`   REAL NOT NULL DEFAULT 0,
  \`expected_date\`  INTEGER,
  \`received_date\`  INTEGER,
  \`note\`           TEXT,
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL,
  \`updated_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`purchase_orders_store_idx\`  ON \`purchase_orders\` (\`store_id\`);
CREATE INDEX IF NOT EXISTS \`purchase_orders_vendor_idx\` ON \`purchase_orders\` (\`vendor_id\`);
CREATE UNIQUE INDEX IF NOT EXISTS \`purchase_orders_store_number_idx\`
  ON \`purchase_orders\` (\`store_id\`, \`po_number\`);

CREATE TABLE IF NOT EXISTS \`purchase_order_items\` (
  \`id\`                TEXT PRIMARY KEY NOT NULL,
  \`purchase_order_id\` TEXT NOT NULL REFERENCES \`purchase_orders\`(\`id\`),
  \`product_id\`        TEXT NOT NULL REFERENCES \`products\`(\`id\`),
  \`variant_id\`        TEXT REFERENCES \`product_variants\`(\`id\`),
  \`product_name\`      TEXT NOT NULL,
  \`quantity\`          REAL NOT NULL,
  \`unit_cost\`         REAL NOT NULL,
  \`total\`             REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS \`po_items_po_idx\`      ON \`purchase_order_items\` (\`purchase_order_id\`);
CREATE INDEX IF NOT EXISTS \`po_items_product_idx\` ON \`purchase_order_items\` (\`product_id\`);

CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\`             TEXT PRIMARY KEY NOT NULL,
  \`store_id\`       TEXT NOT NULL REFERENCES \`stores\`(\`id\`),
  \`category\`       TEXT NOT NULL,
  \`amount\`         REAL NOT NULL,
  \`description\`    TEXT,
  \`performed_by\`   TEXT REFERENCES \`users\`(\`id\`),
  \`sync_status\`    TEXT NOT NULL DEFAULT 'pending' CHECK (\`sync_status\` IN ('synced','pending','conflict')),
  \`last_synced_at\` INTEGER,
  \`created_at\`     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS \`expenses_store_idx\`   ON \`expenses\` (\`store_id\`);
CREATE INDEX IF NOT EXISTS \`expenses_created_idx\` ON \`expenses\` (\`created_at\`);
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
    // Key MUST be `m${idx.padStart(4,'0')}` — see drizzle-orm/expo-sqlite/migrator.js
    m0000: sql0000,
  },
};
