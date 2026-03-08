import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { BillsService } from './bills.service';

@ApiTags('bills')
@Controller('api/bills')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({ summary: 'List bills' })
  async getBills(
    @UserId() userId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.billsService.getBills(userId, start, end);
  }

  @Post()
  @ApiOperation({ summary: 'Create bill' })
  async createBill(@UserId() userId: string, @Body() body: Record<string, unknown>) {
    return this.billsService.createBill(userId, body as any);
  }
}
