/**
 * Drizzle relations — enables db.query.* relational API.
 */

import { relations } from "drizzle-orm";
import {
  users,
  stores,
  storeMembers,
  categories,
  products,
  productVariants,
  stockLevels,
  stockMovements,
  saleOrders,
  saleOrderItems,
  vendors,
  purchaseOrders,
  purchaseOrderItems,
  expenses,
} from "./schema";

// IAM
export const usersRelations = relations(users, ({ many }) => ({
  ownedStores: many(stores),
  storeMembers: many(storeMembers),
  stockMovements: many(stockMovements),
  saleOrdersCashier: many(saleOrders),
  expenses: many(expenses),
}));

// Store
export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  members: many(storeMembers),
  categories: many(categories),
  products: many(products),
  stockLevels: many(stockLevels),
  stockMovements: many(stockMovements),
  saleOrders: many(saleOrders),
  vendors: many(vendors),
  purchaseOrders: many(purchaseOrders),
  expenses: many(expenses),
}));

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
  store: one(stores, {
    fields: [storeMembers.storeId],
    references: [stores.id],
  }),
  user: one(users, { fields: [storeMembers.userId], references: [users.id] }),
}));

// Catalog
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, { fields: [categories.storeId], references: [stores.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  stockLevels: many(stockLevels),
  stockMovements: many(stockMovements),
  saleOrderItems: many(saleOrderItems),
  poItems: many(purchaseOrderItems),
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
  store: one(stores, {
    fields: [stockLevels.storeId],
    references: [stores.id],
  }),
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
  store: one(stores, {
    fields: [stockMovements.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [stockMovements.variantId],
    references: [productVariants.id],
  }),
  performer: one(users, {
    fields: [stockMovements.performedBy],
    references: [users.id],
  }),
}));

// Sales
export const saleOrdersRelations = relations(saleOrders, ({ one, many }) => ({
  store: one(stores, { fields: [saleOrders.storeId], references: [stores.id] }),
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
export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  store: one(stores, { fields: [vendors.storeId], references: [stores.id] }),
  purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [purchaseOrders.storeId],
      references: [stores.id],
    }),
    vendor: one(vendors, {
      fields: [purchaseOrders.vendorId],
      references: [vendors.id],
    }),
    items: many(purchaseOrderItems),
  })
);

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    product: one(products, {
      fields: [purchaseOrderItems.productId],
      references: [products.id],
    }),
    variant: one(productVariants, {
      fields: [purchaseOrderItems.variantId],
      references: [productVariants.id],
    }),
  })
);

// Expenses
export const expensesRelations = relations(expenses, ({ one }) => ({
  store: one(stores, { fields: [expenses.storeId], references: [stores.id] }),
  performer: one(users, {
    fields: [expenses.performedBy],
    references: [users.id],
  }),
}));
