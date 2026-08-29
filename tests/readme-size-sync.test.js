import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncReadmeBundleSizes } from '../scripts/sync-readme-sizes.mjs';

test('syncReadmeBundleSizes refreshes tracked raw and gzip values without altering labels', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'usk-readme-size-'));
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  fs.mkdirSync(path.join(root, 'styles'), { recursive: true });

  const payload = 'x'.repeat(2500);
  fs.writeFileSync(path.join(root, 'dist', 'ui-style-kit.min.css'), payload);
  fs.writeFileSync(path.join(root, 'styles', 'theme-colors.css'), payload + payload);
  fs.writeFileSync(path.join(root, 'README.md'), `
| Import | Raw | Gzip | Best for |
|---|---:|---:|---|
| \`ui-style-kit-css/dist/ui-style-kit.min.css\` | ~1 KB | ~1 KB | Compatible runtime UI-system switchers and demos |
| \`ui-style-kit-css/theme-colors.css\` | ~1 KB | ~1 KB | Shared color schemes for standalone style imports |
`);

  syncReadmeBundleSizes(root, [
    ['ui-style-kit-css/dist/ui-style-kit.min.css', 'dist/ui-style-kit.min.css'],
    ['ui-style-kit-css/theme-colors.css', 'styles/theme-colors.css']
  ]);

  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /ui-style-kit-css\/dist\/ui-style-kit\.min\.css` \| ~2 KB \| ~0 KB \| Compatible runtime UI-system switchers and demos/);
  assert.match(readme, /ui-style-kit-css\/theme-colors\.css` \| ~5 KB \| ~0 KB \| Shared color schemes for standalone style imports/);
});
