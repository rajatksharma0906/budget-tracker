/**
 * Client-side API helpers. All requests send X-User-Id when user is logged in.
 * Call only from client components; getStoredUserId() is used for auth.
 */

const getHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const userId = localStorage.getItem('budget_user_id');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (userId) (headers as Record<string, string>)['X-User-Id'] = userId;
  return headers;
};

const base = () => (typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');

export async function apiLogin(username: string, password: string): Promise<{ id: string; username: string; role: 'user' | 'admin' }> {
  const res = await fetch(`${base()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function apiSignup(
  username: string,
  password: string,
  opts?: { fullName?: string; email?: string; phone?: string; recoveryPin?: string }
): Promise<{ id: string; username: string; role: 'user' | 'admin' }> {
  const res = await fetch(`${base()}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.trim(),
      password,
      fullName: opts?.fullName,
      email: opts?.email,
      phone: opts?.phone,
      recoveryPin: opts?.recoveryPin,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sign up failed');
  return data;
}

export async function apiResetPassword(email: string, phone: string, recoveryPin: string, newPassword: string): Promise<void> {
  const res = await fetch(`${base()}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, recoveryPin, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reset password failed');
}

export async function apiGetProfile(): Promise<{
  id: string;
  username: string;
  role: 'user' | 'admin';
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}> {
  const res = await fetch(`${base()}/api/profile`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function apiUpdateProfile(body: { fullName?: string | null; phone?: string | null }): Promise<void> {
  const res = await fetch(`${base()}/api/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${base()}/api/profile/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
}

export async function apiUpdateRecoveryPin(currentPassword: string, newRecoveryPin: string): Promise<void> {
  const res = await fetch(`${base()}/api/profile/recovery-pin`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newRecoveryPin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update recovery pin');
}

export async function apiAdminListUsers(): Promise<
  Array<{ id: string; username: string; role: string; full_name: string | null; email: string | null; phone: string | null; created_at: string; updated_at: string }>
> {
  const res = await fetch(`${base()}/api/admin/users`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load users');
  return data;
}

export async function apiAdminResetUserPassword(userId: string, newPassword: string): Promise<void> {
  const res = await fetch(`${base()}/api/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
}

export async function apiGetSummary() {
  const res = await fetch(`${base()}/api/summary`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load summary');
  return data;
}

export async function apiGetExpenses(params?: { start: string; end: string }) {
  const b = base();
  const paramsStr = [params?.start && `start=${encodeURIComponent(params.start)}`, params?.end && `end=${encodeURIComponent(params.end)}`].filter(Boolean).join('&');
  const url = b ? `${b}/api/expenses${paramsStr ? `?${paramsStr}` : ''}` : `/api/expenses${paramsStr ? `?${paramsStr}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load expenses');
  return data;
}

export async function apiCreateExpense(body: {
  description: string;
  amount: number;
  category: string;
  subCategory?: string | null;
  date: string;
}) {
  const res = await fetch(`${base()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'create', ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create expense');
  return data;
}

export async function apiUpdateExpense(
  id: string,
  body: { description: string; amount: number; category: string; subCategory?: string | null; date: string }
) {
  const res = await fetch(`${base()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'update', id, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update expense');
  return data;
}

export async function apiDeleteExpense(id: string): Promise<void> {
  const res = await fetch(`${base()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'delete', id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to delete expense');
}

export async function apiRestoreExpense(id: string): Promise<void> {
  const res = await fetch(`${base()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'restore', id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to restore expense');
}

export async function apiGetDeletedExpenses(month: string) {
  const b = base();
  const qs = `?month=${encodeURIComponent(month)}`;
  const url = b ? `${b}/api/expenses/deleted${qs}` : `/api/expenses/deleted${qs}`;
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load deleted expenses');
  return Array.isArray(data) ? data : [];
}

export async function apiGetBills(params?: { start: string; end: string }) {
  const b = base();
  const paramsStr = [params?.start && `start=${encodeURIComponent(params.start)}`, params?.end && `end=${encodeURIComponent(params.end)}`].filter(Boolean).join('&');
  const url = b ? `${b}/api/bills${paramsStr ? `?${paramsStr}` : ''}` : `/api/bills${paramsStr ? `?${paramsStr}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load bills');
  return data;
}

export async function apiCreateBill(body: {
  name: string;
  amount: number;
  category: string;
  subCategory?: string | null;
  dueDate: string;
}) {
  const res = await fetch(`${base()}/api/bills`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create bill');
  return data;
}

export async function apiGetSettings() {
  const res = await fetch(`${base()}/api/settings`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load settings');
  return data;
}

export async function apiSaveSettings(body: { monthlyBudget?: number; currency?: string }) {
  const res = await fetch(`${base()}/api/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save settings');
  return data;
}

export async function apiGetReports(month?: string) {
  const b = base();
  const qs = month ? `?month=${encodeURIComponent(month)}` : '';
  const url = b ? `${b}/api/reports${qs}` : `/api/reports${qs}`;
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load reports');
  return data;
}
