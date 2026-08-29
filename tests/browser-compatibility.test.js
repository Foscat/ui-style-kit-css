import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const expectedBrowsers = [
  'last 2 Chrome major versions',
  'last 2 Edge major versions',
  'last 2 Firefox major versions',
  'Safari >= 16',
  'iOS >= 16',
  'not dead'
];

test('package metadata declares the release browser contract and compatibility gate', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

  assert.deepEqual(packageJson.browserslist, expectedBrowsers);
  assert.equal(packageJson.devDependencies.browserslist, '4.28.8');
  assert.equal(packageJson.scripts['check:compat'], 'node scripts/check-browser-compatibility.mjs');
  assert.match(packageJson.scripts.check, /npm run check:compat/);
});

test('compatibility checker detects unsupported or unguarded generated CSS', async () => {
  const compatibilityModule = await import('../scripts/check-browser-compatibility.mjs');

  assert.equal(typeof compatibilityModule.collectCompatibilityViolations, 'function');

  const violations = compatibilityModule.collectCompatibilityViolations(`
    .sample {
      backdrop-filter: blur(1rem);
      inline-size: fit-content;
      text-wrap: balance;
      forced-color-adjust: auto;
      border-color: color-mix(in srgb, red, transparent);
    }
  `, 'fixture.css');
  const codes = new Set(violations.map(({ code }) => code));

  for (const code of ['backdrop-prefix', 'fit-content-inline-size', 'unguarded-text-wrap', 'unguarded-forced-color-adjust', 'unguarded-color-mix']) {
    assert.equal(codes.has(code), true, `fixture should report ${code}`);
  }
});

test('authored CTA sizing avoids obsolete fit-content diagnostics', () => {
  for (const relativeFile of fs.readdirSync(path.join(rootDir, 'styles')).filter((file) => file.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(rootDir, 'styles', relativeFile), 'utf8');
    assert.doesNotMatch(css, /inline-size:\s*fit-content/, `${relativeFile} should use intrinsic action sizing`);
  }
});
