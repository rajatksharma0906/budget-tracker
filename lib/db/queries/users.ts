import { randomUUID } from 'crypto';
import { query, queryOne } from '../client';
import type { UserRow, UserProfile } from '../types';

const USER_COLS = 'id, username, password_hash, role, full_name, email, phone, recovery_pin_hash, created_at, updated_at';
const PROFILE_COLS = 'id, username, role, full_name, email, phone, created_at, updated_at';

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const row = await queryOne<UserRow>(
    `SELECT ${USER_COLS} FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return row;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const row = await queryOne<UserRow>(
    `SELECT ${USER_COLS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return row;
}

/** Profile for current user (no password_hash, no recovery_pin_hash). */
export async function getProfileById(id: string): Promise<UserProfile | null> {
  const row = await queryOne<UserProfile>(
    `SELECT ${PROFILE_COLS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return row;
}

export async function findUserByEmailAndPhone(email: string, phone: string): Promise<UserRow | null> {
  const row = await queryOne<UserRow>(
    `SELECT ${USER_COLS} FROM users WHERE email = ? AND phone = ? LIMIT 1`,
    [email, phone]
  );
  return row;
}

export async function createUser(
  username: string,
  passwordHash: string,
  opts: { fullName?: string | null; email?: string | null; phone?: string | null; recoveryPinHash?: string | null; role?: 'user' | 'admin' } = {}
): Promise<UserRow> {
  const id = randomUUID();
  const role = opts.role ?? 'user';
  await query(
    `INSERT INTO users (id, username, password_hash, role, full_name, email, phone, recovery_pin_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      username,
      passwordHash,
      role,
      opts.fullName ?? null,
      opts.email ?? null,
      opts.phone ?? null,
      opts.recoveryPinHash ?? null,
    ]
  );
  const row = await findUserById(id);
  if (!row) throw new Error('User creation failed');
  return row;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string | null; email?: string | null; phone?: string | null }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | null)[] = [];
  if (data.full_name !== undefined) {
    updates.push('full_name = ?');
    values.push(data.full_name);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone);
  }
  if (updates.length === 0) return;
  values.push(userId);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
}

export async function updateUserRecoveryPin(userId: string, recoveryPinHash: string): Promise<void> {
  await query('UPDATE users SET recovery_pin_hash = ? WHERE id = ?', [recoveryPinHash, userId]);
}

/** List users for admin (no password_hash, no recovery_pin_hash). */
export async function listUsersForAdmin(): Promise<UserProfile[]> {
  const rows = await query<UserProfile[]>(`SELECT ${PROFILE_COLS} FROM users ORDER BY created_at DESC`);
  return Array.isArray(rows) ? rows : [];
}

/** Legacy: create user without password (for backward compat). */
export async function getOrCreateUser(username: string): Promise<UserRow> {
  const existing = await findUserByUsername(username);
  if (existing) return existing;
  const id = randomUUID();
  await query('INSERT INTO users (id, username) VALUES (?, ?)', [id, username]);
  const row = await findUserById(id);
  if (!row) throw new Error('User creation failed');
  return row;
}
