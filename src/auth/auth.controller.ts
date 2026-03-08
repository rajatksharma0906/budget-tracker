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
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, ResetPasswordDto } from '../dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Returns user id and token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User created; returns user id and token' })
  @ApiResponse({ status: 400, description: 'Validation error or username taken' })
  async signup(@Body() body: SignupDto & { full_name?: string; recovery_pin?: string }) {
    const username = body.username;
    const password = body.password;
    if (typeof username !== 'string') {
      throw new BadRequestException({ error: 'Username is required' });
    }
    if (typeof password !== 'string') {
      throw new BadRequestException({ error: 'Password is required' });
    }
    const fullName = body.fullName ?? body.full_name;
    const recoveryPin = body.recoveryPin ?? body.recovery_pin;
    const result = await this.authService.signup(username, password, {
      fullName: typeof fullName === 'string' ? fullName : undefined,
      email: typeof body.email === 'string' ? body.email : undefined,
      phone: typeof body.phone === 'string' ? body.phone : undefined,
      recoveryPin: typeof recoveryPin === 'string' ? recoveryPin : undefined,
    });
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return result;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset success' })
  @ApiResponse({ status: 400, description: 'Invalid email/phone/pin or user not found' })
  async resetPassword(
    @Body() body: ResetPasswordDto & { recovery_pin?: string; new_password?: string },
  ) {
    const email = body.email;
    const phone = body.phone;
    const pin = body.recoveryPin ?? body.recovery_pin;
    const newPass = body.newPassword ?? body.new_password;
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
    const result = await this.authService.resetPassword(email, phone, pin, newPass);
    if ('error' in result) {
      throw new BadRequestException({ error: result.error });
    }
    return result;
  }
}
