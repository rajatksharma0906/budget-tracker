import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { SettingsService } from './settings.service';
import { SettingsUpdateDto, SettingsResponseDto } from '../dto';

@ApiTags('settings')
@Controller('api/settings')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get settings' })
  @ApiResponse({ status: 200, description: 'User settings', type: SettingsResponseDto })
  async getSettings(@UserId() userId: string) {
    return this.settingsService.getSettings(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update settings' })
  @ApiBody({ type: SettingsUpdateDto })
  @ApiResponse({ status: 200, description: 'Updated settings', type: SettingsResponseDto })
  async updateSettings(
    @UserId() userId: string,
    @Body() body: { monthlyBudget?: number; monthly_budget?: number; currency?: string },
  ) {
    return this.settingsService.updateSettings(userId, body);
  }
}
