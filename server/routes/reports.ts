import { Router, Request, Response } from 'express';
import { getExpensesByUserAndDateRange, getExpensesByUser } from '@/lib/db/queries/expenses';
import { getBillsByUserAndDateRange, getBillsByUser } from '@/lib/db/queries/bills';
import { getSettingsByUserId } from '@/lib/db/queries/settings';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { requireAuth } from '@/server/middleware/auth';

const router = Router();

function toDateString(val: unknown): string {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const d = String(val.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const month = req.query.month as string | undefined;

  try {
    let year: number;
    let monthNum: number;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      year = y;
      monthNum = m - 1;
    } else {
      const now = new Date();
      year = now.getFullYear();
      monthNum = now.getMonth();
    }

    const monthStart = startOfMonth(new Date(year, monthNum, 1));
    const monthEnd = endOfMonth(new Date(year, monthNum, 1));
    const startDate = format(monthStart, 'yyyy-MM-dd');
    const endDate = format(monthEnd, 'yyyy-MM-dd');

    const [monthExpenses, monthBills, settings] = await Promise.all([
      getExpensesByUserAndDateRange(userId, startDate, endDate),
      getBillsByUserAndDateRange(userId, startDate, endDate),
      getSettingsByUserId(userId),
    ]);

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBills = monthBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const monthlyBudget = settings ? Number(settings.monthly_budget) : 0;

    const bills = monthBills.map((b) => ({
      id: b.id,
      name: b.name,
      amount: Number(b.amount),
      category: b.category,
      sub_category: b.sub_category ?? undefined,
      dueDate: b.due_date,
      isPaid: Boolean(b.is_paid),
    }));
    const expenses = monthExpenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      category: e.category,
      sub_category: e.sub_category ?? undefined,
      date: e.date,
    }));

    const allExpenses = await getExpensesByUser(userId);
    const allBills = await getBillsByUser(userId);
    const historical: Array<{ month: string; total: number; bills: number; expenses: number }> = [];
    for (let i = 0; i <= monthNum; i++) {
      const d = new Date(year, i, 1);
      const s = startOfMonth(d);
      const e = endOfMonth(d);
      const sd = format(s, 'yyyy-MM-dd');
      const ed = format(e, 'yyyy-MM-dd');
      const monthBillsList = allBills.filter(
        (b) => {
          const d = toDateString(b.due_date);
          return d && d >= sd && d <= ed;
        }
      );
      const monthExpensesList = allExpenses.filter(
        (x) => {
          const d = toDateString(x.date);
          return d && d >= sd && d <= ed;
        }
      );
      const billsTotal = monthBillsList.reduce((sum, b) => sum + Number(b.amount), 0);
      const expensesTotal = monthExpensesList.reduce((sum, x) => sum + Number(x.amount), 0);
      historical.push({
        month: format(d, 'MMMM yyyy'),
        total: billsTotal + expensesTotal,
        bills: billsTotal,
        expenses: expensesTotal,
      });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const yearlyData: Array<{ year: number; total: number; bills: number; expenses: number }> = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      const yearStart = format(new Date(y, 0, 1), 'yyyy-MM-dd');
      const yearEnd = format(new Date(y, 11, 31), 'yyyy-MM-dd');
      const yearBills = allBills.filter(
        (b) => {
          const d = toDateString(b.due_date);
          return d && d >= yearStart && d <= yearEnd;
        }
      );
      const yearExpenses = allExpenses.filter(
        (x) => {
          const d = toDateString(x.date);
          return d && d >= yearStart && d <= yearEnd;
        }
      );
      const yBills = yearBills.reduce((sum, b) => sum + Number(b.amount), 0);
      const yExpenses = yearExpenses.reduce((sum, x) => sum + Number(x.amount), 0);
      yearlyData.push({ year: y, total: yBills + yExpenses, bills: yBills, expenses: yExpenses });
    }

    res.json({
      selectedMonth: format(new Date(year, monthNum, 1), 'yyyy-MM'),
      totalBills,
      totalExpenses,
      totalSpent: totalBills + totalExpenses,
      monthlyBudget,
      bills,
      expenses,
      historical,
      yearlyData,
    });
  } catch (e) {
    console.error('Reports error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
