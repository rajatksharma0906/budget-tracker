import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  getProfile,
  updateProfile,
  changePassword,
  updateRecoveryPinAction,
} from '../../lib/api-auth';

@Injectable()
export class ProfileService {
  async getProfile(userId: string) {
    const profile = await getProfile(userId);
    if (!profile) {
      throw new NotFoundException({ error: 'Profile not found' });
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; phone?: string },
  ) {
    await updateProfile(userId, {
      full_name: data.fullName,
      phone: data.phone,
    });
    const profile = await getProfile(userId);
    return profile ?? {};
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const result = await changePassword(userId, currentPassword, newPassword);
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return { ok: true };
  }

  async updateRecoveryPin(
    userId: string,
    currentPassword: string,
    newRecoveryPin: string,
  ) {
    const result = await updateRecoveryPinAction(
      userId,
      currentPassword,
      newRecoveryPin,
    );
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return { ok: true };
  }
}
