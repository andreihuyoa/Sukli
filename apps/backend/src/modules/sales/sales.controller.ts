import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SalesService } from './sales.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';

@Controller('stores/:storeId/transactions')
@UseGuards(AuthGuard, StoreAccessGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.salesService.create(storeId, userId, dto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.salesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.salesService.findOne(id, storeId);
  }

  @Post(':id/void')
  void(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: VoidTransactionDto,
  ) {
    return this.salesService.voidTransaction(id, storeId, dto);
  }
}
