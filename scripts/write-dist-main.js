#!/usr/bin/env node
/**
 * Writes dist/main.js so Hostinger (and others) can use "dist/main.js" as the entry file.
 * Run after nest build. dist/main.js requires dist/src/main.js.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const mainPath = path.join(distDir, 'main.js');

const content = `require('dotenv/config');
require('./src/main.js');
`;

if (!fs.existsSync(distDir)) {
  console.error('dist/ not found. Run npm run build first.');
  process.exit(1);
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Created dist/main.js');
