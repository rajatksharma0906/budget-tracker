import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  createExpense,
  getExpensesByUserAndDateRange,
  updateExpense,
  softDeleteExpense,
  restoreExpense,
  getDeletedExpensesByUserAndDateRange,
} from '../../lib/db/queries/expenses';
import {
  sanitizeAmount,
  sanitizeDate,
  sanitizeCategory,
  sanitizeSubCategoryForCategory,
  sanitizeText,
} from '../../lib/sanitize';
import { EXPENSE_CATEGORIES, getSubCategoriesFor } from '../../lib/db/types';

@Injectable()
export class ExpensesService {
  async getExpenses(userId: string, start?: string, end?: string) {
    let startDate: string;
    let endDate: string;
    if (start && end) {
      const sd = sanitizeDate(start);
      const ed = sanitizeDate(end);
      if (!sd || !ed) {
        throw new BadRequestException({ error: 'Invalid date range' });
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
    return rows.map((r) => ({
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
  }

  async getDeletedExpenses(userId: string, month?: string) {
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
    const rows = await getDeletedExpensesByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );
    return rows.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      category: r.category,
      sub_category: r.sub_category ?? undefined,
      date: r.date,
    }));
  }

  async postExpense(userId: string, body: Record<string, unknown>) {
    const hasIdAndFields =
      body.id &&
      (body.amount !== undefined || body.description !== undefined);
    const hasIdOnly =
      body.id &&
      body.amount === undefined &&
      body.description === undefined;
    const action = (
      body.action ??
      (hasIdAndFields ? 'update' : hasIdOnly ? 'delete' : 'create')
    )
      .toString()
      .trim()
      .toLowerCase();

    if (action === 'delete') {
      const id = ((body?.id ?? body?.expenseId) as string)?.trim();
      if (!id) {
        throw new BadRequestException({ error: 'Expense ID required' });
      }
      const ok = await softDeleteExpense(userId, id);
      if (!ok) {
        throw new NotFoundException({ error: 'Expense not found' });
      }
      return { success: true };
    }

    if (action === 'restore') {
      const id = ((body?.id ?? body?.expenseId) as string)?.trim();
      if (!id) {
        throw new BadRequestException({ error: 'Expense ID required' });
      }
      const ok = await restoreExpense(userId, id);
      if (!ok) {
        throw new NotFoundException({ error: 'Expense not found' });
      }
      return { restored: true };
    }

    if (action === 'update') {
      const id = ((body?.id ?? body?.expenseId) as string)?.trim();
      if (!id) {
        throw new BadRequestException({ error: 'Expense ID required' });
      }
      const amount = sanitizeAmount(body?.amount as number);
      const description = sanitizeText((body?.description as string) ?? '', 500);
      const category = sanitizeCategory(
        body?.category as string,
        EXPENSE_CATEGORIES,
      );
      const allowedSubs = category ? getSubCategoriesFor(category) : [];
      const subCategory = sanitizeSubCategoryForCategory(
        (body?.subCategory ?? body?.sub_category) as string,
        allowedSubs,
      );
      const date = sanitizeDate(body?.date as string);

      if (amount === null) {
        throw new BadRequestException({ error: 'Valid amount is required' });
      }
      if (!description) {
        throw new BadRequestException({ error: 'Description is required' });
      }
      if (!category) {
        throw new BadRequestException({ error: 'Valid category is required' });
      }
      if (!date) {
        throw new BadRequestException({ error: 'Valid date is required' });
      }

      const row = await updateExpense(userId, id, {
        amount,
        description,
        category,
        subCategory: subCategory ?? undefined,
        date,
      });
      if (!row) {
        throw new NotFoundException({ error: 'Expense not found' });
      }
      return {
        id: row.id,
        user_id: row.user_id,
        amount: Number(row.amount),
        description: row.description,
        category: row.category,
        sub_category: row.sub_category ?? undefined,
        date: row.date,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }

    // create
    const amount = sanitizeAmount(body?.amount as number);
    const description = sanitizeText((body?.description as string) ?? '', 500);
    const category = sanitizeCategory(
      body?.category as string,
      EXPENSE_CATEGORIES,
    );
    const allowedSubs = category ? getSubCategoriesFor(category) : [];
    const subCategory = sanitizeSubCategoryForCategory(
      (body?.subCategory ?? body?.sub_category) as string,
      allowedSubs,
    );
    const date = sanitizeDate(body?.date as string);

    if (amount === null) {
      throw new BadRequestException({ error: 'Valid amount is required' });
    }
    if (!description) {
      throw new BadRequestException({ error: 'Description is required' });
    }
    if (!category) {
      throw new BadRequestException({ error: 'Valid category is required' });
    }
    if (!date) {
      throw new BadRequestException({ error: 'Valid date is required' });
    }

    const row = await createExpense(userId, {
      amount,
      description,
      category,
      subCategory: subCategory ?? undefined,
      date,
    });
    return {
      id: row.id,
      user_id: row.user_id,
      amount: Number(row.amount),
      description: row.description,
      category: row.category,
      sub_category: row.sub_category ?? undefined,
      date: row.date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
