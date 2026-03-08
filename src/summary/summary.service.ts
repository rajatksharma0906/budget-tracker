import { Injectable } from '@nestjs/common';
import { getExpensesByUserAndDateRange } from '../../lib/db/queries/expenses';
import { getBillsByUserAndDateRange } from '../../lib/db/queries/bills';
import { getSettingsByUserId } from '../../lib/db/queries/settings';

@Injectable()
export class SummaryService {
  async getSummary(userId: string) {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = first.toISOString().slice(0, 10);
    const endDate = last.toISOString().slice(0, 10);

    const [expenses, bills, settings] = await Promise.all([
      getExpensesByUserAndDateRange(userId, startDate, endDate),
      getBillsByUserAndDateRange(userId, startDate, endDate),
      getSettingsByUserId(userId),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBills = bills.reduce((sum, b) => sum + Number(b.amount), 0);
    const monthlyBudget = settings ? Number(settings.monthly_budget) : 0;

    return {
      totalExpenses,
      totalBills,
      totalSpent: totalExpenses + totalBills,
      monthlyBudget,
    };
  }
}
