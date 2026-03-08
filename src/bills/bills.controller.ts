import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { BillsService } from './bills.service';
import { BillCreateDto, BillResponseDto } from '../dto';

@ApiTags('bills')
@Controller('api/bills')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({ summary: 'List bills' })
  @ApiQuery({ name: 'start', required: false, example: '2025-03-01' })
  @ApiQuery({ name: 'end', required: false, example: '2025-03-31' })
  @ApiResponse({ status: 200, description: 'List of bills', type: [BillResponseDto] })
  async getBills(
    @UserId() userId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.billsService.getBills(userId, start, end);
  }

  @Post()
  @ApiOperation({ summary: 'Create bill' })
  @ApiBody({ type: BillCreateDto })
  @ApiResponse({ status: 201, description: 'Bill created', type: BillResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createBill(@UserId() userId: string, @Body() body: Record<string, unknown>) {
    return this.billsService.createBill(userId, body as any);
  }
}
