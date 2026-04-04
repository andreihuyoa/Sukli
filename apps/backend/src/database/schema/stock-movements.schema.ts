import { numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';
import { products } from './products.schema';

export const movementTypeEnum = pgEnum('movement_type', [
  'sale',
  'restock',
  'adjustment',
  'void',
]);

/**
 * Inventory Context — Entity: StockMovement (append-only audit log)
 *
 * CRITICAL: These rows are NEVER updated or deleted.
 * Corrections are made by inserting a new 'adjustment' movement.
 * This provides a complete, auditable history of every stock change.
 *
 * quantity_delta:
 *   - Negative for outflows (sales)
 *   - Positive for inflows (restock, adjustments correcting a shortage)
 *
 * No updated_at — append-only by design.
 */
export const stockMovements = pgTable('stock_movements', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  quantityDelta: numeric('quantity_delta', { precision: 10, scale: 3 }).notNull(),
  referenceId: text('reference_id'), // FK → Transaction.id for 'sale'/'void' movements
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
