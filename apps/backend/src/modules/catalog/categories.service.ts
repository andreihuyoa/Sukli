import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { categories } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(
    storeId: string,
    dto: CreateCategoryDto,
  ): Promise<typeof categories.$inferSelect> {
    const [existing] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.storeId, storeId), eq(categories.name, dto.name)),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `A category named "${dto.name}" already exists in this store`,
      );
    }

    const [created] = await this.db
      .insert(categories)
      .values({
        id: dto.id ?? ulid(),
        storeId,
        name: dto.name,
      })
      .returning();

    return created;
  }

  async findAll(storeId: string): Promise<(typeof categories.$inferSelect)[]> {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.storeId, storeId));
  }

  async update(
    categoryId: string,
    storeId: string,
    name: string,
  ): Promise<typeof categories.$inferSelect> {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, categoryId), eq(categories.storeId, storeId)),
      )
      .limit(1);

    if (!existing) throw new NotFoundException('Category not found');

    const [updated] = await this.db
      .update(categories)
      .set({ name, updatedAt: new Date() })
      .where(eq(categories.id, categoryId))
      .returning();

    return updated;
  }

  async delete(categoryId: string, storeId: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.id, categoryId), eq(categories.storeId, storeId)),
      )
      .limit(1);

    if (!existing) throw new NotFoundException('Category not found');

    await this.db
      .delete(categories)
      .where(eq(categories.id, categoryId));
  }
}
