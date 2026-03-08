#!/usr/bin/env node
/**
 * Entry for Hostinger (Node.js). Build first: npm run build
 * Then start: node server.js or npm run start:prod
 */
const path = require('path');
require('dotenv/config');
require(path.join(__dirname, 'dist', 'main.js'));
