import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('api/reports')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Reports (query: month YYYY-MM)' })
  async getReports(
    @UserId() userId: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getReports(userId, month);
  }
}
