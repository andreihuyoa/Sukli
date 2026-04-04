import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('stores/:storeId/inventory')
@UseGuards(AuthGuard, StoreAccessGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getAllStockLevels(@Param('storeId') storeId: string) {
    return this.inventoryService.getAllStockLevels(storeId);
  }

  @Get('products/:productId')
  getStockLevel(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.inventoryService.getStockLevel(productId, storeId);
  }

  @Post('adjust')
  adjustStock(
    @Param('storeId') storeId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(storeId, dto);
  }

  @Get('movements')
  getMovementHistory(
    @Param('storeId') storeId: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getMovementHistory(storeId, productId);
  }
}
