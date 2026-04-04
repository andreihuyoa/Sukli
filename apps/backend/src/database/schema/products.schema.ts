import { numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.schema';
import { categories } from './categories.schema';

/**
 * Catalog Context — Aggregate Root: Product
 *
 * cost_price is nullable but critical — needed for gross margin computation.
 * barcode is added proactively — scanner support is already hinted in the UI.
 * Soft-deleted products remain referenceable by historical TransactionLineItems.
 *
 * Invariant: price > 0 (enforced in service layer, not DB check constraint)
 * Invariant: name unique per store_id (enforced in service layer)
 */
export const products = pgTable('products', {
  id: text('id').primaryKey(), // ULID
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id),
  unit: text('unit').notNull().default('piece'), // 'piece' | 'kg' | 'bottle' | 'pack'
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // selling price; must be > 0
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }), // for margin calc; nullable
  imageUrl: text('image_url'),
  barcode: text('barcode'), // future scanner support
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
