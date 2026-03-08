/**
 * Server-side auth: login, signup, reset password, profile. Passwords and recovery pin hashed with bcrypt.
 */

import {
  findUserById,
  findUserByUsername,
  findUserByEmailAndPhone,
  createUser,
  updateUserPassword,
  updateUserProfile,
  updateUserRecoveryPin,
  getProfileById,
  listUsersForAdmin,
} from '@/lib/db/queries/users';
import {
  sanitizeUsername,
  sanitizePassword,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFullName,
  sanitizeRecoveryPin,
} from '@/lib/sanitize';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars. Ensure we never store plain password. */
function isBcryptHash(value: string): boolean {
  return (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')) && value.length === 60;
}

/** Return a bcrypt hash. If value is already a bcrypt hash, return as-is; otherwise hash it (safeguard against plain text). */
async function ensurePasswordHash(value: string): Promise<string> {
  if (isBcryptHash(value)) return value;
  return bcrypt.hash(value, SALT_ROUNDS);
}

export function getUserIdFromRequest(request: Request): string | null {
  const userId = request.headers.get('x-user-id')?.trim();
  return userId || null;
}

export async function requireUserId(request: Request): Promise<{ userId: string } | { error: Response }> {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  const user = await findUserById(userId);
  if (!user) {
    return { error: new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { userId };
}

/** Require admin role. Call after requireUserId. */
export async function requireAdmin(userId: string): Promise<{ error: Response } | null> {
  const user = await findUserById(userId);
  if (!user || user.role !== 'admin') {
    return { error: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }
  return null;
}

/** Login: validate username + password, return user with role. */
export async function login(
  username: string,
  password: string
): Promise<
  { id: string; username: string; role: 'user' | 'admin' } | { error: string; code?: 'USER_NOT_FOUND' | 'PASSWORD_NOT_SET' | 'INVALID_PASSWORD' }
> {
  const safeUsername = sanitizeUsername(username);
  const safePassword = sanitizePassword(password);
  if (!safeUsername) {
    return { error: 'Invalid username. Use letters, numbers, and underscores (1–50 characters).' };
  }
  if (!safePassword) {
    return { error: 'Password must be 8–128 characters.' };
  }

  const user = await findUserByUsername(safeUsername);
  if (!user) {
    return { error: 'User not found. Sign up to create an account.', code: 'USER_NOT_FOUND' };
  }
  if (!user.password_hash || user.password_hash === '') {
    return { error: 'Account exists but no password set. Use Sign up to set a password.', code: 'PASSWORD_NOT_SET' };
  }
  let match: boolean;
  if (isBcryptHash(user.password_hash)) {
    match = await bcrypt.compare(safePassword, user.password_hash);
  } else {
    match = user.password_hash === safePassword;
    if (match) {
      await updateUserPassword(user.id, await bcrypt.hash(safePassword, SALT_ROUNDS));
    }
  }
  if (!match) {
    return { error: 'Invalid password.', code: 'INVALID_PASSWORD' };
  }
  const role = user.role === 'admin' ? 'admin' : 'user';
  return { id: user.id, username: user.username, role };
}

export async function signup(
  username: string,
  password: string,
  opts: { fullName?: string; email?: string; phone?: string; recoveryPin?: string } = {}
): Promise<{ id: string; username: string; role: 'user' | 'admin' } | { error: string }> {
  const safeUsername = sanitizeUsername(username);
  const safePassword = sanitizePassword(password);
  if (!safeUsername) {
    return { error: 'Invalid username. Use letters, numbers, and underscores (1–50 characters).' };
  }
  if (!safePassword) {
    return { error: 'Password must be 8–128 characters.' };
  }

  const fullName = opts.fullName != null ? sanitizeFullName(opts.fullName) : null;
  const email = opts.email != null ? sanitizeEmail(opts.email) : null;
  const phone = opts.phone != null ? sanitizePhone(opts.phone) : null;
  let recoveryPinHash: string | null = null;
  if (opts.recoveryPin != null) {
    const pin = sanitizeRecoveryPin(opts.recoveryPin);
    if (!pin) {
      return { error: 'Recovery pin must be exactly 4 digits.' };
    }
    recoveryPinHash = await bcrypt.hash(pin, SALT_ROUNDS);
  }

  const hash = await ensurePasswordHash(safePassword);
  const existing = await findUserByUsername(safeUsername);

  if (existing) {
    await updateUserPassword(existing.id, hash);
    if (recoveryPinHash) await updateUserRecoveryPin(existing.id, recoveryPinHash);
    if (fullName !== undefined || email !== undefined || phone !== undefined) {
      await updateUserProfile(existing.id, {
        full_name: fullName ?? existing.full_name ?? null,
        email: email ?? existing.email ?? null,
        phone: phone ?? existing.phone ?? null,
      });
    }
    const role = existing.role === 'admin' ? 'admin' : 'user';
    return { id: existing.id, username: existing.username, role };
  }

  const user = await createUser(safeUsername, hash, {
    fullName: fullName ?? null,
    email: email ?? null,
    phone: phone ?? null,
    recoveryPinHash,
  });
  const role = user.role === 'admin' ? 'admin' : 'user';
  return { id: user.id, username: user.username, role };
}

/** Reset password when logged out: email + phone + recovery pin. */
export async function resetPasswordByEmailPhonePin(
  email: string,
  phone: string,
  recoveryPin: string,
  newPassword: string
): Promise<{ ok: true } | { error: string }> {
  const safeEmail = sanitizeEmail(email);
  const safePhone = sanitizePhone(phone);
  const safePin = sanitizeRecoveryPin(recoveryPin);
  const safeNewPassword = sanitizePassword(newPassword);
  if (!safeEmail) return { error: 'Invalid email.' };
  if (!safePhone) return { error: 'Invalid phone number.' };
  if (!safePin) return { error: 'Recovery pin must be exactly 4 digits.' };
  if (!safeNewPassword) return { error: 'New password must be 8–128 characters.' };

  const user = await findUserByEmailAndPhone(safeEmail, safePhone);
  if (!user) {
    return { error: 'No account found with this email and phone.' };
  }
  if (!user.recovery_pin_hash) {
    return { error: 'Recovery pin not set for this account. Please contact support.' };
  }
  const pinMatch = await bcrypt.compare(safePin, user.recovery_pin_hash);
  if (!pinMatch) {
    return { error: 'Invalid recovery pin.' };
  }
  const newHash = await ensurePasswordHash(safeNewPassword);
  await updateUserPassword(user.id, newHash);
  return { ok: true };
}

/** Change password when logged in (current password required). */
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  const user = await findUserById(userId);
  if (!user || !user.password_hash) return { error: 'User not found.' };
  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) return { error: 'Current password is incorrect.' };
  const safeNew = sanitizePassword(newPassword);
  if (!safeNew) return { error: 'New password must be 8–128 characters.' };
  const newHash = await ensurePasswordHash(safeNew);
  await updateUserPassword(userId, newHash);
  return { ok: true };
}

/** Update recovery pin when logged in (current password required). Never return current pin. */
export async function updateRecoveryPinAction(userId: string, currentPassword: string, newRecoveryPin: string): Promise<{ ok: true } | { error: string }> {
  const user = await findUserById(userId);
  if (!user || !user.password_hash) return { error: 'User not found.' };
  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) return { error: 'Password is incorrect.' };
  const pin = sanitizeRecoveryPin(newRecoveryPin);
  if (!pin) return { error: 'Recovery pin must be exactly 4 digits.' };
  const hash = await bcrypt.hash(pin, SALT_ROUNDS);
  await updateUserRecoveryPin(userId, hash);
  return { ok: true };
}

export async function getProfile(userId: string) {
  return getProfileById(userId);
}

export async function updateProfile(
  userId: string,
  data: { full_name?: string | null; phone?: string | null }
) {
  await updateUserProfile(userId, data);
}

export async function adminListUsers() {
  return listUsersForAdmin();
}

/** Admin resets a user's password (e.g. when requested by user). */
export async function adminResetUserPassword(adminUserId: string, targetUserId: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  const safeNew = sanitizePassword(newPassword);
  if (!safeNew) return { error: 'New password must be 8–128 characters.' };
  const target = await findUserById(targetUserId);
  if (!target) return { error: 'User not found.' };
  const newHash = await ensurePasswordHash(safeNew);
  await updateUserPassword(targetUserId, newHash);
  return { ok: true };
}
