import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import {
  products,
  categories,
  stockLevels,
  stockMovements,
  transactions,
  transactionLineItems,
  vendors,
  expenses,
} from '../../database/schema';

/**
 * SyncService — scaffolded for the offline-first push/pull model.
 *
 * Pull: Returns all records modified after `since` for the given store.
 * Push: Placeholder for client→server conflict resolution (not yet implemented).
 *
 * Conflict resolution rules per entity are documented in DDD-Architecture.md:
 * - Products/Categories: last-write-wins on `updated_at`
 * - Transactions: server-authoritative (no client merge)
 * - StockMovements: append-only (no conflicts possible)
 * - StockLevels: server recalculates from movements
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async pull(storeId: string, since: Date) {
    const [
      productRows,
      categoryRows,
      stockLevelRows,
      stockMovementRows,
      transactionRows,
      lineItemRows,
      vendorRows,
      expenseRows,
    ] = await Promise.all([
      this.db
        .select()
        .from(products)
        .where(and(eq(products.storeId, storeId), gt(products.updatedAt, since))),

      this.db
        .select()
        .from(categories)
        .where(and(eq(categories.storeId, storeId), gt(categories.updatedAt, since))),

      this.db
        .select()
        .from(stockLevels)
        .where(
          and(eq(stockLevels.storeId, storeId), gt(stockLevels.updatedAt, since)),
        ),

      this.db
        .select()
        .from(stockMovements)
        .where(
          and(
            eq(stockMovements.storeId, storeId),
            gt(stockMovements.createdAt, since),
          ),
        ),

      this.db
        .select()
        .from(transactions)
        .where(
          and(eq(transactions.storeId, storeId), gt(transactions.updatedAt, since)),
        ),

      // Line items don't have storeId — join via transactions is omitted for
      // simplicity; full sync will handle this via a sub-query.
      Promise.resolve([] as (typeof transactionLineItems.$inferSelect)[]),

      this.db
        .select()
        .from(vendors)
        .where(and(eq(vendors.storeId, storeId), gt(vendors.updatedAt, since))),

      this.db
        .select()
        .from(expenses)
        .where(and(eq(expenses.storeId, storeId), gt(expenses.updatedAt, since))),
    ]);

    return {
      serverTime: new Date().toISOString(),
      changes: {
        products: productRows,
        categories: categoryRows,
        stockLevels: stockLevelRows,
        stockMovements: stockMovementRows,
        transactions: transactionRows,
        transactionLineItems: lineItemRows,
        vendors: vendorRows,
        expenses: expenseRows,
      },
    };
  }

  /**
   * Push — stub. Full implementation requires per-entity conflict resolution.
   * Returns ack with server timestamp for client to record as lastSyncedAt.
   */
  async push(storeId: string, changes: Record<string, unknown[]> | undefined) {
    this.logger.warn(
      `SyncService.push called for store ${storeId} — full implementation pending`,
    );
    return {
      success: true,
      serverTime: new Date().toISOString(),
      message: 'Push received. Full conflict resolution not yet implemented.',
    };
  }
}
