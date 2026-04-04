import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { stores, users } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import type { CreateStoreDto } from './dto/create-store.dto';
import type { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(
    user: AuthUser,
    dto: CreateStoreDto,
  ): Promise<typeof stores.$inferSelect> {
    // Invariant: free plan users may have at most 1 active store
    if (user.plan === 'free') {
      const [existingStore] = await this.db
        .select({ id: stores.id })
        .from(stores)
        .where(
          and(
            eq(stores.ownerId, user.id),
            isNull(stores.deletedAt),
          ),
        )
        .limit(1);

      if (existingStore) {
        throw new ForbiddenException(
          'Free plan allows only 1 store. Upgrade to premium to create more.',
        );
      }
    }

    const [created] = await this.db
      .insert(stores)
      .values({
        id: dto.id ?? ulid(),
        ownerId: user.id,
        name: dto.name,
        address: dto.address,
        currency: dto.currency ?? 'PHP',
        taxRate: dto.taxRate ?? '0.1200',
      })
      .returning();

    return created;
  }

  async findAllForUser(userId: string): Promise<(typeof stores.$inferSelect)[]> {
    return this.db
      .select()
      .from(stores)
      .where(and(eq(stores.ownerId, userId), isNull(stores.deletedAt)));
  }

  async findOne(
    storeId: string,
    userId: string,
  ): Promise<typeof stores.$inferSelect> {
    const [store] = await this.db
      .select()
      .from(stores)
      .where(and(eq(stores.id, storeId), isNull(stores.deletedAt)))
      .limit(1);

    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== userId) throw new ForbiddenException('Access denied');

    return store;
  }

  async update(
    storeId: string,
    userId: string,
    dto: UpdateStoreDto,
  ): Promise<typeof stores.$inferSelect> {
    await this.findOne(storeId, userId); // validates ownership

    const [updated] = await this.db
      .update(stores)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.taxRate && { taxRate: dto.taxRate }),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId))
      .returning();

    return updated;
  }

  async softDelete(storeId: string, userId: string): Promise<void> {
    await this.findOne(storeId, userId);

    await this.db
      .update(stores)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(stores.id, storeId));
  }
}
