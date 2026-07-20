import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('build pins the Lightning CSS parser-minifier exactly', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const packageLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));

  // Native-backed build tooling stays reproducible only when the package and lockfile agree exactly.
  assert.equal(packageJson.devDependencies.lightningcss, '1.33.0');
  assert.equal(packageLock.packages[''].devDependencies.lightningcss, '1.33.0');
  assert.equal(packageLock.packages['node_modules/lightningcss'].version, '1.33.0');
});

test('public API validation pins CSS Tree exactly', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const packageLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));

  // The AST contract must use the same parser version locally and in release automation.
  assert.equal(packageJson.devDependencies['css-tree'], '3.2.1');
  assert.equal(packageLock.packages[''].devDependencies['css-tree'], '3.2.1');
  assert.equal(packageLock.packages['node_modules/css-tree'].version, '3.2.1');
});

test('build delegates minification to Lightning CSS', () => {
  const buildScript = fs.readFileSync(path.join(rootDir, 'scripts', 'build.mjs'), 'utf8');

  assert.match(buildScript, /from 'lightningcss'/);
  assert.match(buildScript, /transform\(\{/);
  assert.match(buildScript, /minify:\s*true/);
  assert.doesNotMatch(buildScript, /replace\(\/\\s\+\/g/);
});

test('minified bundles preserve the release banner', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const expectedBanner = `/*!\n * UI Style Kit CSS v${packageJson.version}\n`;

  for (const fileName of [
    'ui-style-kit.min.css',
    'ui-style-kit.visual.min.css',
    'ui-style-kit.with-bridge.min.css'
  ]) {
    const css = fs.readFileSync(path.join(rootDir, 'dist', fileName), 'utf8');
    assert.ok(css.startsWith(expectedBanner), `${fileName} should retain the v${packageJson.version} banner`);
  }
});
