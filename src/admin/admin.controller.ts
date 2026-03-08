import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { AdminService } from './admin.service';
import { AdminResetPasswordDto } from '../dto';

@ApiTags('admin')
@Controller('api/admin')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiResponse({ status: 200, description: 'List of users (admin only)' })
  async listUsers(@UserId() userId: string) {
    return this.adminService.listUsers(userId);
  }

  @Put('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password (admin)' })
  @ApiParam({ name: 'id', description: 'Target user UUID' })
  @ApiBody({ type: AdminResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'New password required' })
  @ApiResponse({ status: 403, description: 'Admin only' })
  async resetPassword(
    @UserId() userId: string,
    @Param('id') targetUserId: string,
    @Body('newPassword') newPassword?: string,
    @Body('new_password') new_password?: string,
  ) {
    const newPass =
      typeof newPassword === 'string' ? newPassword : new_password;
    return this.adminService.resetUserPassword(
      userId,
      targetUserId,
      newPass as string,
    );
  }
}
