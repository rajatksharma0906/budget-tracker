import { Injectable, BadRequestException } from '@nestjs/common';
import { createBill, getBillsByUserAndDateRange } from '../../lib/db/queries/bills';
import {
  sanitizeAmount,
  sanitizeDate,
  sanitizeCategory,
  sanitizeSubCategoryForCategory,
  sanitizeText,
} from '../../lib/sanitize';
import { EXPENSE_CATEGORIES, getSubCategoriesFor } from '../../lib/db/types';

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

@Injectable()
export class BillsService {
  async getBills(
    userId: string,
    start?: string,
    end?: string,
  ) {
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
    const rows = await getBillsByUserAndDateRange(userId, startDate, endDate);
    return rows.map(toResponse);
  }

  async createBill(
    userId: string,
    body: {
      name?: string;
      amount?: number;
      dueDate?: string;
      due_date?: string;
      category?: string;
      subCategory?: string;
      sub_category?: string;
    },
  ) {
    const amount = sanitizeAmount(body?.amount);
    const name = sanitizeText(body?.name ?? '', 200);
    const category = sanitizeCategory(body?.category, EXPENSE_CATEGORIES);
    const allowedSubs = category ? getSubCategoriesFor(category) : [];
    const subCategory = sanitizeSubCategoryForCategory(
      body?.subCategory ?? body?.sub_category,
      allowedSubs,
    );
    const dueDate = sanitizeDate(body?.dueDate ?? body?.due_date);

    if (amount === null) {
      throw new BadRequestException({ error: 'Valid amount is required' });
    }
    if (!name) {
      throw new BadRequestException({ error: 'Bill name is required' });
    }
    if (!category) {
      throw new BadRequestException({ error: 'Valid category is required' });
    }
    if (!dueDate) {
      throw new BadRequestException({
        error: 'Valid due date (YYYY-MM-DD) is required',
      });
    }

    const row = await createBill(userId, {
      name,
      amount,
      category,
      subCategory: subCategory ?? undefined,
      dueDate,
    });
    return toResponse(row);
  }
}
