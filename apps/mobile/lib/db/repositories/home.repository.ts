import { and, desc, eq, gte, isNull, lt, ne } from "drizzle-orm";

import type { Db } from "../client";
import {
  categories,
  products,
  saleOrderItems,
  saleOrders,
  stockLevels,
} from "../schema";

export function buildHomeStockQuery(db: Db) {
  return db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      storePrice: products.storePrice,
      buyPrice: products.buyPrice,
      imageUrls: products.imageUrls,
      categoryName: categories.name,
      quantityOnHand: stockLevels.quantityOnHand,
      lowStockThreshold: stockLevels.lowStockThreshold,
    })
    .from(products)
    .leftJoin(
      stockLevels,
      and(eq(stockLevels.productId, products.id), isNull(stockLevels.variantId))
    )
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.updatedAt));
}

export function buildHomeSalesQuery(db: Db, from: Date, to: Date) {
  return db
    .select({
      orderId: saleOrders.id,
      status: saleOrders.status,
      paymentMethod: saleOrders.paymentMethod,
      totalAmount: saleOrders.totalAmount,
      taxAmount: saleOrders.taxAmount,
      createdAt: saleOrders.createdAt,
      itemId: saleOrderItems.id,
      itemQuantity: saleOrderItems.quantity,
      itemTotal: saleOrderItems.total,
      itemBuyPriceAtSale: saleOrderItems.buyPriceAtSale,
    })
    .from(saleOrders)
    .leftJoin(saleOrderItems, eq(saleOrderItems.orderId, saleOrders.id))
    .where(
      and(
        ne(saleOrders.status, "voided"),
        gte(saleOrders.createdAt, from),
        lt(saleOrders.createdAt, to)
      )
    )
    .orderBy(desc(saleOrders.createdAt));
}

export type HomeStockRow = Awaited<
  ReturnType<typeof buildHomeStockQuery>
>[number];
export type HomeSalesRow = Awaited<
  ReturnType<typeof buildHomeSalesQuery>
>[number];
