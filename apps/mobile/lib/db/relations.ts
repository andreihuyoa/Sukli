/**
 * Drizzle relations — enables db.query.* relational API.
 */

import { relations } from "drizzle-orm";
import {
  categories,
  expenses,
  productVariants,
  products,
  purchaseOrderItems,
  purchaseOrders,
  saleOrderItems,
  saleOrders,
  stockLevels,
  stockMovements,
  users,
  vendors,
} from "./schema";

// IAM
export const usersRelations = relations(users, ({ many }) => ({
  stockMovements: many(stockMovements),
  saleOrdersCashier: many(saleOrders),
  expenses: many(expenses),
}));

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
  performer: one(users, {
    fields: [stockMovements.performedBy],
    references: [users.id],
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
  purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
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
  performer: one(users, {
    fields: [expenses.performedBy],
    references: [users.id],
  }),
}));
