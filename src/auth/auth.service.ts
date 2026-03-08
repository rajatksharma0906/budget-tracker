import { Injectable } from '@nestjs/common';
import {
  login,
  signup,
  resetPasswordByEmailPhonePin,
} from '../../lib/api-auth';

@Injectable()
export class AuthService {
  async login(username: string, password: string) {
    return login(username, password);
  }

  async signup(
    username: string,
    password: string,
    opts?: {
      fullName?: string;
      email?: string;
      phone?: string;
      recoveryPin?: string;
    },
  ) {
    return signup(username, password, opts);
  }

  async resetPassword(
    email: string,
    phone: string,
    recoveryPin: string,
    newPassword: string,
  ) {
    return resetPasswordByEmailPhonePin(
      email,
      phone,
      recoveryPin,
      newPassword,
    );
  }
}
