#!/usr/bin/env node
/**
 * Entry file for Hostinger (and other hosts that expect server.js).
 * The real app is server/index.ts (Express + Next.js), run via npm start (tsx).
 */
const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.resolve(__dirname));
execSync('npm start', {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});
