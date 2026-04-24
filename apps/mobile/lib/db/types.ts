/**
 * Inferred TypeScript types from the Drizzle schema.
 * Import these instead of writing manual interfaces — they stay in sync
 * with the schema automatically.
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
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
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Catalog
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;
export type ProductVariant = InferSelectModel<typeof productVariants>;

// Inventory
export type StockLevel = InferSelectModel<typeof stockLevels>;
export type StockMovement = InferSelectModel<typeof stockMovements>;
export type NewStockMovement = InferInsertModel<typeof stockMovements>;

// Sales
export type SaleOrder = InferSelectModel<typeof saleOrders>;
export type NewSaleOrder = InferInsertModel<typeof saleOrders>;
export type SaleOrderItem = InferSelectModel<typeof saleOrderItems>;

// Procurement
export type Vendor = InferSelectModel<typeof vendors>;
export type NewVendor = InferInsertModel<typeof vendors>;
export type PurchaseOrder = InferSelectModel<typeof purchaseOrders>;
export type PurchaseOrderItem = InferSelectModel<typeof purchaseOrderItems>;

// Finance
export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;

// Sync metadata helpers
export type SyncStatus = "synced" | "pending" | "conflict";
