import { date, numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';
import { vendors } from './vendors.schema';

export const expenseCategoryEnum = pgEnum('expense_category', [
  'operations',
  'stock',
  'utilities',
  'other',
]);

/**
 * Procurement Context — Aggregate Root: Expense
 *
 * expense_date is a separate DATE column (not created_at) because users
 * frequently enter expenses after the fact. created_at is system time;
 * expense_date is user-controlled intent.
 *
 * vendor_id is optional — not all expenses are linked to a vendor.
 */
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  vendorId: text('vendor_id').references(() => vendors.id), // optional
  title: text('title').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: expenseCategoryEnum('category').notNull().default('other'),
  expenseDate: date('expense_date').notNull(), // user-selected date
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
