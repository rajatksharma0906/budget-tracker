import { randomUUID } from 'crypto';
import { query, queryOne } from '../client';
import type { SettingsRow } from '../types';

export async function getSettingsByUserId(userId: string): Promise<SettingsRow | null> {
  return queryOne<SettingsRow>(
    'SELECT id, user_id, monthly_budget, currency, created_at, updated_at FROM settings WHERE user_id = ? LIMIT 1',
    [userId]
  );
}

export async function upsertSettings(
  userId: string,
  data: { monthlyBudget: number; currency: string }
): Promise<SettingsRow> {
  const existing = await getSettingsByUserId(userId);
  if (existing) {
    await query(
      'UPDATE settings SET monthly_budget = ?, currency = ? WHERE user_id = ?',
      [data.monthlyBudget, data.currency, userId]
    );
    const row = await getSettingsByUserId(userId);
    if (!row) throw new Error('Settings update failed');
    return row;
  }
  const id = randomUUID();
  await query(
    'INSERT INTO settings (id, user_id, monthly_budget, currency) VALUES (?, ?, ?, ?)',
    [id, userId, data.monthlyBudget, data.currency]
  );
  const row = await getSettingsByUserId(userId);
  if (!row) throw new Error('Settings creation failed');
  return row;
}
