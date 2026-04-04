import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { products, stockLevels } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(
    storeId: string,
    dto: CreateProductDto,
  ): Promise<typeof products.$inferSelect> {
    // Invariant: price must be > 0
    if (parseFloat(dto.price) <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Invariant: name must be unique per store
    const [existing] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.name, dto.name),
          isNull(products.deletedAt),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `A product named "${dto.name}" already exists in this store`,
      );
    }

    const productId = dto.id ?? ulid();

    // Create product and initial stock level in a single transaction
    await this.db.transaction(async (tx) => {
      await tx.insert(products).values({
        id: productId,
        storeId,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        unit: dto.unit ?? 'piece',
        price: dto.price,
        costPrice: dto.costPrice,
        imageUrl: dto.imageUrl,
        barcode: dto.barcode,
      });

      // Auto-create StockLevel with 0 quantity when a product is created
      await tx.insert(stockLevels).values({
        id: ulid(),
        storeId,
        productId,
        quantityOnHand: '0',
        lowStockThreshold: 10,
      });
    });

    const [created] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    return created;
  }

  async findAll(storeId: string): Promise<(typeof products.$inferSelect)[]> {
    return this.db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), isNull(products.deletedAt)));
  }

  async findOne(
    productId: string,
    storeId: string,
  ): Promise<typeof products.$inferSelect> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.storeId, storeId),
          isNull(products.deletedAt),
        ),
      )
      .limit(1);

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    productId: string,
    storeId: string,
    dto: UpdateProductDto,
  ): Promise<typeof products.$inferSelect> {
    await this.findOne(productId, storeId);

    if (dto.price !== undefined && parseFloat(dto.price) <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    if (dto.name) {
      const [conflict] = await this.db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.storeId, storeId),
            eq(products.name, dto.name),
            isNull(products.deletedAt),
          ),
        )
        .limit(1);

      if (conflict && conflict.id !== productId) {
        throw new ConflictException(
          `A product named "${dto.name}" already exists in this store`,
        );
      }
    }

    const [updated] = await this.db
      .update(products)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.price && { price: dto.price }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();

    return updated;
  }

  async softDelete(productId: string, storeId: string): Promise<void> {
    await this.findOne(productId, storeId);

    await this.db
      .update(products)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(products.id, productId));
  }
}
