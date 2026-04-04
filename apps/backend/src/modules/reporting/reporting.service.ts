import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import {
  transactions,
  transactionLineItems,
  expenses,
  stockLevels,
  products,
} from '../../database/schema';

@Injectable()
export class ReportingService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * Sales summary for a date range.
   * Returns total revenue, total tax, and total transactions.
   */
  async getSalesSummary(storeId: string, from: Date, to: Date) {
    const result = await this.db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`,
        totalTax: sql<string>`COALESCE(SUM(${transactions.taxAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'completed'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        ),
      );

    return result[0];
  }

  /**
   * Top-selling products by quantity sold in a date range.
   */
  async getTopProducts(storeId: string, from: Date, to: Date, limit = 10) {
    return this.db
      .select({
        productId: transactionLineItems.productId,
        productName: transactionLineItems.productName,
        totalQuantity: sql<string>`SUM(${transactionLineItems.quantity})`,
        totalRevenue: sql<string>`SUM(${transactionLineItems.lineTotal})`,
      })
      .from(transactionLineItems)
      .innerJoin(
        transactions,
        and(
          eq(transactionLineItems.transactionId, transactions.id),
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'completed'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        ),
      )
      .groupBy(
        transactionLineItems.productId,
        transactionLineItems.productName,
      )
      .orderBy(sql`SUM(${transactionLineItems.quantity}) DESC`)
      .limit(limit);
  }

  /**
   * Expense summary grouped by category.
   */
  async getExpenseSummary(storeId: string, from: Date, to: Date) {
    return this.db
      .select({
        category: expenses.category,
        totalAmount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.storeId, storeId),
          gte(expenses.expenseDate, from.toISOString().split('T')[0]),
          lte(expenses.expenseDate, to.toISOString().split('T')[0]),
          sql`${expenses.deletedAt} IS NULL`,
        ),
      )
      .groupBy(expenses.category);
  }

  /**
   * Low-stock products (quantity on hand <= threshold).
   */
  async getLowStockProducts(storeId: string) {
    return this.db
      .select({
        productId: stockLevels.productId,
        productName: products.name,
        quantityOnHand: stockLevels.quantityOnHand,
        lowStockThreshold: stockLevels.lowStockThreshold,
      })
      .from(stockLevels)
      .innerJoin(products, eq(stockLevels.productId, products.id))
      .where(
        and(
          eq(stockLevels.storeId, storeId),
          sql`${stockLevels.quantityOnHand} <= ${stockLevels.lowStockThreshold}`,
          sql`${products.deletedAt} IS NULL`,
        ),
      );
  }
}
