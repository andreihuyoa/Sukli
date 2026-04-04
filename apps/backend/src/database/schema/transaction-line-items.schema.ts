import { numeric, pgTable, text } from 'drizzle-orm/pg-core';
import { transactions } from './transactions.schema';
import { products } from './products.schema';

/**
 * Sales Context — Entity: TransactionLineItem
 *
 * Owned by Transaction — never accessed independently.
 *
 * product_name and unit_price are INTENTIONALLY DENORMALIZED.
 * These are snapshots at the moment of sale. Joining to Product.name
 * or Product.price would return wrong values after any product update.
 * The product_id column is kept for analytics joins only.
 *
 * line_total is stored (not computed on read) to avoid floating-point
 * discrepancies across clients and server.
 */
export const transactionLineItems = pgTable('transaction_line_items', {
  id: text('id').primaryKey(), // ULID
  transactionId: text('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id), // analytics only; not relied on for transaction integrity
  productName: text('product_name').notNull(), // SNAPSHOT at time of sale
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(), // SNAPSHOT at time of sale
  quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull(),
  lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(), // stored; not computed on read
});

export type TransactionLineItem = typeof transactionLineItems.$inferSelect;
export type NewTransactionLineItem = typeof transactionLineItems.$inferInsert;
