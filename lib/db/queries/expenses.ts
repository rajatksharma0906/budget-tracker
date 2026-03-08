import { randomUUID } from 'crypto';
import { query, queryOne } from '../client';
import type { ExpenseRow } from '../types';

export async function createExpense(
  userId: string,
  data: { amount: number; description: string; category: string; subCategory?: string | null; date: string }
): Promise<ExpenseRow> {
  const id = randomUUID();
  const subCategory = data.subCategory && data.subCategory.trim() ? data.subCategory.trim().slice(0, 100) : null;
  await query(
    `INSERT INTO expenses (id, user_id, amount, description, category, sub_category, date, is_deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, userId, data.amount, data.description, data.category, subCategory, data.date]
  );
  const row = await queryOne<ExpenseRow>(
    'SELECT id, user_id, amount, description, category, sub_category, date, is_deleted, created_at, updated_at FROM expenses WHERE id = ?',
    [id]
  );
  if (!row) throw new Error('Expense creation failed');
  return row;
}

export async function getExpensesByUserAndDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ExpenseRow[]> {
  const rows = await query<ExpenseRow[]>(
    `SELECT id, user_id, amount, description, category, sub_category, date, is_deleted, created_at, updated_at
     FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? AND (is_deleted = 0 OR is_deleted IS NULL)
     ORDER BY date DESC`,
    [userId, startDate, endDate]
  );
  return Array.isArray(rows) ? rows : [];
}

export async function getExpensesByUser(userId: string, limit: number = 1000): Promise<ExpenseRow[]> {
  const rows = await query<ExpenseRow[]>(
    `SELECT id, user_id, amount, description, category, sub_category, date, is_deleted, created_at, updated_at
     FROM expenses WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY date DESC LIMIT ?`,
    [userId, limit]
  );
  return Array.isArray(rows) ? rows : [];
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  data: { amount: number; description: string; category: string; subCategory?: string | null; date: string }
): Promise<ExpenseRow | null> {
  const subCategory = data.subCategory && data.subCategory.trim() ? data.subCategory.trim().slice(0, 100) : null;
  const result = await query(
    `UPDATE expenses SET amount = ?, description = ?, category = ?, sub_category = ?, date = ?
     WHERE id = ? AND user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)`,
    [data.amount, data.description, data.category, subCategory, data.date, expenseId, userId]
  );
  if ((result as { affectedRows?: number })?.affectedRows !== 1) return null;
  const row = await queryOne<ExpenseRow>(
    'SELECT id, user_id, amount, description, category, sub_category, date, is_deleted, created_at, updated_at FROM expenses WHERE id = ?',
    [expenseId]
  );
  return row ?? null;
}

export async function softDeleteExpense(userId: string, expenseId: string): Promise<boolean> {
  const result = await query(
    'UPDATE expenses SET is_deleted = 1 WHERE id = ? AND user_id = ?',
    [expenseId, userId]
  );
  return (result as { affectedRows?: number })?.affectedRows === 1;
}

export async function restoreExpense(userId: string, expenseId: string): Promise<boolean> {
  const result = await query(
    'UPDATE expenses SET is_deleted = 0 WHERE id = ? AND user_id = ?',
    [expenseId, userId]
  );
  return (result as { affectedRows?: number })?.affectedRows === 1;
}

export async function getDeletedExpensesByUserAndDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ExpenseRow[]> {
  const rows = await query<ExpenseRow[]>(
    `SELECT id, user_id, amount, description, category, sub_category, date, is_deleted, created_at, updated_at
     FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? AND is_deleted = 1
     ORDER BY date DESC`,
    [userId, startDate, endDate]
  );
  return Array.isArray(rows) ? rows : [];
}
