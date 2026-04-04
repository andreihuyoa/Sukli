import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { stockLevels, stockMovements } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async getStockLevel(productId: string, storeId: string) {
    const [level] = await this.db
      .select()
      .from(stockLevels)
      .where(
        and(
          eq(stockLevels.productId, productId),
          eq(stockLevels.storeId, storeId),
        ),
      )
      .limit(1);

    if (!level) throw new NotFoundException('Stock level not found for product');
    return level;
  }

  async getAllStockLevels(storeId: string) {
    return this.db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.storeId, storeId));
  }

  /**
   * Manual stock adjustment (e.g. stock take, wastage, restock).
   * Atomic: updates stock level and inserts a movement record in a single transaction.
   */
  async adjustStock(storeId: string, dto: AdjustStockDto) {
    const delta = parseFloat(dto.quantityDelta);

    const [existing] = await this.db
      .select()
      .from(stockLevels)
      .where(
        and(
          eq(stockLevels.productId, dto.productId),
          eq(stockLevels.storeId, storeId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Stock level record not found for product');
    }

    const currentQty = parseFloat(existing.quantityOnHand as string);
    const newQty = currentQty + delta;

    if (newQty < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative stock (current: ${currentQty}, delta: ${delta})`,
      );
    }

    // Determine movement type
    const movementType =
      delta > 0 ? 'restock' : delta < 0 ? 'adjustment' : 'adjustment';

    await this.db.transaction(async (tx) => {
      await tx
        .update(stockLevels)
        .set({
          quantityOnHand: newQty.toString(),
          updatedAt: new Date(),
        })
        .where(eq(stockLevels.id, existing.id));

      await tx.insert(stockMovements).values({
        id: ulid(),
        storeId,
        productId: dto.productId,
        movementType,
        quantityDelta: delta.toString(),
        note: dto.note ?? null,
        referenceId: null,
        createdAt: new Date(),
      });
    });

    return this.getStockLevel(dto.productId, storeId);
  }

  async getMovementHistory(storeId: string, productId?: string) {
    if (productId) {
      return this.db
        .select()
        .from(stockMovements)
        .where(
          and(
            eq(stockMovements.storeId, storeId),
            eq(stockMovements.productId, productId),
          ),
        );
    }
    return this.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.storeId, storeId));
  }
}
