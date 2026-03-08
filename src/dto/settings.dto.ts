import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsUpdateDto {
  @ApiPropertyOptional({ example: 2000 })
  monthly_budget?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'One of: USD, EUR, GBP, INR, JPY, CAD, AUD' })
  currency?: string;
}

export class SettingsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiProperty({ example: 2000 })
  monthly_budget!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
