import { integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { vendors } from './vendors.schema';
import { stores } from './stores.schema';

/**
 * Procurement Context — Entity: VendorCatalogItem
 *
 * Owned by Vendor aggregate. Represents the vendor's own catalog —
 * separate from Product because a vendor names and prices items
 * differently than the store does.
 */
export const vendorCatalogItems = pgTable('vendor_catalog_items', {
  id: text('id').primaryKey(), // ULID
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  storeId: text('store_id')
    .notNull()
    .references(() => stores.id),
  productName: text('product_name').notNull(), // vendor's own name
  unitDescription: text('unit_description').notNull(), // '1kg bag' | '24-pack' | etc.
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  minOrderQuantity: integer('min_order_quantity'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type VendorCatalogItem = typeof vendorCatalogItems.$inferSelect;
export type NewVendorCatalogItem = typeof vendorCatalogItems.$inferInsert;
