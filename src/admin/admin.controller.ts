import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('api/admin')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users (admin)' })
  async listUsers(@UserId() userId: string) {
    return this.adminService.listUsers(userId);
  }

  @Put('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password (admin)' })
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
