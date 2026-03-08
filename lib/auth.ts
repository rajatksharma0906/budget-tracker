'use client';

const USERNAME_KEY = 'budget_username';
const USER_ID_KEY = 'budget_user_id';
const USER_ROLE_KEY = 'budget_user_role';
const FULL_NAME_KEY = 'budget_full_name';
const SAVE_FOR_LATER_KEY = 'budget_saved_username';

export const getStoredUsername = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USERNAME_KEY);
};

export const setStoredUsername = (username: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERNAME_KEY, username);
};

export const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
};

export const setStoredUserId = (userId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ID_KEY, userId);
};

export const getStoredRole = (): 'user' | 'admin' | null => {
  if (typeof window === 'undefined') return null;
  const r = localStorage.getItem(USER_ROLE_KEY);
  return r === 'admin' ? 'admin' : r === 'user' ? 'user' : null;
};

export const setStoredRole = (role: 'user' | 'admin'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ROLE_KEY, role);
};

export const getStoredFullName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FULL_NAME_KEY);
};

export const setStoredFullName = (fullName: string | null): void => {
  if (typeof window === 'undefined') return;
  if (fullName != null && fullName.trim()) {
    localStorage.setItem(FULL_NAME_KEY, fullName.trim());
  } else {
    localStorage.removeItem(FULL_NAME_KEY);
  }
};

/** Clear current session only; keeps "Save for later" username so it can be pre-filled on next login */
export const clearStoredUsername = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(FULL_NAME_KEY);
};

export const isAuthenticated = (): boolean => {
  return getStoredUsername() !== null;
};

export const getOrFetchUserId = async (): Promise<string | null> => {
  return getStoredUserId();
};

// Save for later: remember username for next visit (pre-fill)
export const getSavedUsernameForLater = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SAVE_FOR_LATER_KEY);
};

export const setSavedUsernameForLater = (username: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVE_FOR_LATER_KEY, username);
};

export const clearSavedUsernameForLater = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVE_FOR_LATER_KEY);
};
