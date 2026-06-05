import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const required = [
  'dist/ui-style-kit.css',
  'dist/ui-style-kit.min.css',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'STYLE-MAP.md',
  'styles/interactive-surface-bridge.css'
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
}
if (pkg.dependencies && Object.keys(pkg.dependencies).length) {
  throw new Error('CSS-only consumer package should not have runtime dependencies.');
}
if (lock.version !== pkg.version || lock.packages['']?.version !== pkg.version) {
  throw new Error(`package-lock.json version must match package.json version ${pkg.version}.`);
}
if (lock.packages['']?.dependencies && Object.keys(lock.packages[''].dependencies).length) {
  throw new Error('package-lock.json root package should not have runtime dependencies.');
}

const requiredScripts = [
  'build',
  'lint',
  'test',
  'test:unit',
  'test:e2e',
  'test:e2e:install:ci',
  'check:contrast',
  'check:package',
  'check',
  'pack:dry-run'
];
for (const scriptName of requiredScripts) {
  if (!pkg.scripts?.[scriptName]) throw new Error(`Missing script: ${scriptName}`);
}

const requiredExports = [
  './dist/ui-style-kit.css',
  './dist/ui-style-kit.min.css',
  './styles/minimal-saas.css',
  './cyberpunk.css',
  './styles/interactive-surface-bridge.css',
  './interactive-surface-bridge'
];
for (const key of requiredExports) {
  if (!pkg.exports[key]) throw new Error(`Missing export: ${key}`);
}

for (const [key, target] of Object.entries(pkg.exports)) {
  if (key === './package.json') continue;
  if (!fs.existsSync(path.join(root, target.replace(/^\.\//, '')))) {
    throw new Error(`Export target does not exist: ${key} -> ${target}`);
  }
}

const css = fs.readFileSync(path.join(root, 'dist/ui-style-kit.css'), 'utf8');
if (!css.includes(`UI Style Kit CSS v${pkg.version}`)) {
  throw new Error(`dist/ui-style-kit.css banner must include version ${pkg.version}.`);
}
if (!css.includes('--interactive-surface-border-width')) {
  throw new Error('dist/ui-style-kit.css must bundle the interactive surface bridge.');
}

console.log('Package integrity check passed.');
