import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('stores/:storeId/expenses')
@UseGuards(AuthGuard, StoreAccessGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Param('storeId') storeId: string, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(storeId, dto);
  }

  @Get()
  findAll(@Param('storeId') storeId: string) {
    return this.expensesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.expensesService.findOne(id, storeId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.expensesService.softDelete(id, storeId);
  }
}
