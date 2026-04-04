import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  controllers: [VendorsController, ExpensesController],
  providers: [VendorsService, ExpensesService],
  exports: [VendorsService, ExpensesService],
})
export class ProcurementModule {}
