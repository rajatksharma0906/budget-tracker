import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('api/profile')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get profile' })
  async getProfile(@UserId() userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(
    @UserId() userId: string,
    @Body('fullName') fullName?: string,
    @Body('full_name') full_name?: string,
    @Body('phone') phone?: string,
  ) {
    return this.profileService.updateProfile(userId, {
      fullName: typeof fullName === 'string' ? fullName : full_name,
      phone: typeof phone === 'string' ? phone : undefined,
    });
  }

  @Put('password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @UserId() userId: string,
    @Body('currentPassword') currentPassword?: string,
    @Body('current_password') current_password?: string,
    @Body('newPassword') newPassword?: string,
    @Body('new_password') new_password?: string,
  ) {
    const current =
      typeof currentPassword === 'string' ? currentPassword : current_password;
    const newPass =
      typeof newPassword === 'string' ? newPassword : new_password;
    if (typeof current !== 'string' || typeof newPass !== 'string') {
      throw new BadRequestException({
        error: 'Current password and new password are required.',
      });
    }
    return this.profileService.changePassword(userId, current, newPass);
  }

  @Put('recovery-pin')
  @ApiOperation({ summary: 'Update recovery pin' })
  async updateRecoveryPin(
    @UserId() userId: string,
    @Body('currentPassword') currentPassword?: string,
    @Body('current_password') current_password?: string,
    @Body('newRecoveryPin') newRecoveryPin?: string,
    @Body('new_recovery_pin') new_recovery_pin?: string,
  ) {
    const current =
      typeof currentPassword === 'string' ? currentPassword : current_password;
    const newPin =
      typeof newRecoveryPin === 'string' ? newRecoveryPin : new_recovery_pin;
    if (typeof current !== 'string' || newPin === undefined) {
      throw new BadRequestException({
        error:
          'Current password and new recovery pin (4 digits) are required.',
      });
    }
    return this.profileService.updateRecoveryPin(userId, current, String(newPin));
  }
}
