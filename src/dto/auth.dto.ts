import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jane' })
  username!: string;

  @ApiProperty({ example: 'secret123' })
  password!: string;
}

export class SignupDto {
  @ApiProperty({ example: 'jane' })
  username!: string;

  @ApiProperty({ example: 'secret123' })
  password!: string;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Accepts fullName or full_name' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  phone?: string;

  @ApiPropertyOptional({ example: '1234', description: '4-digit recovery pin. Accepts recoveryPin or recovery_pin' })
  recoveryPin?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty({ example: '+15551234567' })
  phone!: string;

  @ApiProperty({ example: '1234', description: '4-digit recovery pin. Accepts recoveryPin or recovery_pin' })
  recoveryPin!: string;

  @ApiProperty({ example: 'newSecret456', description: 'Accepts newPassword or new_password' })
  newPassword!: string;
}
