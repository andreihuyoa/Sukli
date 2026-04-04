import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';

@Controller('stores/:storeId/vendors')
@UseGuards(AuthGuard, StoreAccessGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Param('storeId') storeId: string, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(storeId, dto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.vendorsService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.vendorsService.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVendorDto>,
  ) {
    return this.vendorsService.update(id, storeId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.vendorsService.softDelete(id, storeId);
  }

  // --- Catalog items sub-resource ---

  @Post(':id/catalog')
  addCatalogItem(
    @Param('storeId') storeId: string,
    @Param('id') vendorId: string,
    @Body() dto: CreateCatalogItemDto,
  ) {
    return this.vendorsService.addCatalogItem(vendorId, storeId, dto);
  }

  @Get(':id/catalog')
  getCatalogItems(
    @Param('storeId') storeId: string,
    @Param('id') vendorId: string,
  ) {
    return this.vendorsService.getCatalogItems(vendorId, storeId);
  }

  @Delete(':id/catalog/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCatalogItem(
    @Param('storeId') storeId: string,
    @Param('id') vendorId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.vendorsService.deleteCatalogItem(itemId, vendorId, storeId);
  }
}
