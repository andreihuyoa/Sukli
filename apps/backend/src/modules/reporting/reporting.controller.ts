import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { StoreAccessGuard } from '../../common/guards/store-access.guard';
import { ReportingService } from './reporting.service';

@Controller('stores/:storeId/reports')
@UseGuards(AuthGuard, StoreAccessGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  private parseDateRange(from?: string, to?: string): [Date, Date] {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
    const toDate = to ? new Date(to) : new Date();

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO 8601.');
    }
    return [fromDate, toDate];
  }

  @Get('sales-summary')
  getSalesSummary(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const [fromDate, toDate] = this.parseDateRange(from, to);
    return this.reportingService.getSalesSummary(storeId, fromDate, toDate);
  }

  @Get('top-products')
  getTopProducts(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const [fromDate, toDate] = this.parseDateRange(from, to);
    return this.reportingService.getTopProducts(
      storeId,
      fromDate,
      toDate,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('expenses-summary')
  getExpenseSummary(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const [fromDate, toDate] = this.parseDateRange(from, to);
    return this.reportingService.getExpenseSummary(storeId, fromDate, toDate);
  }

  @Get('low-stock')
  getLowStockProducts(@Param('storeId') storeId: string) {
    return this.reportingService.getLowStockProducts(storeId);
  }
}
