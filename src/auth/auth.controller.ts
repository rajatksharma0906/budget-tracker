import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    if (typeof username !== 'string') {
      throw new BadRequestException({ error: 'Username is required' });
    }
    if (typeof password !== 'string') {
      throw new BadRequestException({ error: 'Password is required' });
    }
    const result = await this.authService.login(username, password);
    if ('error' in result) {
      if (result.code === 'USER_NOT_FOUND') {
        throw new NotFoundException({ error: result.error, code: result.code });
      }
      throw new UnauthorizedException({ error: result.error, code: result.code });
    }
    return result;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up' })
  async signup(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('fullName') fullName?: string,
    @Body('full_name') full_name?: string,
    @Body('email') email?: string,
    @Body('phone') phone?: string,
    @Body('recoveryPin') recoveryPin?: string,
    @Body('recovery_pin') recovery_pin?: string,
  ) {
    if (typeof username !== 'string') {
      throw new BadRequestException({ error: 'Username is required' });
    }
    if (typeof password !== 'string') {
      throw new BadRequestException({ error: 'Password is required' });
    }
    const result = await this.authService.signup(username, password, {
      fullName: typeof fullName === 'string' ? fullName : full_name,
      email: typeof email === 'string' ? email : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      recoveryPin:
        typeof recoveryPin === 'string' ? recoveryPin : recovery_pin,
    });
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return result;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(
    @Body('email') email: string,
    @Body('phone') phone: string,
    @Body('recoveryPin') recoveryPin: string,
    @Body('recovery_pin') recovery_pin: string,
    @Body('newPassword') newPassword: string,
    @Body('new_password') new_password: string,
  ) {
    const pin = typeof recoveryPin === 'string' ? recoveryPin : recovery_pin;
    const newPass =
      typeof newPassword === 'string' ? newPassword : new_password;
    if (
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof pin !== 'string' ||
      typeof newPass !== 'string'
    ) {
      throw new BadRequestException({
        error: 'Email, phone, recovery pin, and new password are required.',
      });
    }
    const result = await this.authService.resetPassword(
      email,
      phone,
      pin,
      newPass,
    );
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return result;
  }
}
