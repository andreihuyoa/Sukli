/**
 * Drizzle relations — enables db.query.* relational API.
 */

import { relations } from "drizzle-orm";
import {
  categories,
  expenses,
  productVariants,
  products,
  saleOrderItems,
  saleOrders,
  storeProfiles,
  stockLevels,
  stockMovements,
  syncOutbox,
  users,
  vendorCatalogItems,
  vendors,
} from "./schema";

// IAM
export const usersRelations = relations(users, ({ one, many }) => ({
  storeProfile: one(storeProfiles, {
    fields: [users.id],
    references: [storeProfiles.userId],
  }),
  saleOrdersCashier: many(saleOrders),
}));

export const storeProfilesRelations = relations(storeProfiles, ({ one }) => ({
  user: one(users, {
    fields: [storeProfiles.userId],
    references: [users.id],
  }),
}));

export const syncOutboxRelations = relations(syncOutbox, () => ({}));

// Catalog
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  stockLevels: many(stockLevels),
  stockMovements: many(stockMovements),
  saleOrderItems: many(saleOrderItems),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    stockLevels: many(stockLevels),
    stockMovements: many(stockMovements),
  })
);

// Inventory
export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
  product: one(products, {
    fields: [stockLevels.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [stockLevels.variantId],
    references: [productVariants.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [stockMovements.variantId],
    references: [productVariants.id],
  }),
}));

// Sales
export const saleOrdersRelations = relations(saleOrders, ({ one, many }) => ({
  cashier: one(users, {
    fields: [saleOrders.cashierId],
    references: [users.id],
  }),
  items: many(saleOrderItems),
}));

export const saleOrderItemsRelations = relations(saleOrderItems, ({ one }) => ({
  order: one(saleOrders, {
    fields: [saleOrderItems.orderId],
    references: [saleOrders.id],
  }),
  product: one(products, {
    fields: [saleOrderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [saleOrderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Procurement
export const vendorsRelations = relations(vendors, ({ many }) => ({
  catalogItems: many(vendorCatalogItems),
  expenses: many(expenses),
}));

export const vendorCatalogItemsRelations = relations(
  vendorCatalogItems,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [vendorCatalogItems.vendorId],
      references: [vendors.id],
    }),
  })
);

// Expenses
export const expensesRelations = relations(expenses, ({ one }) => ({
  vendor: one(vendors, {
    fields: [expenses.vendorId],
    references: [vendors.id],
  }),
}));
