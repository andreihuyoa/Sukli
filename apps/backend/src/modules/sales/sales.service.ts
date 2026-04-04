import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import {
  stores,
  transactions,
  transactionLineItems,
  stockLevels,
  stockMovements,
} from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { CreateTransactionDto } from './dto/create-transaction.dto';
import type { VoidTransactionDto } from './dto/void-transaction.dto';

@Injectable()
export class SalesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * Create a completed transaction. In a single DB transaction:
   * 1. Insert the transaction header
   * 2. Insert all line items
   * 3. Deplete stock levels for each product
   * 4. Insert stock movement records (audit trail)
   */
  async create(storeId: string, _userId: string, dto: CreateTransactionDto) {
    // Fetch store to get tax rate if not overridden
    const [store] = await this.db
      .select({ taxRate: stores.taxRate })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) throw new NotFoundException('Store not found');

    const effectiveTaxRate = dto.taxRate
      ? parseFloat(dto.taxRate)
      : parseFloat(store.taxRate as string ?? '0');

    // Calculate totals from line items
    let subtotal = 0;
    const lineItemValues: {
      id: string;
      transactionId: string;
      productId: string;
      productName: string;
      unitPrice: string;
      quantity: string;
      lineTotal: string;
    }[] = [];

    for (const item of dto.lineItems) {
      const qty = parseFloat(item.quantity);
      const price = parseFloat(item.unitPrice);
      const lineTotal = qty * price;
      subtotal += lineTotal;

      lineItemValues.push({
        id: ulid(),
        transactionId: '', // filled below after we know the transaction ID
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: lineTotal.toFixed(2),
      });
    }

    const taxAmount = subtotal * effectiveTaxRate;
    const totalAmount = subtotal + taxAmount;
    const transactionId = dto.id ?? ulid();

    // Fill in transactionId now
    for (const item of lineItemValues) {
      item.transactionId = transactionId;
    }

    const result = await this.db.transaction(async (tx) => {
      // Insert transaction header
      const [created] = await tx
        .insert(transactions)
        .values({
          id: transactionId,
          storeId,
          status: 'completed',
          paymentMethod: dto.paymentMethod as any,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          voidedAt: null,
          voidReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Insert all line items
      await tx.insert(transactionLineItems).values(lineItemValues);

      // Deplete stock and record movements for each line item
      for (const item of dto.lineItems) {
        const qty = parseFloat(item.quantity);

        const [level] = await tx
          .select()
          .from(stockLevels)
          .where(
            and(
              eq(stockLevels.productId, item.productId),
              eq(stockLevels.storeId, storeId),
            ),
          )
          .limit(1);

        if (!level) {
          throw new NotFoundException(
            `Stock level not found for product ${item.productId}`,
          );
        }

        const currentQty = parseFloat(level.quantityOnHand as string);
        const newQty = currentQty - qty;

        if (newQty < 0) {
          throw new BadRequestException(
            `Insufficient stock for product "${item.productName}" (available: ${currentQty}, requested: ${qty})`,
          );
        }

        await tx
          .update(stockLevels)
          .set({ quantityOnHand: newQty.toString(), updatedAt: new Date() })
          .where(eq(stockLevels.id, level.id));

        await tx.insert(stockMovements).values({
          id: ulid(),
          storeId,
          productId: item.productId,
          movementType: 'sale',
          quantityDelta: (-qty).toString(),
          referenceId: transactionId,
          note: null,
          createdAt: new Date(),
        });
      }

      return created;
    });

    return result;
  }

  async findAll(storeId: string) {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.storeId, storeId));
  }

  async findOne(id: string, storeId: string) {
    const [txn] = await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.storeId, storeId)))
      .limit(1);

    if (!txn) throw new NotFoundException('Transaction not found');

    const lineItems = await this.db
      .select()
      .from(transactionLineItems)
      .where(eq(transactionLineItems.transactionId, id));

    return { ...txn, lineItems };
  }

  async voidTransaction(
    id: string,
    storeId: string,
    dto: VoidTransactionDto,
  ) {
    const [txn] = await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.storeId, storeId)))
      .limit(1);

    if (!txn) throw new NotFoundException('Transaction not found');
    if (txn.status === 'voided') {
      throw new BadRequestException('Transaction is already voided');
    }

    const lineItems = await this.db
      .select()
      .from(transactionLineItems)
      .where(eq(transactionLineItems.transactionId, id));

    await this.db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({
          status: 'voided',
          voidedAt: new Date(),
          voidReason: dto.reason,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, id));

      // Restore stock for each line item
      for (const item of lineItems) {
        const qty = parseFloat(item.quantity as string);

        const [level] = await tx
          .select()
          .from(stockLevels)
          .where(
            and(
              eq(stockLevels.productId, item.productId as string),
              eq(stockLevels.storeId, storeId),
            ),
          )
          .limit(1);

        if (level) {
          const currentQty = parseFloat(level.quantityOnHand as string);
          await tx
            .update(stockLevels)
            .set({
              quantityOnHand: (currentQty + qty).toString(),
              updatedAt: new Date(),
            })
            .where(eq(stockLevels.id, level.id));

          await tx.insert(stockMovements).values({
            id: ulid(),
            storeId,
            productId: item.productId as string,
            movementType: 'void',
            quantityDelta: qty.toString(),
            referenceId: id,
            note: `Void: ${dto.reason}`,
            createdAt: new Date(),
          });
        }
      }
    });

    return this.findOne(id, storeId);
  }
}
