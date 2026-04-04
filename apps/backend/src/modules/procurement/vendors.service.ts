import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../database/database.module';
import { vendors, vendorCatalogItems } from '../../database/schema';
import { ulid } from '../../common/utils/ulid';
import type { CreateVendorDto } from './dto/create-vendor.dto';
import type { CreateCatalogItemDto } from './dto/create-catalog-item.dto';

@Injectable()
export class VendorsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(storeId: string, dto: CreateVendorDto) {
    const [created] = await this.db
      .insert(vendors)
      .values({
        id: dto.id ?? ulid(),
        storeId,
        name: dto.name,
        role: dto.role as any,
        contactPhone: dto.contactPhone ?? null,
        contactEmail: dto.contactEmail ?? null,
        imageUrl: dto.imageUrl ?? null,
        tags: dto.tags ?? [],
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
      .from(vendors)
      .where(and(eq(vendors.storeId, storeId), isNull(vendors.deletedAt)));
  }

  async findOne(id: string, storeId: string) {
    const [vendor] = await this.db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.id, id),
          eq(vendors.storeId, storeId),
          isNull(vendors.deletedAt),
        ),
      )
      .limit(1);

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, storeId: string, dto: Partial<CreateVendorDto>) {
    await this.findOne(id, storeId); // asserts existence

    const [updated] = await this.db
      .update(vendors)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.role !== undefined && { role: dto.role as any }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id))
      .returning();

    return updated;
  }

  async softDelete(id: string, storeId: string) {
    await this.findOne(id, storeId);
    await this.db
      .update(vendors)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(vendors.id, id));
  }

  // --- Vendor Catalog Items ---

  async addCatalogItem(
    vendorId: string,
    storeId: string,
    dto: CreateCatalogItemDto,
  ) {
    await this.findOne(vendorId, storeId);

    const [created] = await this.db
      .insert(vendorCatalogItems)
      .values({
        id: dto.id ?? ulid(),
        vendorId,
        storeId,
        productName: dto.productName,
        unitDescription: dto.unitDescription ?? '',
        price: dto.price,
        minOrderQuantity: dto.minOrderQuantity ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  async getCatalogItems(vendorId: string, storeId: string) {
    await this.findOne(vendorId, storeId);
    return this.db
      .select()
      .from(vendorCatalogItems)
      .where(eq(vendorCatalogItems.vendorId, vendorId));
  }

  async deleteCatalogItem(itemId: string, vendorId: string, storeId: string) {
    await this.findOne(vendorId, storeId);
    await this.db
      .delete(vendorCatalogItems)
      .where(
        and(
          eq(vendorCatalogItems.id, itemId),
          eq(vendorCatalogItems.vendorId, vendorId),
        ),
      );
  }
}
