#!/usr/bin/env node
/**
 * Test MySQL connection using MYSQL_* from .env / .env.local.
 * Usage: node scripts/test-connection.js
 */

const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'budget_tracker',
};

async function main() {
  console.log('Testing MySQL connection with:');
  console.log('  host:', config.host);
  console.log('  port:', config.port);
  console.log('  user:', config.user);
  console.log('  database:', config.database);
  console.log('  password:', config.password ? '***' : '(empty)');
  console.log('');

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  const [rows] = await connection.query('SELECT 1 AS ok');
  console.log('OK Connected. Query result:', rows);

  await connection.end();
  console.log('Connection closed. Test passed.');
}

main().catch((err) => {
  console.error('Connection failed:', err.message);
  if (err.code) console.error('Code:', err.code);
  process.exit(1);
});
