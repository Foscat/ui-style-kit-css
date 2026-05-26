#!/usr/bin/env node

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const runner = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node scripts/playwright-cli.js <playwright-args...>');
  process.exit(1);
}

const env = {
  ...process.env,
  PWTEST_CACHE_DIR: process.env.PWTEST_CACHE_DIR || path.join(rootDir, '.playwright-cache'),
  PLAYWRIGHT_BROWSERS_PATH:
    process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(rootDir, '.playwright-browsers')
};

const result = spawnSync(runner, ['playwright', ...args], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32'
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
