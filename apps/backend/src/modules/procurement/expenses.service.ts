import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { expenses } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(storeId: string, dto: CreateExpenseDto) {
    const [created] = await this.db
      .insert(expenses)
      .values({
        id: dto.id ?? ulid(),
        storeId,
        vendorId: dto.vendorId ?? null,
        title: dto.title,
        amount: dto.amount,
        category: dto.category as any,
        expenseDate: dto.expenseDate,
        note: dto.note ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
      .returning();

    return created;
  }

  async findAll(storeId: string) {
    return this.db
      .select()
      .from(expenses)
      .where(and(eq(expenses.storeId, storeId), isNull(expenses.deletedAt)));
  }

  async findOne(id: string, storeId: string) {
    const [expense] = await this.db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.id, id),
          eq(expenses.storeId, storeId),
          isNull(expenses.deletedAt),
        ),
      )
      .limit(1);

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async softDelete(id: string, storeId: string) {
    await this.findOne(id, storeId);
    await this.db
      .update(expenses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(expenses.id, id));
  }
}
