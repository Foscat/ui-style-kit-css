import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Reads maintained release documentation without scanning historical design records.
 * @param {string} file Repository-relative Markdown path.
 * @returns {string} UTF-8 document contents.
 */
function read(file) {
  return fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
}

test('v2.4 release docs describe optional native palettes and the unified demo', () => {
  for (const file of ['README.md', 'wiki/Home.md', 'wiki/Theming-Model.md', 'wiki/Installation-and-Setup.md']) {
    const content = read(file);
    assert.match(content, /native palette|native.*colors/i, file);
    assert.match(content, /removeAttribute\("data-theme"\)|omit[^\n]*`data-theme`/i, file);
  }
  assert.match(read('README.md'), /docs\/DEMO-SHOWCASE\.md/);
  assert.match(read('wiki/Home.md'), /\[Demo Showcase\]\(Demo-Showcase\)/);
  assert.match(read('wiki/_Sidebar.md'), /\[Demo Showcase\]\(Demo-Showcase\)/);
  assert.doesNotMatch(read('README.md'), /~26-28 KB/);
  assert.match(read('docs/TOKENS.md'), /Native.*`--<prefix>-\*-rgb`/);
  assert.doesNotMatch(read('docs/TOKENS.md'), /Both kinds export `--usk-/);
  assert.doesNotMatch(read('STYLE-MAP.md'), /Native selectors stay generic under `\[data-ui\]\[data-theme\]\[data-mode\]`/);
});
