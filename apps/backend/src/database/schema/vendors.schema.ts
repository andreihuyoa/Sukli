import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';

/**
 * Procurement Context — Aggregate Root: Vendor
 *
 * tags is stored as JSONB (array of strings) because:
 * - Tags are display metadata only — no relational joins needed
 * - A junction table would add two joins per read with no query benefit
 * - JSONB is simpler and sufficient for this use case
 */
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  role: text('role'), // 'Primary Vendor' | 'Dry Goods' | etc. (free text)
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  imageUrl: text('image_url'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
