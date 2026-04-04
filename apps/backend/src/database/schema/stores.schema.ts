import { numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

/**
 * IAM & Store Context — Aggregate Root: Store
 *
 * tax_rate is stored on Store so VAT changes require zero code deployments.
 * Every entity in the system carries store_id — this is the single mechanism
 * enforcing multi-store row isolation.
 */
export const stores = pgTable('stores', {
  id: text('id').primaryKey(), // ULID
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  address: text('address'),
  currency: text('currency').notNull().default('PHP'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 })
    .notNull()
    .default('0.1200'), // 12% Philippine VAT
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
