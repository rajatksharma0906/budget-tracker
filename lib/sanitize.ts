/**
 * Input validation and sanitization for security (SQL injection handled by
 * parameterized queries; this layer handles validation and XSS-safe output).
 */

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/** Escape HTML to prevent XSS when rendering user content */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return String(unsafe).replace(/[&<>"'`=/]/g, (s) => ENTITY_MAP[s] ?? s);
}

/** Sanitize for display: trim and limit length (no HTML) */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/** Validate and coerce amount (positive number) */
export function sanitizeAmount(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value) && value >= 0) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (!Number.isNaN(n) && n >= 0) return Math.round(n * 100) / 100;
  }
  return null;
}

/** Validate date string YYYY-MM-DD or ISO or timestamp; return YYYY-MM-DD */
export function sanitizeDate(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const plain = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
    if (plain) {
      const d = new Date(trimmed);
      return Number.isNaN(d.getTime()) ? null : trimmed;
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  if (typeof value === 'object' && value !== null && 'toISOString' in value && typeof (value as Date).toISOString === 'function') {
    const d = value as Date;
    return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Validate category against whitelist */
export function sanitizeCategory(
  value: unknown,
  allowed: readonly string[]
): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return allowed.includes(v) ? v : null;
}

/** Optional sub-category: must be in the allowed list for the selected category */
export function sanitizeSubCategoryForCategory(
  value: unknown,
  allowed: readonly string[]
): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, 100);
  if (v.length === 0) return null;
  return allowed.includes(v) ? v : null;
}

/** Validate currency code against whitelist */
export function sanitizeCurrency(
  value: unknown,
  allowed: readonly string[]
): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toUpperCase();
  return allowed.includes(v) ? v : null;
}

/** Username: alphanumeric, underscore, 1-50 chars */
export function sanitizeUsername(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 50) return null;
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Password: 8–128 chars, no leading/trailing space. Validated only; never stored plain. */
export function sanitizePassword(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const s = value;
  if (s.length < 8 || s.length > 128) return null;
  return s;
}

/** Email: basic format, max 255 chars */
export function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 255);
  if (trimmed.length === 0) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Phone: digits, spaces, +, -, parentheses; 10–20 chars */
export function sanitizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s/g, '').slice(0, 20);
  if (trimmed.length < 10) return null;
  if (!/^[+]?[\d()-]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Full name: 1–100 chars */
export function sanitizeFullName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 100);
  return trimmed.length > 0 ? trimmed : null;
}

/** Recovery pin: exactly 4 digits. Validated only; store hash on server. */
export function sanitizeRecoveryPin(value: unknown): string | null {
  if (typeof value === 'number' && value >= 0 && value <= 9999) {
    return String(Math.floor(value)).padStart(4, '0');
  }
  if (typeof value === 'string') {
    const digits = value.trim().replace(/\D/g, '');
    if (digits.length !== 4) return null;
    return digits;
  }
  return null;
}
