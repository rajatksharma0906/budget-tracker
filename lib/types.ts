/**
 * Shared types and constants for the UI (categories, currency, API shapes).
 * Backend API is at NEXT_PUBLIC_API_URL.
 */

export interface User {
  id: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  sub_category?: string | null;
  date: string;
  created_at: Date;
  updated_at: Date;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  sub_category?: string | null;
  is_paid?: boolean;
  isPaid?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Settings {
  id: string;
  user_id: string;
  monthly_budget: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Category groups: each parent category has its own sub-categories.
 * User selects Category first, then Sub-category (filtered by category).
 */
export const CATEGORY_GROUPS: Record<string, readonly string[]> = {
  Grocery: ['Groceries'],
  Housing: ['Mortgage', 'Other'],
  Rental: ['House Rental', 'Car Rental', 'Other'],
  Utilities: ['Electricity', 'Gas', 'Water', 'Internet', 'Phone', 'Other'],
  Transportation: ['Fuel', 'Parking', 'Tolls', 'Other'],
  Maintenance: ['Home Maintenance', 'Car Maintenance', 'Other'],
  Insurance: ['Home Insurance', 'Car Insurance', 'Health Insurance', 'Other'],
  Healthcare: ['Pharmacy', 'Medical', 'Other'],
  Entertainment: ['Subscription', 'Other'],
  Shopping: ['Other'],
  Education: ['Other'],
  Other: ['Other'],
} as const;

/** Parent category names (for validation and dropdown) */
export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_GROUPS) as readonly string[];

/** Sub-categories for a given category (for validation) */
export function getSubCategoriesFor(category: string): readonly string[] {
  return CATEGORY_GROUPS[category] ?? ['Other'];
}

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Allowed currency codes */
export const CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** API request/response shapes */
export interface CreateExpenseInput {
  description: string;
  amount: number;
  category: string;
  subCategory?: string | null;
  date: string;
}

export interface CreateBillInput {
  name: string;
  amount: number;
  category: string;
  subCategory?: string | null;
  dueDate: string;
}

export interface UpdateSettingsInput {
  monthlyBudget?: number;
  currency?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  role: 'user' | 'admin';
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}
