import { Router, Request, Response } from 'express';
import { getSettingsByUserId, upsertSettings } from '@/lib/db/queries/settings';
import { sanitizeAmount, sanitizeCurrency } from '@/lib/sanitize';
import { CURRENCY_CODES } from '@/lib/db/types';
import { requireAuth } from '@/server/middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;

  try {
    const row = await getSettingsByUserId(userId);
    if (!row) {
      res.json({ monthlyBudget: 0, currency: 'USD' });
      return;
    }
    res.json({
      monthlyBudget: Number(row.monthly_budget),
      currency: row.currency,
    });
  } catch (e) {
    console.error('Get settings error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const body = req.body;

  try {
    const monthlyBudget = sanitizeAmount(body?.monthlyBudget ?? body?.monthly_budget);
    const currency = sanitizeCurrency(body?.currency, CURRENCY_CODES);

    const monthlyBudgetValue = monthlyBudget !== null ? monthlyBudget : 0;
    const currencyValue = currency ?? 'USD';

    await upsertSettings(userId, {
      monthlyBudget: monthlyBudgetValue,
      currency: currencyValue,
    });

    const row = await getSettingsByUserId(userId);
    if (!row) {
      res.json({ monthlyBudget: monthlyBudgetValue, currency: currencyValue });
      return;
    }
    res.json({
      monthlyBudget: Number(row.monthly_budget),
      currency: row.currency,
    });
  } catch (e) {
    console.error('Save settings error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
