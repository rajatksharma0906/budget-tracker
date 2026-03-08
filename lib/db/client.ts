/**
 * MySQL connection pool. Use only on the server (API routes / server components).
 * All queries must use parameterized statements to prevent SQL injection.
 */

import mysql from 'mysql2/promise';

// Use 127.0.0.1 instead of localhost so MySQL sees IPv4; some servers (e.g. Hostinger)
// grant user only for 127.0.0.1 and deny when localhost resolves to ::1
const mysqlHost = process.env.MYSQL_HOST ?? 'localhost';

const pool = mysql.createPool({
  host: mysqlHost,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'budget_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query<T = unknown>(
  sql: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<T> {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T;
}

export async function queryOne<T = unknown>(
  sql: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<T | null> {
  const rows = await query(sql, params);
  const arr = Array.isArray(rows) ? rows : [];
  return arr.length > 0 ? (arr[0] as T) : null;
}

export { pool };
