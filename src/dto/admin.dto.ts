import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiPropertyOptional({ example: 'newTempPassword123' })
  newPassword?: string;

  @ApiPropertyOptional({ example: 'newTempPassword123' })
  new_password?: string;
}
