import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { requireAdmin, adminListUsers, adminResetUserPassword } from '../../lib/api-auth';

@Injectable()
export class AdminService {
  async ensureAdmin(userId: string) {
    const forbidden = await requireAdmin(userId);
    if (forbidden) {
      throw new ForbiddenException({ error: 'Forbidden' });
    }
  }

  async listUsers(userId: string) {
    await this.ensureAdmin(userId);
    return adminListUsers();
  }

  async resetUserPassword(
    adminUserId: string,
    targetUserId: string,
    newPassword: string,
  ) {
    await this.ensureAdmin(adminUserId);
    if (!targetUserId || typeof newPassword !== 'string') {
      throw new BadRequestException({
        error: 'User ID and new password are required.',
      });
    }
    const result = await adminResetUserPassword(
      adminUserId,
      targetUserId,
      newPassword,
    );
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return { ok: true };
  }
}
