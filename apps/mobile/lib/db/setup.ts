import type { Db } from "./client";
import { baseSchemaSql } from "./migrations";

type SQLiteClient = Db["$client"];

type SQLiteColumnInfo = {
  name: string;
};

type SQLiteTableInfo = {
  name: string;
};

type LegacyTableColumn = {
  name: string;
};

type LegacyTableDefinition = {
  name: string;
  createSql: string;
  indexSql: string[];
  columns: LegacyTableColumn[];
};

const LEGACY_STORE_TABLES: LegacyTableDefinition[] = [
  {
    name: "categories",
    createSql: `
      CREATE TABLE \`categories\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`name\` TEXT NOT NULL,
        \`parent_id\` TEXT,
        \`sort_order\` INTEGER NOT NULL,
        \`created_at\` INTEGER NOT NULL,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [],
    columns: [
      { name: "id" },
      { name: "name" },
      { name: "parent_id" },
      { name: "sort_order" },
      { name: "created_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "products",
    createSql: `
      CREATE TABLE \`products\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`category_id\` TEXT REFERENCES \`categories\`(\`id\`),
        \`name\` TEXT NOT NULL,
        \`description\` TEXT,
        \`sku\` TEXT,
        \`barcode\` TEXT,
        \`unit\` TEXT NOT NULL,
        \`price\` REAL NOT NULL,
        \`cost_price\` REAL NOT NULL,
        \`image_urls\` TEXT NOT NULL,
        \`is_active\` INTEGER NOT NULL,
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE INDEX `products_category_idx` ON `products` (`category_id`);",
      "CREATE INDEX `products_sku_idx` ON `products` (`sku`);",
      "CREATE INDEX `products_barcode_idx` ON `products` (`barcode`);",
    ],
    columns: [
      { name: "id" },
      { name: "category_id" },
      { name: "name" },
      { name: "description" },
      { name: "sku" },
      { name: "barcode" },
      { name: "unit" },
      { name: "price" },
      { name: "cost_price" },
      { name: "image_urls" },
      { name: "is_active" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "stock_levels",
    createSql: `
      CREATE TABLE \`stock_levels\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`product_id\` TEXT NOT NULL REFERENCES \`products\`(\`id\`),
        \`variant_id\` TEXT REFERENCES \`product_variants\`(\`id\`),
        \`quantity_on_hand\` REAL NOT NULL,
        \`reorder_point\` REAL NOT NULL,
        \`reorder_quantity\` REAL NOT NULL,
        \`location\` TEXT,
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE UNIQUE INDEX `stock_levels_product_variant_idx` ON `stock_levels` (`product_id`, `variant_id`);",
      "CREATE INDEX `stock_levels_product_idx` ON `stock_levels` (`product_id`);",
    ],
    columns: [
      { name: "id" },
      { name: "product_id" },
      { name: "variant_id" },
      { name: "quantity_on_hand" },
      { name: "reorder_point" },
      { name: "reorder_quantity" },
      { name: "location" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "stock_movements",
    createSql: `
      CREATE TABLE \`stock_movements\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`product_id\` TEXT NOT NULL REFERENCES \`products\`(\`id\`),
        \`variant_id\` TEXT REFERENCES \`product_variants\`(\`id\`),
        \`movement_type\` TEXT NOT NULL CHECK (\`movement_type\` IN ('purchase','sale','adjustment','transfer','waste')),
        \`quantity_delta\` REAL NOT NULL,
        \`reference_id\` TEXT,
        \`note\` TEXT,
        \`performed_by\` TEXT REFERENCES \`users\`(\`id\`),
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE INDEX `stock_movements_product_idx` ON `stock_movements` (`product_id`);",
      "CREATE INDEX `stock_movements_created_idx` ON `stock_movements` (`created_at`);",
    ],
    columns: [
      { name: "id" },
      { name: "product_id" },
      { name: "variant_id" },
      { name: "movement_type" },
      { name: "quantity_delta" },
      { name: "reference_id" },
      { name: "note" },
      { name: "performed_by" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
    ],
  },
  {
    name: "sale_orders",
    createSql: `
      CREATE TABLE \`sale_orders\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`order_number\` TEXT NOT NULL,
        \`status\` TEXT NOT NULL CHECK (\`status\` IN ('draft','confirmed','voided')),
        \`total_amount\` REAL NOT NULL,
        \`discount_amount\` REAL NOT NULL,
        \`tax_amount\` REAL NOT NULL,
        \`payment_method\` TEXT CHECK (\`payment_method\` IN ('cash','card','gcash','maya','credit','other')),
        \`cashier_id\` TEXT REFERENCES \`users\`(\`id\`),
        \`note\` TEXT,
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE INDEX `sale_orders_created_idx` ON `sale_orders` (`created_at`);",
      "CREATE INDEX `sale_orders_number_idx` ON `sale_orders` (`order_number`);",
    ],
    columns: [
      { name: "id" },
      { name: "order_number" },
      { name: "status" },
      { name: "total_amount" },
      { name: "discount_amount" },
      { name: "tax_amount" },
      { name: "payment_method" },
      { name: "cashier_id" },
      { name: "note" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "vendors",
    createSql: `
      CREATE TABLE \`vendors\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`name\` TEXT NOT NULL,
        \`contact_name\` TEXT,
        \`phone\` TEXT,
        \`email\` TEXT,
        \`address\` TEXT,
        \`notes\` TEXT,
        \`is_active\` INTEGER NOT NULL,
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [],
    columns: [
      { name: "id" },
      { name: "name" },
      { name: "contact_name" },
      { name: "phone" },
      { name: "email" },
      { name: "address" },
      { name: "notes" },
      { name: "is_active" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "purchase_orders",
    createSql: `
      CREATE TABLE \`purchase_orders\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`vendor_id\` TEXT REFERENCES \`vendors\`(\`id\`),
        \`po_number\` TEXT NOT NULL,
        \`status\` TEXT NOT NULL CHECK (\`status\` IN ('draft','sent','received','cancelled')),
        \`total_amount\` REAL NOT NULL,
        \`expected_date\` INTEGER,
        \`received_date\` INTEGER,
        \`note\` TEXT,
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL,
        \`updated_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE INDEX `purchase_orders_vendor_idx` ON `purchase_orders` (`vendor_id`);",
      "CREATE INDEX `purchase_orders_number_idx` ON `purchase_orders` (`po_number`);",
    ],
    columns: [
      { name: "id" },
      { name: "vendor_id" },
      { name: "po_number" },
      { name: "status" },
      { name: "total_amount" },
      { name: "expected_date" },
      { name: "received_date" },
      { name: "note" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
      { name: "updated_at" },
    ],
  },
  {
    name: "expenses",
    createSql: `
      CREATE TABLE \`expenses\` (
        \`id\` TEXT PRIMARY KEY NOT NULL,
        \`category\` TEXT NOT NULL,
        \`amount\` REAL NOT NULL,
        \`description\` TEXT,
        \`performed_by\` TEXT REFERENCES \`users\`(\`id\`),
        \`sync_status\` TEXT NOT NULL CHECK (\`sync_status\` IN ('synced','pending','conflict')),
        \`last_synced_at\` INTEGER,
        \`created_at\` INTEGER NOT NULL
      );
    `.trim(),
    indexSql: [
      "CREATE INDEX `expenses_created_idx` ON `expenses` (`created_at`);",
    ],
    columns: [
      { name: "id" },
      { name: "category" },
      { name: "amount" },
      { name: "description" },
      { name: "performed_by" },
      { name: "sync_status" },
      { name: "last_synced_at" },
      { name: "created_at" },
    ],
  },
];

