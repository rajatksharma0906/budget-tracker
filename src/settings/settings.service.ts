import { Injectable } from '@nestjs/common';
import { getSettingsByUserId, upsertSettings } from '../../lib/db/queries/settings';
import { sanitizeAmount, sanitizeCurrency } from '../../lib/sanitize';
import { CURRENCY_CODES } from '../../lib/db/types';

@Injectable()
export class SettingsService {
  async getSettings(userId: string) {
    const row = await getSettingsByUserId(userId);
    if (!row) {
      return { monthlyBudget: 0, currency: 'USD' };
    }
    return {
      monthlyBudget: Number(row.monthly_budget),
      currency: row.currency,
    };
  }

  async updateSettings(
    userId: string,
    body: { monthlyBudget?: number; monthly_budget?: number; currency?: string },
  ) {
    const monthlyBudget = sanitizeAmount(
      body?.monthlyBudget ?? body?.monthly_budget,
    );
    const currency = sanitizeCurrency(body?.currency, CURRENCY_CODES);
    const monthlyBudgetValue = monthlyBudget !== null ? monthlyBudget : 0;
    const currencyValue = currency ?? 'USD';
    await upsertSettings(userId, {
      monthlyBudget: monthlyBudgetValue,
      currency: currencyValue,
    });
    const row = await getSettingsByUserId(userId);
    if (!row) {
      return { monthlyBudget: monthlyBudgetValue, currency: currencyValue };
    }
    return {
      monthlyBudget: Number(row.monthly_budget),
      currency: row.currency,
    };
  }
}
