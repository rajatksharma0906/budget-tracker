import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@Controller('api/expenses')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  async getExpenses(
    @UserId() userId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.expensesService.getExpenses(userId, start, end);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted expenses' })
  async getDeletedExpenses(
    @UserId() userId: string,
    @Query('month') month?: string,
  ) {
    return this.expensesService.getDeletedExpenses(userId, month);
  }

  @Post()
  @ApiOperation({ summary: 'Create/update/delete/restore expense' })
  async postExpense(@UserId() userId: string, @Body() body: Record<string, unknown>) {
    return this.expensesService.postExpense(userId, body);
  }
}
