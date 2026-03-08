import { randomUUID } from 'crypto';
import { query, queryOne } from '../client';
import type { BillRow } from '../types';

export async function createBill(
  userId: string,
  data: { name: string; amount: number; category: string; subCategory?: string | null; dueDate: string }
): Promise<BillRow> {
  const id = randomUUID();
  const subCategory = data.subCategory && data.subCategory.trim() ? data.subCategory.trim().slice(0, 100) : null;
  await query(
    `INSERT INTO bills (id, user_id, name, amount, due_date, category, sub_category, is_paid)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, userId, data.name, data.amount, data.dueDate, data.category, subCategory]
  );
  const row = await queryOne<BillRow>(
    'SELECT id, user_id, name, amount, due_date, category, sub_category, is_paid, created_at, updated_at FROM bills WHERE id = ?',
    [id]
  );
  if (!row) throw new Error('Bill creation failed');
  return row;
}

export async function getBillsByUserAndDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<BillRow[]> {
  const rows = await query<BillRow[]>(
    `SELECT id, user_id, name, amount, due_date, category, sub_category, is_paid, created_at, updated_at
     FROM bills WHERE user_id = ? AND due_date >= ? AND due_date <= ?
     ORDER BY due_date DESC`,
    [userId, startDate, endDate]
  );
  return Array.isArray(rows) ? rows : [];
}

export async function getBillsByUser(userId: string, limit: number = 1000): Promise<BillRow[]> {
  const rows = await query<BillRow[]>(
    `SELECT id, user_id, name, amount, due_date, category, sub_category, is_paid, created_at, updated_at
     FROM bills WHERE user_id = ? ORDER BY due_date DESC LIMIT ?`,
    [userId, limit]
  );
  return Array.isArray(rows) ? rows : [];
}
