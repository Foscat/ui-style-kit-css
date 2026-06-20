import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactHeadTag() {
  try {
    return execFileSync('git', ['describe', '--tags', '--exact-match', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function hasWorkingTreeChanges() {
  try {
    return execFileSync('git', ['status', '--short'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim() !== '';
  } catch {
    return true;
  }
}

function assertFileExists(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
}

test('package entry points point to dist output', () => {
  assert.equal(packageJson.main, 'dist/ui-style-kit.css');
  assert.equal(packageJson.style, 'dist/ui-style-kit.css');
  assert.equal(packageJson.unpkg, 'dist/ui-style-kit.min.css');
  assert.equal(packageJson.jsdelivr, 'dist/ui-style-kit.min.css');

  assertFileExists(packageJson.main);
  assertFileExists(packageJson.unpkg);
});

test('export targets map to real files', () => {
  for (const [exportPath, targetPath] of Object.entries(packageJson.exports || {})) {
    assert.equal(typeof targetPath, 'string', `Expected string export target for ${exportPath}`);
    assertFileExists(targetPath.replace(/^\.\//, ''));
  }
});

test('dist CSS contains expected style system markers', () => {
  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');

  const uiNames = [
    'minimal-saas',
    'bento',
    'maximalist',
    'bauhaus',
    'tactile',
    'neumorphism',
    'retrofuturism',
    'brutalism',
    'cyberpunk',
    'y2k',
    'retro-glass'
  ];

  for (const uiName of uiNames) {
    assert.match(css, new RegExp(`\\[data-ui="${uiName}"\\]`));
    assert.match(minCss, new RegExp(`\\[data-ui="?${uiName}"?\\]`));
  }
});

test('package files include required publish assets', () => {
  const requiredFiles = ['dist', 'styles', 'README.md', 'LICENSE'];
  for (const item of requiredFiles) {
    assert.ok(packageJson.files.includes(item), `package.json files[] should include ${item}`);
  }
});

test('release automation scripts are exposed', () => {
  const requiredScripts = [
    'lint',
    'build',
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
    assert.equal(typeof packageJson.scripts?.[scriptName], 'string', `Missing script: ${scriptName}`);
    assert.notEqual(packageJson.scripts[scriptName].trim(), '', `Script should not be empty: ${scriptName}`);
  }
});

test('package metadata is aligned for the release version', () => {
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[''].version, packageJson.version);
  assert.deepEqual(packageJson.dependencies || {}, {});
  assert.deepEqual(packageLock.packages[''].dependencies || {}, {});

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  assert.match(css, new RegExp(`UI Style Kit CSS v${escapeRegExp(packageJson.version)}`));
});

test('exact release tag at HEAD matches package version', () => {
  // Release prep can happen on the previous tagged commit before the new tag exists.
  if (hasWorkingTreeChanges()) return;

  const tag = exactHeadTag();
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) return;

  assert.equal(tag, `v${packageJson.version}`);
});

test('interactive surface bridge is exported and available as an opt-in bundle', () => {
  assert.equal(
    packageJson.exports['./interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );
  assert.equal(
    packageJson.exports['./styles/interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );

  assertFileExists('styles/interactive-surface-bridge.css');

  assert.equal(
    packageJson.exports['./with-bridge'],
    './dist/ui-style-kit.with-bridge.css'
  );
  assert.equal(
    packageJson.exports['./dist/ui-style-kit.with-bridge.min.css'],
    './dist/ui-style-kit.with-bridge.min.css'
  );

  assertFileExists('dist/ui-style-kit.with-bridge.css');
  assertFileExists('dist/ui-style-kit.with-bridge.min.css');

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');
  const withBridgeCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.with-bridge.css'), 'utf8');
  const withBridgeMinCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.with-bridge.min.css'), 'utf8');

  assert.doesNotMatch(css, /--interactive-surface-border-width/);
  assert.doesNotMatch(minCss, /--interactive-surface-border-width/);
  assert.match(withBridgeCss, /--interactive-surface-border-width/);
  assert.match(withBridgeMinCss, /--interactive-surface-border-width/);
});

test('published CSS import targets are resolvable', () => {
  const importTargets = [
    '.',
    './minimal-saas.css',
    './styles/cyberpunk.css',
    './interactive-surface-bridge',
    './with-bridge.css'
  ];

  for (const exportPath of importTargets) {
    const target = packageJson.exports[exportPath];
    assert.equal(typeof target, 'string', `Missing export: ${exportPath}`);
    assertFileExists(target.replace(/^\.\//, ''));
  }
});
