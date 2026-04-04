import {
  BadRequestException,
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
import { SyncService } from './sync.service';
import { PushPayloadDto } from './dto/push-payload.dto';

@Controller('stores/:storeId/sync')
@UseGuards(AuthGuard, StoreAccessGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * Pull delta — returns all records modified after `since`.
   * If `since` is omitted, returns everything (full sync).
   */
  @Get('pull')
  pull(
    @Param('storeId') storeId: string,
    @Query('since') since?: string,
  ) {
    const sinceDate = since ? new Date(since) : new Date(0);
    if (isNaN(sinceDate.getTime())) {
      throw new BadRequestException('Invalid `since` date. Use ISO 8601.');
    }
    return this.syncService.pull(storeId, sinceDate);
  }

  /**
   * Push client changes to server.
   */
  @Post('push')
  push(
    @Param('storeId') storeId: string,
    @Body() dto: PushPayloadDto,
  ) {
    return this.syncService.push(storeId, dto.changes);
  }
}
