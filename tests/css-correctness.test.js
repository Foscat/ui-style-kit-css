import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function cssFor(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function parsedCssFor(relativePath) {
  const result = transform({
    filename: relativePath,
    code: Buffer.from(cssFor(relativePath)),
    minify: false
  });

  assert.deepEqual(result.warnings, [], `${relativePath} should parse without warnings`);
  return result.code.toString();
}

function blockFor(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escapedSelector}[^{}]*\\{([\\s\\S]*?)\\}`, 'm'))?.[1] ?? '';
}

test('parsed authored and minified bundles preserve native descendant combinators', () => {
  const expectedSelector = /\[data-ui\]\[data-theme\]\[data-mode\]\s+:where\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\)/;

  assert.match(parsedCssFor('dist/ui-style-kit.css'), expectedSelector);
  assert.match(parsedCssFor('dist/ui-style-kit.min.css'), expectedSelector);
});

test('parsed authored and minified bundles preserve calc binary operators', () => {
  const expectedAddition = /--saas-radius-xl:\s*calc\(1\.125rem\s+\+\s+\.5rem\)/;
  const expectedSubtraction = /left:\s*calc\(100%\s+-\s+1\.56rem\)/;

  for (const relativePath of ['dist/ui-style-kit.css', 'dist/ui-style-kit.min.css']) {
    const css = parsedCssFor(relativePath);
    assert.match(css, expectedAddition);
    assert.match(css, expectedSubtraction);
  }
});

test('native pseudo-elements remain outside matches-any selector arguments', () => {
  const css = cssFor('styles/native-elements.css');

  assert.match(
    css,
    /\[data-ui\]\[data-theme\]\[data-mode\] :where\(input\[type="file"\]\)::file-selector-button/
  );
  assert.match(
    css,
    /\[data-ui\]\[data-theme\]\[data-mode\] :where\(dialog\)::backdrop/
  );
  assert.doesNotMatch(css, /:where\([^)]*::(?:file-selector-button|backdrop)/);
});

test('lean preset status surfaces consume their semantic foreground tokens', () => {
  const presets = [
    ['brutalism', 'brutal'],
    ['cyberpunk', 'cyber'],
    ['y2k', 'y2k'],
    ['retro-glass', 'rg']
  ];

  for (const [fileName, prefix] of presets) {
    const css = cssFor(`styles/${fileName}.css`);
    const declarations = [
      [`.${prefix}-button-danger`, `${prefix}-on-danger`],
      [`.${prefix}-badge-success`, `${prefix}-on-success`],
      [`.${prefix}-badge-warning`, `${prefix}-on-warning`],
      [`.${prefix}-badge-danger`, `${prefix}-on-danger`]
    ];

    if (prefix === 'brutal') declarations.push(['.brutal-tooltip', 'brutal-on-warning']);

    for (const [selector, token] of declarations) {
      assert.match(
        blockFor(css, selector),
        new RegExp(`color:\\s*var\\(--${token}\\)`),
        `${selector} should consume --${token}`
      );
    }
  }
});
