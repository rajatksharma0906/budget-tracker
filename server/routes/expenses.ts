import { Router, Request, Response } from 'express';
import {
  createExpense,
  getExpensesByUserAndDateRange,
  updateExpense,
  softDeleteExpense,
  restoreExpense,
  getDeletedExpensesByUserAndDateRange,
} from '@/lib/db/queries/expenses';
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

router.get('/deleted', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  const month = req.query.month as string | undefined;

  try {
    let startDate: string;
    let endDate: string;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      startDate = first.toISOString().slice(0, 10);
      endDate = last.toISOString().slice(0, 10);
    } else {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = first.toISOString().slice(0, 10);
      endDate = last.toISOString().slice(0, 10);
    }
    const rows = await getDeletedExpensesByUserAndDateRange(userId, startDate, endDate);
    const expenses = rows.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      category: r.category,
      sub_category: r.sub_category ?? undefined,
      date: r.date,
    }));
    res.json(expenses);
  } catch (e) {
    console.error('Get deleted expenses error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

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
    const rows = await getExpensesByUserAndDateRange(userId, startDate, endDate);
    const expenses = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      amount: Number(r.amount),
      description: r.description,
      category: r.category,
      sub_category: r.sub_category ?? undefined,
      date: r.date,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    res.json(expenses);
  } catch (e) {
    console.error('Get expenses error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST-only mutations: single endpoint POST /api/expenses, body.action = create | update | delete | restore
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as Request & { userId: string }).userId;
  let body = req.body;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if ((!body || typeof body !== 'object' || Object.keys(body).length === 0) && rawBody) {
    try {
      body = JSON.parse(rawBody.toString());
    } catch {
      body = body && typeof body === 'object' ? body : {};
    }
  }
  if (!body || typeof body !== 'object') {
    body = {};
  }
  const hasIdAndFields = body.id && (body.amount !== undefined || body.description !== undefined);
  const hasIdOnly = body.id && body.amount === undefined && body.description === undefined;
  const action = (body.action ?? (hasIdAndFields ? 'update' : hasIdOnly ? 'delete' : 'create'))
    .toString()
    .trim()
    .toLowerCase();

  if (action === 'delete') {
    const id = (body?.id ?? body?.expenseId)?.trim();
    if (!id) {
      res.status(400).json({ error: 'Expense ID required' });
      return;
    }
    try {
      const ok = await softDeleteExpense(userId, id);
      if (!ok) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json({ success: true });
    } catch (e) {
      console.error('Delete expense error:', e);
      res.status(500).json({ error: 'Server error' });
    }
    return;
  }

  if (action === 'restore') {
    const id = (body?.id ?? body?.expenseId)?.trim();
    if (!id) {
      res.status(400).json({ error: 'Expense ID required' });
      return;
    }
    try {
      const ok = await restoreExpense(userId, id);
      if (!ok) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json({ restored: true });
    } catch (e) {
      console.error('Restore expense error:', e);
      res.status(500).json({ error: 'Server error' });
    }
    return;
  }

  if (action === 'update') {
    const id = (body?.id ?? body?.expenseId)?.trim();
    if (!id) {
      res.status(400).json({ error: 'Expense ID required' });
      return;
    }
    const amount = sanitizeAmount(body?.amount);
    const description = sanitizeText(body?.description ?? '', 500);
    const category = sanitizeCategory(body?.category, EXPENSE_CATEGORIES);
    const allowedSubs = category ? getSubCategoriesFor(category) : [];
    const subCategory = sanitizeSubCategoryForCategory(body?.subCategory ?? body?.sub_category, allowedSubs);
    const date = sanitizeDate(body?.date);

    if (amount === null) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }
    if (!description) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }
    if (!category) {
      res.status(400).json({ error: 'Valid category is required' });
      return;
    }
    if (!date) {
      res.status(400).json({ error: 'Valid date is required' });
      return;
    }
    try {
      const row = await updateExpense(userId, id, {
        amount,
        description,
        category,
        subCategory: subCategory ?? undefined,
        date,
      });
      if (!row) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json({
        id: row.id,
        user_id: row.user_id,
        amount: Number(row.amount),
        description: row.description,
        category: row.category,
        sub_category: row.sub_category ?? undefined,
        date: row.date,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    } catch (e) {
      console.error('Update expense error:', e);
      res.status(500).json({ error: 'Server error' });
    }
    return;
  }

  // action === 'create' or missing
  const amount = sanitizeAmount(body?.amount);
  const description = sanitizeText(body?.description ?? '', 500);
  const category = sanitizeCategory(body?.category, EXPENSE_CATEGORIES);
  const allowedSubs = category ? getSubCategoriesFor(category) : [];
  const subCategory = sanitizeSubCategoryForCategory(body?.subCategory ?? body?.sub_category, allowedSubs);
  const date = sanitizeDate(body?.date);

  if (amount === null) {
    res.status(400).json({ error: 'Valid amount is required' });
    return;
  }
  if (!description) {
    res.status(400).json({ error: 'Description is required' });
    return;
  }
  if (!category) {
    res.status(400).json({ error: 'Valid category is required' });
    return;
  }
  if (!date) {
    res.status(400).json({ error: 'Valid date is required' });
    return;
  }

  try {
    const row = await createExpense(userId, {
      amount,
      description,
      category,
      subCategory: subCategory ?? undefined,
      date,
    });

    res.json({
      id: row.id,
      user_id: row.user_id,
      amount: Number(row.amount),
      description: row.description,
      category: row.category,
      sub_category: row.sub_category ?? undefined,
      date: row.date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (e) {
    console.error('Create expense error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
