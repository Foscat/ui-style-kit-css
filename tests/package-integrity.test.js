const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

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
    assert.match(minCss, new RegExp(`\\[data-ui=${uiName}\\]`));
  }
});

test('package files include required publish assets', () => {
  const requiredFiles = ['dist', 'styles', 'README.md', 'LICENSE'];
  for (const item of requiredFiles) {
    assert.ok(packageJson.files.includes(item), `package.json files[] should include ${item}`);
  }
});

test('interactive surface bridge is exported and bundled', () => {
  assert.equal(
    packageJson.exports['./interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );
  assert.equal(
    packageJson.exports['./styles/interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );

  assertFileExists('styles/interactive-surface-bridge.css');

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  assert.match(css, /\.interactive-surface/);
});
