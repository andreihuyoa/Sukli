import { numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

export const transactionStatusEnum = pgEnum('transaction_status', [
  'draft',
  'completed',
  'voided',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  // 'gcash', 'card' — add later without schema migration
]);

/**
 * Sales Context — Aggregate Root: Transaction
 *
 * Invariants:
 * - Once status = 'completed', line items are immutable (service layer)
 * - total_amount must equal subtotal + tax_amount (computed server-side)
 * - Voided transactions remain in the ledger; never deleted
 * - Voiding triggers a new StockMovement(type='void') to reverse deduction
 */
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  status: transactionStatusEnum('status').notNull().default('draft'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
