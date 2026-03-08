import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { SummaryService } from './summary.service';

@ApiTags('summary')
@Controller('api/summary')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({ summary: 'Monthly summary' })
  async getSummary(@UserId() userId: string) {
    return this.summaryService.getSummary(userId);
  }
}