export function ensureDatabaseCompatibility(db: Db): void {
  const sqlite = db.$client;

  migrateLegacyStoreScope(sqlite);
  ensureCurrentSchema(sqlite);
}

function migrateLegacyStoreScope(sqlite: SQLiteClient): void {
  const tablesToRebuild = LEGACY_STORE_TABLES.filter((table) =>
    tableHasColumn(sqlite, table.name, "store_id")
  );
  const shouldDropStoreTables =
    tableExists(sqlite, "store_members") || tableExists(sqlite, "stores");

  if (tablesToRebuild.length === 0 && !shouldDropStoreTables) {
    return;
  }

  sqlite.execSync("PRAGMA foreign_keys = OFF;");
  sqlite.execSync("BEGIN IMMEDIATE;");

  try {
    for (const table of tablesToRebuild) {
      rebuildLegacyTable(sqlite, table);
    }

    dropTableIfExists(sqlite, "store_members");
    dropTableIfExists(sqlite, "stores");

    sqlite.execSync("COMMIT;");
  } catch (error) {
    sqlite.execSync("ROLLBACK;");
    throw error;
  } finally {
    sqlite.execSync("PRAGMA foreign_keys = ON;");
  }
}

function ensureCurrentSchema(sqlite: SQLiteClient): void {
  sqlite.execSync(baseSchemaSql);
}

function rebuildLegacyTable(
  sqlite: SQLiteClient,
  definition: LegacyTableDefinition
): void {
  if (!tableExists(sqlite, definition.name)) {
    return;
  }

  const currentColumns = getTableColumns(sqlite, definition.name);
  const missingColumns = definition.columns
    .filter((column) => !currentColumns.has(column.name))
    .map((column) => column.name);

  if (missingColumns.length > 0) {
    throw new Error(
      `Cannot rebuild legacy table "${definition.name}"; missing columns: ${missingColumns.join(
        ", "
      )}.`
    );
  }

  const legacyName = `${definition.name}__legacy`;
  const insertColumns = definition.columns
    .map((column) => `\`${column.name}\``)
    .join(", ");
  const selectColumns = definition.columns
    .map((column) => `\`${column.name}\``)
    .join(", ");

  sqlite.execSync(
    `ALTER TABLE \`${definition.name}\` RENAME TO \`${legacyName}\`;`
  );
  sqlite.execSync(definition.createSql);
  sqlite.execSync(
    `INSERT INTO \`${definition.name}\` (${insertColumns}) SELECT ${selectColumns} FROM \`${legacyName}\`;`
  );

  for (const indexSql of definition.indexSql) {
    sqlite.execSync(indexSql);
  }

  sqlite.execSync(`DROP TABLE \`${legacyName}\`;`);
}

function dropTableIfExists(sqlite: SQLiteClient, tableName: string): void {
  if (!tableExists(sqlite, tableName)) {
    return;
  }

  sqlite.execSync(`DROP TABLE \`${tableName}\`;`);
}

function tableExists(sqlite: SQLiteClient, tableName: string): boolean {
  return Boolean(
    sqlite.getFirstSync<SQLiteTableInfo>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      [tableName]
    )
  );
}

function tableHasColumn(
  sqlite: SQLiteClient,
  tableName: string,
  columnName: string
): boolean {
  if (!tableExists(sqlite, tableName)) {
    return false;
  }

  return getTableColumns(sqlite, tableName).has(columnName);
}

function getTableColumns(sqlite: SQLiteClient, tableName: string): Set<string> {
  if (!tableExists(sqlite, tableName)) {
    throw new Error(`Table "${tableName}" does not exist.`);
  }

  return new Set(
    sqlite
      .getAllSync<SQLiteColumnInfo>(`PRAGMA table_info(\`${tableName}\`)`)
      .map((column) => column.name)
  );
}
