import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileUpdateDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  fullName?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentSecret' })
  currentPassword!: string;

  @ApiProperty({ example: 'newSecret456' })
  newPassword!: string;
}

export class RecoveryPinDto {
  @ApiProperty({ example: 'currentSecret' })
  currentPassword!: string;

  @ApiProperty({ example: '5678', description: '4-digit recovery pin' })
  newRecoveryPin!: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  role!: string;

  @ApiPropertyOptional()
  full_name!: string | null;

  @ApiPropertyOptional()
  email!: string | null;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
