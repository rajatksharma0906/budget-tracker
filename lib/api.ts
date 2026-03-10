/**
 * API client for the remote Budget Tracker API.
 * All requests use NEXT_PUBLIC_API_URL and send X-User-Id when user is logged in.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getApiBase = (): string => {
  return API_URL.replace(/\/$/, '');
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('budget_user_id');
    if (userId) (headers as Record<string, string>)['X-User-Id'] = userId;
  }
  return headers;
};

/** Default request timeout (ms). Helps avoid blank screens when API is slow on shared hosting. */
const FETCH_TIMEOUT_MS = 25000;

/** Message shown when fetch fails (CORS, network, or API unreachable) */
export const NETWORK_ERROR_MESSAGE =
  "Can't reach the server. The API may be blocking requests from this site (CORS). " +
  'Check that NEXT_PUBLIC_API_URL is correct and the API allows your site\'s origin.';

const TIMEOUT_ERROR_MESSAGE =
  'The server is taking too long to respond. Please try again in a moment.';

function isNetworkOrCorsError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message?.toLowerCase() ?? '';
  return (
    err.name === 'TypeError' &&
    (msg === 'failed to fetch' || msg.includes('network') || msg.includes('load'))
  );
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const init: RequestInit = {
    ...options,
    signal: controller.signal,
  };

  try {
    const res = await fetch(url, init);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(TIMEOUT_ERROR_MESSAGE);
    }
    if (isNetworkOrCorsError(err)) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
    throw err;
  }
}

export async function apiLogin(username: string, password: string): Promise<{ id: string; username: string; role: 'user' | 'admin' }> {
  const res = await safeFetch(`${getApiBase()}/api/auth/login`, {
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
  const res = await safeFetch(`${getApiBase()}/api/auth/signup`, {
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
  const res = await safeFetch(`${getApiBase()}/api/auth/reset-password`, {
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
  const res = await safeFetch(`${getApiBase()}/api/profile`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load profile');
  return data;
}

export async function apiUpdateProfile(body: { fullName?: string | null; phone?: string | null }): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/profile/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
}

export async function apiUpdateRecoveryPin(currentPassword: string, newRecoveryPin: string): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/profile/recovery-pin`, {
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
  const res = await safeFetch(`${getApiBase()}/api/admin/users`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load users');
  return data;
}

export async function apiAdminResetUserPassword(userId: string, newPassword: string): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
}

export async function apiGetSummary() {
  const res = await safeFetch(`${getApiBase()}/api/summary`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load summary');
  return data;
}

export async function apiGetExpenses(params?: { start: string; end: string }) {
  const base = getApiBase();
  const paramsStr = [params?.start && `start=${encodeURIComponent(params.start)}`, params?.end && `end=${encodeURIComponent(params.end)}`].filter(Boolean).join('&');
  const url = `${base}/api/expenses${paramsStr ? `?${paramsStr}` : ''}`;
  const res = await safeFetch(url, { headers: getHeaders() });
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
  const res = await safeFetch(`${getApiBase()}/api/expenses`, {
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
  const res = await safeFetch(`${getApiBase()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'update', id, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update expense');
  return data;
}

export async function apiDeleteExpense(id: string): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'delete', id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to delete expense');
}

export async function apiRestoreExpense(id: string): Promise<void> {
  const res = await safeFetch(`${getApiBase()}/api/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'restore', id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to restore expense');
}

export async function apiGetDeletedExpenses(month: string) {
  const base = getApiBase();
  const url = `${base}/api/expenses/deleted?month=${encodeURIComponent(month)}`;
  const res = await safeFetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load deleted expenses');
  return Array.isArray(data) ? data : [];
}

export async function apiGetBills(params?: { start: string; end: string }) {
  const base = getApiBase();
  const paramsStr = [params?.start && `start=${encodeURIComponent(params.start)}`, params?.end && `end=${encodeURIComponent(params.end)}`].filter(Boolean).join('&');
  const url = `${base}/api/bills${paramsStr ? `?${paramsStr}` : ''}`;
  const res = await safeFetch(url, { headers: getHeaders() });
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
  const payload = {
    name: body.name,
    amount: body.amount,
    category: body.category,
    sub_category: body.subCategory ?? undefined,
    due_date: body.dueDate,
  };
  const res = await safeFetch(`${getApiBase()}/api/bills`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create bill');
  return data;
}

export async function apiGetSettings() {
  const res = await safeFetch(`${getApiBase()}/api/settings`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load settings');
  return data;
}

export async function apiSaveSettings(body: { monthlyBudget?: number; currency?: string }) {
  const res = await safeFetch(`${getApiBase()}/api/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save settings');
  return data;
}

export async function apiGetReports(month?: string) {
  const base = getApiBase();
  const qs = month ? `?month=${encodeURIComponent(month)}` : '';
  const url = `${base}/api/reports${qs}`;
  const res = await safeFetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load reports');
  return data;
}
