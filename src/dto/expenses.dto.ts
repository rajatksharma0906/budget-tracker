import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseCreateDto {
  @ApiProperty({ example: 29.99 })
  amount!: number;

  @ApiProperty({ example: 'Weekly groceries' })
  description!: string;

  @ApiProperty({ example: 'Grocery', description: 'One of: Grocery, Housing, Rental, Utilities, Transportation, Maintenance, Insurance, Healthcare, Entertainment, Shopping, Education, Other' })
  category!: string;

  @ApiPropertyOptional({ example: 'Groceries' })
  sub_category?: string;

  @ApiProperty({ example: '2025-03-08' })
  date!: string;
}

export class ExpenseUpdateDto {
  @ApiProperty({ example: 'exp-uuid-here' })
  id!: string;

  @ApiProperty({ example: 'update' })
  action!: 'update';

  @ApiProperty({ example: 39.99 })
  amount!: number;

  @ApiProperty({ example: 'Updated description' })
  description!: string;

  @ApiProperty({ example: 'Grocery' })
  category!: string;

  @ApiPropertyOptional({ example: 'Groceries' })
  sub_category?: string;

  @ApiProperty({ example: '2025-03-08' })
  date!: string;
}

export class ExpenseDeleteDto {
  @ApiProperty({ example: 'exp-uuid-here' })
  id!: string;

  @ApiProperty({ example: 'delete' })
  action!: 'delete';
}

export class ExpenseRestoreDto {
  @ApiProperty({ example: 'exp-uuid-here' })
  id!: string;

  @ApiProperty({ example: 'restore' })
  action!: 'restore';
}

/** Single body can create, update, delete, or restore depending on action and fields */
export class ExpensePostDto {
  @ApiPropertyOptional({ example: 'exp-uuid-here', description: 'Required for update/delete/restore' })
  id?: string;

  @ApiPropertyOptional({ example: 'create', enum: ['create', 'update', 'delete', 'restore'] })
  action?: 'create' | 'update' | 'delete' | 'restore';

  @ApiPropertyOptional({ example: 29.99 })
  amount?: number;

  @ApiPropertyOptional({ example: 'Weekly groceries' })
  description?: string;

  @ApiPropertyOptional({ example: 'Grocery' })
  category?: string;

  @ApiPropertyOptional({ example: 'Groceries' })
  sub_category?: string;

  @ApiPropertyOptional({ example: '2025-03-08' })
  date?: string;
}

export class ExpenseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  user_id!: string;

  @ApiProperty({ example: 29.99 })
  amount!: number;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  category!: string;

  @ApiPropertyOptional()
  sub_category?: string;

  @ApiProperty({ example: '2025-03-08' })
  date!: string;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
