import { Router, Request, Response } from 'express';
import { createBill, getBillsByUserAndDateRange } from '@/lib/db/queries/bills';
import {
  sanitizeAmount,
  sanitizeDate,
  sanitizeCategory,
  sanitizeSubCategoryForCategory,
  sanitizeText,
} from '@/lib/sanitize';
import { EXPENSE_CATEGORIES, getSubCategoriesFor } from '@/lib/db/types';
import { requireAuth } from '@/server/middleware/auth';

const router = Router();

function toResponse(row: {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  sub_category?: string | null;
  is_paid: number;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    due_date: row.due_date,
    dueDate: row.due_date,
    category: row.category,
    sub_category: row.sub_category ?? undefined,
    is_paid: row.is_paid,
    isPaid: Boolean(row.is_paid),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;

  try {
    let startDate: string;
    let endDate: string;
    if (start && end) {
      const sd = sanitizeDate(start);
      const ed = sanitizeDate(end);
      if (!sd || !ed) {
        res.status(400).json({ error: 'Invalid date range' });
        return;
      }
      startDate = sd;
      endDate = ed;
    } else {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = first.toISOString().slice(0, 10);
      endDate = last.toISOString().slice(0, 10);
    }
    const rows = await getBillsByUserAndDateRange(userId, startDate, endDate);
    res.json(rows.map(toResponse));
  } catch (e) {
    console.error('Get bills error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const body = req.body;

  try {
    const amount = sanitizeAmount(body?.amount);
    const name = sanitizeText(body?.name ?? '', 200);
    const category = sanitizeCategory(body?.category, EXPENSE_CATEGORIES);
    const allowedSubs = category ? getSubCategoriesFor(category) : [];
    const subCategory = sanitizeSubCategoryForCategory(body?.subCategory ?? body?.sub_category, allowedSubs);
    const dueDate = sanitizeDate(body?.dueDate ?? body?.due_date);

    if (amount === null) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }
    if (!name) {
      res.status(400).json({ error: 'Bill name is required' });
      return;
    }
    if (!category) {
      res.status(400).json({ error: 'Valid category is required' });
      return;
    }
    if (!dueDate) {
      res.status(400).json({ error: 'Valid due date (YYYY-MM-DD) is required' });
      return;
    }

    const row = await createBill(userId, {
      name,
      amount,
      category,
      subCategory: subCategory ?? undefined,
      dueDate,
    });

    res.json(toResponse(row));
  } catch (e) {
    console.error('Create bill error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
