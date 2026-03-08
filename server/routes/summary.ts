import { Router, Request, Response } from 'express';
import { getExpensesByUserAndDateRange } from '@/lib/db/queries/expenses';
import { getBillsByUserAndDateRange } from '@/lib/db/queries/bills';
import { getSettingsByUserId } from '@/lib/db/queries/settings';
import { requireAuth } from '@/server/middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;

  try {
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

    res.json({
      totalExpenses,
      totalBills,
      totalSpent: totalExpenses + totalBills,
      monthlyBudget,
    });
  } catch (e) {
    console.error('Summary error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
