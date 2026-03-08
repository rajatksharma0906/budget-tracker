import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('api/settings')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get settings' })
  async getSettings(@UserId() userId: string) {
    return this.settingsService.getSettings(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update settings' })
  async updateSettings(
    @UserId() userId: string,
    @Body() body: { monthlyBudget?: number; monthly_budget?: number; currency?: string },
  ) {
    return this.settingsService.updateSettings(userId, body);
  }
}
