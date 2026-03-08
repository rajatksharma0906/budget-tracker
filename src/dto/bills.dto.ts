import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillCreateDto {
  @ApiProperty({ example: 'Electric bill' })
  name!: string;

  @ApiProperty({ example: 85.5 })
  amount!: number;

  @ApiProperty({ example: '2025-03-15' })
  due_date!: string;

  @ApiProperty({ example: 'Utilities', description: 'One of: Grocery, Housing, Rental, Utilities, Transportation, etc.' })
  category!: string;

  @ApiPropertyOptional({ example: 'Electricity' })
  sub_category?: string;
}

export class BillResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiProperty({ example: 'Electric bill' })
  name!: string;

  @ApiProperty({ example: 85.5 })
  amount!: number;

  @ApiProperty({ example: '2025-03-15' })
  due_date!: string;

  @ApiProperty({ example: true })
  isPaid!: boolean;

  @ApiProperty()
  category!: string;

  @ApiPropertyOptional()
  sub_category?: string;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
