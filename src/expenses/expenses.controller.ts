import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserIdGuard } from '../guards/user-id.guard';
import { UserId } from '../decorators/user-id.decorator';
import { ExpensesService } from './expenses.service';
import { ExpensePostDto, ExpenseResponseDto } from '../dto';

@ApiTags('expenses')
@Controller('api/expenses')
@UseGuards(UserIdGuard)
@ApiBearerAuth('X-User-Id')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  @ApiQuery({ name: 'start', required: false, example: '2025-03-01' })
  @ApiQuery({ name: 'end', required: false, example: '2025-03-31' })
  @ApiResponse({ status: 200, description: 'List of expenses', type: [ExpenseResponseDto] })
  async getExpenses(
    @UserId() userId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.expensesService.getExpenses(userId, start, end);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted expenses' })
  @ApiQuery({ name: 'month', required: false, example: '2025-03' })
  @ApiResponse({ status: 200, description: 'List of deleted expenses' })
  async getDeletedExpenses(
    @UserId() userId: string,
    @Query('month') month?: string,
  ) {
    return this.expensesService.getDeletedExpenses(userId, month);
  }

  @Post()
  @ApiOperation({ summary: 'Create/update/delete/restore expense' })
  @ApiBody({ type: ExpensePostDto, description: 'Create: amount, description, category, date. Update/delete/restore: id + action' })
  @ApiResponse({ status: 201, description: 'Created or updated expense', type: ExpenseResponseDto })
  @ApiResponse({ status: 200, description: 'Delete/restore success' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async postExpense(@UserId() userId: string, @Body() body: Record<string, unknown>) {
    return this.expensesService.postExpense(userId, body);
  }
}
