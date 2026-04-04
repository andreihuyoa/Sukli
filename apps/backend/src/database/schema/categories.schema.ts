import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

/**
 * Catalog Context — Entity: Category
 *
 * Simple entity within Catalog — no independent aggregate boundary needed.
 * No deleted_at because categories are rarely deleted and have no financial
 * audit implications. If needed, add later without ceremony.
 */
export const categories = pgTable('categories', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
