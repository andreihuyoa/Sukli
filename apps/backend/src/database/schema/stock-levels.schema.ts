import { integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';
import { products } from './products.schema';

/**
 * Inventory Context — Aggregate Root: StockLevel
 *
 * Holds the CURRENT count (a materialized snapshot).
 * Source of truth is StockMovement — this can always be recomputed from history.
 *
 * No created_at — this row is upserted (INSERT ... ON CONFLICT DO UPDATE),
 * not inserted fresh each time.
 *
 * product_id is a cross-context reference — ID only, intentionally no JOIN
 * dependency required at the ORM layer.
 *
 * Invariant: quantity_on_hand must not go negative (service layer, not DB)
 */
export const stockLevels = pgTable('stock_levels', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id)
    .unique(), // one StockLevel row per product
  quantityOnHand: numeric('quantity_on_hand', { precision: 10, scale: 3 })
    .notNull()
    .default('0'), // decimal supports kg/ml units
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StockLevel = typeof stockLevels.$inferSelect;
export type NewStockLevel = typeof stockLevels.$inferInsert;
