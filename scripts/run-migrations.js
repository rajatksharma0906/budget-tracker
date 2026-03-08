#!/usr/bin/env node
/**
 * Run SQL migrations in order from scripts/migrations/*.sql
 * Uses MYSQL_* env vars (or .env) for connection.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/** Strip leading comment and blank lines so segments that start with -- (e.g. file header + SQL) still run */
function cleanStatement(s) {
  const trimmed = s.trim();
  if (!trimmed.length) return '';
  const lines = trimmed.split('\n');
  let start = 0;
  while (start < lines.length && (lines[start].trim() === '' || lines[start].trim().startsWith('--'))) start++;
  return lines.slice(start).join('\n').trim();
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'budget_tracker',
    multipleStatements: true,
  });

  try {
    const dbName = process.env.MYSQL_DATABASE || 'budget_tracker';
    await connection.query(`ALTER DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Running migration: ${file}`);
      try {
        const statements = sql
          .split(';')
          .map((s) => cleanStatement(s))
          .filter((s) => s.length > 0);
        if (statements.length > 1) {
          for (let i = 0; i < statements.length; i++) {
            try {
              await connection.query(statements[i] + ';');
            } catch (err) {
              if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log(`  SKIP statement ${i + 1}: column already exists`);
              } else if (err.code === 'ER_DUP_KEYNAME' || err.errno === 1061) {
                console.log(`  SKIP statement ${i + 1}: index already exists`);
              } else {
                throw err;
              }
            }
          }
          console.log(`  OK: ${file}`);
        } else {
          await connection.query(sql);
          console.log(`  OK: ${file}`);
        }
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
          console.log(`  SKIP: ${file} (column already exists)`);
        } else if (err.code === 'ER_DUP_KEYNAME' || err.errno === 1061) {
          console.log(`  SKIP: ${file} (index already exists)`);
        } else {
          throw err;
        }
      }
    }
    console.log('All migrations completed.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
