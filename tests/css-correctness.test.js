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

/**
 * Read declarations from a rule whose selector exactly matches the requested selector.
 *
 * @param {string} css Complete stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @returns {string} Declaration block text, or an empty string when absent.
 */
function exactBlockFor(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'm'))?.[1] ?? '';
}

/**
 * Read declarations from the last rule whose selector exactly matches the requested selector.
 *
 * Later preset refinement blocks intentionally override early base declarations, so focused
 * style contracts need to inspect the final cascade owner for a selector.
 *
 * @param {string} css Complete stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @returns {string} Final declaration block text, or an empty string when absent.
 */
function lastExactBlockFor(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'gm'))];

  return matches.at(-1)?.[1] ?? '';
}

/**
 * Read a single declaration from a selector block in an authored stylesheet.
 *
 * @param {string} css Complete stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @param {string} property CSS property name.
 * @returns {string} Trimmed declaration value, or an empty string when absent.
 */
function declarationFor(css, selector, property) {
  const declaration = blockFor(css, selector)
    .match(new RegExp(`${property}:\\s*([^;]+);`))?.[1] ?? '';

  return declaration.trim();
}

/**
 * Read the effective declaration from the final exact selector block.
 *
 * @param {string} css Complete stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @param {string} property CSS property name.
 * @returns {string} Trimmed final declaration value, or an empty string when absent.
 */
function lastDeclarationFor(css, selector, property) {
  const declaration = lastExactBlockFor(css, selector)
    .match(new RegExp(`${property}:\\s*([^;]+);`))?.[1] ?? '';

  return declaration.trim();
}

test('parsed authored and minified bundles preserve native descendant combinators', () => {
  const expectedSelector = /\[data-ui\]\[data-theme\]\[data-mode\]\s+:where\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\)/;

  assert.match(parsedCssFor('dist/ui-style-kit.css'), expectedSelector);
  assert.match(parsedCssFor('dist/ui-style-kit.min.css'), expectedSelector);
});

test('parsed authored and minified bundles preserve calc binary operators', () => {
  const expectedAddition = /--deco-radius-xl:\s*calc\(1\.125rem\s+\+\s+\.5rem\)/;
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

test('maximalist sticker foreground consumes its semantic on-accent token', () => {
  const css = cssFor('styles/maximalist.css');

  assert.match(
    blockFor(css, '.max-sticker'),
    /color:\s*var\(--max-on-accent\)/,
    '.max-sticker should consume --max-on-accent'
  );
});

test('maximalist preset follows the pop-collage product reference styling', () => {
  const css = cssFor('styles/maximalist.css');
  const tokenBlock = blockFor(css, '[data-ui="maximalist"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--max-font-display:\s*Impact,/);
  assert.doesNotMatch(exactBlockFor(css, ':root'), /Cooper Black|Baloo 2/);
  assert.match(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--max-theme-bg'), /repeating-linear-gradient/);
  assert.match(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--max-card-bg'), /var\(--max-paper-bg\)/);
  assert.match(tokenBlock, /--max-ink:\s*rgb\(var\(--max-text-rgb\)\);/);
  assert.match(tokenBlock, /--max-paper-wash:\s*rgb\(var\(--max-warning-rgb\) \/ \.12\);/);
  assert.match(tokenBlock, /--max-paper-grain:\s*radial-gradient/);
  assert.match(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--max-card-bg'), /var\(--max-paper-grain\)/);
  assert.equal(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--usk-native-control-min-block-size'), '2.75rem');
  assert.equal(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--usk-native-range-track-radius'), '999px');
  assert.equal(declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--usk-native-progress-track-radius'), '.18rem');
  assert.match(
    declarationFor(css, '[data-ui="maximalist"][data-theme][data-mode]', '--usk-native-range-progress-background'),
    /linear-gradient\(90deg,\s*var\(--max-success\),\s*var\(--max-warning\),\s*var\(--max-danger\),\s*var\(--max-accent\)\)/
  );
  assert.match(blockFor(css, '.max-title'), /text-transform:\s*uppercase/);
  assert.match(blockFor(css, '.max-label'), /text-transform:\s*uppercase/);
  assert.match(blockFor(css, '.max-sticker'), /clip-path:\s*polygon/);
  assert.doesNotMatch(blockFor(css, '.max-badge'), /border-radius:\s*var\(--max-radius-pill\)/);
});

test('minimal SaaS preset follows the calm product reference styling', () => {
  const css = cssFor('styles/minimal-saas.css');
  const tokenBlock = blockFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--saas-radius-md:\s*\.375rem;/);
  assert.match(exactBlockFor(css, ':root'), /--saas-radius-lg:\s*\.5rem;/);
  assert.doesNotMatch(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--saas-theme-bg'), /radial-gradient/);
  assert.doesNotMatch(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--saas-card-bg'), /135deg/);
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--saas-card-bg'), 'var(--saas-surface)');
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--usk-native-panel-padding'), 'var(--saas-space-4)');
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--usk-native-control-min-block-size'), '2.375rem');
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--usk-native-range-track-radius'), '999px');
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--usk-native-progress-track-radius'), '999px');
  assert.equal(declarationFor(css, '[data-ui="minimal-saas"][data-theme][data-mode]', '--usk-native-range-thumb-background'), 'var(--saas-primary)');
  assert.match(tokenBlock, /--saas-control-bg:\s*rgb\(var\(--saas-surface-strong-rgb\) \/ var\(--saas-panel-alpha\)\);/);
  assert.match(tokenBlock, /--saas-shadow-sm:\s*0 1px 2px/);

  assert.match(exactBlockFor(css, '.saas-title'), /font-weight:\s*750/);
  assert.match(blockFor(css, '.saas-button, .saas-icon-button'), /min-height:\s*2\.375rem/);
  assert.match(blockFor(css, '.saas-button, .saas-icon-button'), /font-weight:\s*700/);
  assert.match(blockFor(css, '.saas-input, .saas-textarea, .saas-select'), /min-height:\s*2\.375rem/);
  assert.match(blockFor(css, '.saas-surface, .saas-card, .saas-panel, .saas-toolbar, .saas-table-wrap'), /box-shadow:\s*var\(--saas-shadow-md\)/);
  assert.match(blockFor(css, '.saas-button-secondary'), /background:\s*rgb\(var\(--saas-surface-strong-rgb\) \/ var\(--saas-panel-alpha\)\);/);
  assert.match(blockFor(css, '.saas-button-secondary'), /color:\s*var\(--saas-primary\);/);
  assert.doesNotMatch(exactBlockFor(css, '.saas-table th'), /text-transform:\s*uppercase/);
  assert.match(exactBlockFor(css, '.saas-table th'), /letter-spacing:\s*0/);

  for (const state of ['success', 'warning', 'danger']) {
    assert.match(
      blockFor(css, `.saas-badge-${state}`),
      new RegExp(`background:\\s*rgb\\(var\\(--saas-${state}-rgb\\) / \\.14\\);`),
      `.saas-badge-${state} should use soft status-chip paint`
    );
    assert.match(
      blockFor(css, `.saas-badge-${state}`),
      new RegExp(`color:\\s*var\\(--saas-${state}\\);`),
      `.saas-badge-${state} should keep semantic text emphasis`
    );
  }
});

test('Bento preset follows the soft mosaic product reference styling', () => {
  const css = cssFor('styles/bento.css');
  const tokenBlock = blockFor(css, '[data-ui="bento"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--bento-control-radius:\s*\.75rem;/);
  assert.match(exactBlockFor(css, ':root'), /--bento-tile-radius:\s*1\.5rem;/);
  assert.doesNotMatch(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--bento-card-bg'), /135deg/);
  assert.match(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--bento-card-bg'), /linear-gradient\(145deg,\s*rgb\(var\(--bento-primary-rgb\) \/ \.12\),\s*rgb\(var\(--bento-accent-rgb\) \/ \.07\)\)/);
  assert.match(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--bento-control-bg'), /linear-gradient\(180deg/);
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-radius'), 'var(--bento-control-radius)');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-radius-lg'), 'var(--bento-tile-radius)');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-panel-padding'), 'var(--bento-space-6)');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-control-min-block-size'), '2.75rem');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-range-track-border'), '0 solid transparent');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-range-track-radius'), '999px');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-range-track-size'), '.6rem');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-progress-track-radius'), '999px');
  assert.equal(declarationFor(css, '[data-ui="bento"][data-theme][data-mode]', '--usk-native-progress-size'), '.6rem');
  assert.match(tokenBlock, /--bento-control-bg:\s*linear-gradient\(180deg/);
  assert.match(tokenBlock, /--bento-tile-edge:\s*rgb\(var\(--bento-border-rgb\) \/ calc\(var\(--bento-border-alpha\) \* \.34\)\);/);
  assert.match(tokenBlock, /--bento-tile-shadow:\s*0 \.85rem 2\.2rem/);

  assert.match(blockFor(css, '.bento-title'), /font-family:\s*var\(--bento-font-heading\)/);
  assert.match(exactBlockFor(css, '.bento-title'), /font-weight:\s*800/);
  assert.match(blockFor(css, '.bento-button, .bento-icon-button'), /min-height:\s*2\.75rem/);
  assert.match(blockFor(css, '.bento-input, .bento-textarea, .bento-select'), /min-height:\s*2\.75rem/);
  assert.match(blockFor(css, '.bento-surface, .bento-card, .bento-panel, .bento-toolbar, .bento-table-wrap'), /border:\s*1px solid var\(--bento-tile-edge\)/);
  assert.match(blockFor(css, '.bento-surface, .bento-card, .bento-panel, .bento-toolbar, .bento-table-wrap'), /border-radius:\s*var\(--bento-tile-radius\)/);
  assert.match(blockFor(css, '.bento-surface, .bento-card, .bento-panel, .bento-toolbar, .bento-table-wrap'), /box-shadow:\s*var\(--bento-tile-shadow\)/);
  assert.match(blockFor(css, '.bento-button-secondary'), /background:\s*rgb\(var\(--bento-surface-strong-rgb\) \/ var\(--bento-panel-alpha\)\);/);
  assert.match(blockFor(css, '.bento-button-secondary'), /color:\s*var\(--bento-primary\);/);
  assert.doesNotMatch(exactBlockFor(css, '.bento-table th'), /text-transform:\s*uppercase/);
  assert.match(exactBlockFor(css, '.bento-table th'), /letter-spacing:\s*0/);
  assert.match(blockFor(css, '.bento-alert-danger'), /background:\s*linear-gradient\(145deg,\s*rgb\(var\(--bento-danger-rgb\) \/ \.18\)/);

  for (const state of ['success', 'warning', 'danger']) {
    assert.match(
      blockFor(css, `.bento-badge-${state}`),
      new RegExp(`background:\\s*rgb\\(var\\(--bento-${state}-rgb\\) / \\.14\\);`),
      `.bento-badge-${state} should use soft status-chip paint`
    );
    assert.match(
      blockFor(css, `.bento-badge-${state}`),
      new RegExp(`color:\\s*var\\(--bento-${state}\\);`),
      `.bento-badge-${state} should keep semantic text emphasis`
    );
  }
});

test('Bauhaus preset follows the workshop grid product reference styling', () => {
  const css = cssFor('styles/bauhaus.css');
  const tokenBlock = blockFor(css, '[data-ui="bauhaus"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--bau-radius-md:\s*0;/);
  assert.match(exactBlockFor(css, ':root'), /--bau-rule-width:\s*\.16rem;/);
  assert.match(exactBlockFor(css, ':root'), /--bau-panel-shadow:\s*\.48rem \.48rem 0 rgb\(var\(--bau-text-rgb\) \/ \.84\);/);
  assert.match(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--bau-theme-bg-size'), /var\(--bau-grid-step\)/);
  assert.match(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--bau-theme-bg'), /radial-gradient\(circle at 78% 7rem/);
  assert.match(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--bau-card-bg'), /linear-gradient\(90deg,\s*var\(--bau-primary\) 0 \.9rem/);
  assert.match(tokenBlock, /--bau-structural-ink:\s*rgb\(var\(--bau-text-rgb\)\);/);
  assert.match(tokenBlock, /--bau-border:\s*rgb\(var\(--bau-text-rgb\) \/ \.94\);/);
  assert.match(tokenBlock, /--bau-control-bg:\s*rgb\(var\(--bau-surface-strong-rgb\) \/ var\(--bau-panel-alpha\)\);/);
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-border'), 'var(--bau-border)');
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-radius'), '0');
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-border-width'), '2px');
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-range-track-background'), 'var(--bau-border)');
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-range-thumb-background'), 'var(--bau-primary)');
  assert.equal(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-scrollbar-size'), '1rem');
  assert.match(declarationFor(css, '[data-ui="bauhaus"][data-theme][data-mode]', '--usk-native-progress-value-background'), /repeating-linear-gradient/);
  assert.match(exactBlockFor(css, '.bau-title'), /font-weight:\s*950/);
  assert.match(exactBlockFor(css, '.bau-title'), /text-transform:\s*uppercase/);
  assert.match(exactBlockFor(css, '.bau-input, .bau-textarea, .bau-select'), /border-block-end-width:\s*var\(--bau-rule-heavy\)/);
  assert.match(exactBlockFor(css, '.bau-badge'), /border-radius:\s*0/);
  assert.match(exactBlockFor(css, '.bau-badge'), /text-transform:\s*uppercase/);
  assert.match(exactBlockFor(css, '.bau-nav'), /background:\s*var\(--bau-text\)/);
  assert.match(exactBlockFor(css, '.bau-nav-link'), /text-transform:\s*uppercase/);
  assert.match(exactBlockFor(css, '.bau-progress-bar'), /repeating-linear-gradient/);
  assert.match(exactBlockFor(css, '.bau-alert'), /border-inline-start-width:\s*\.7rem/);
  assert.match(exactBlockFor(css, '.bau-table th'), /background:\s*var\(--bau-primary\)/);
  assert.match(blockFor(css, '.bau-composition::before'), /inset-inline-start:\s*28%/);
  assert.match(blockFor(css, '.bau-composition::after'), /background:\s*var\(--bau-danger\)/);
});

test('tactile preset follows the physical workspace reference styling', () => {
  const css = cssFor('styles/tactile.css');
  const baseTokenBlock = blockFor(css, '[data-ui="tactile"][data-theme][data-mode]');
  const tokenBlock = lastExactBlockFor(css, '[data-ui="tactile"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--tactile-font-display:\s*Georgia,/);
  assert.match(exactBlockFor(css, ':root'), /--tactile-radius-xl:\s*\.6rem;/);
  assert.match(declarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--tactile-theme-bg'), /var\(--tactile-paper-bg\)/);
  assert.match(lastDeclarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--tactile-card-bg'), /var\(--tactile-paper-bg\)/);
  assert.match(baseTokenBlock, /--tactile-paper-wash:\s*rgb\(var\(--tactile-warning-rgb\) \/ \.14\);/);
  assert.match(baseTokenBlock, /--tactile-bevel-highlight:\s*rgb\(var\(--tactile-surface-strong-rgb\) \/ \.82\);/);
  assert.match(baseTokenBlock, /--tactile-bevel-shadow:\s*rgb\(var\(--tactile-text-rgb\) \/ \.24\);/);
  assert.match(declarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--tactile-paper-bg'), /var\(--tactile-paper-wash\)/);
  assert.match(tokenBlock, /--tactile-control-bg:\s*linear-gradient/);
  assert.match(tokenBlock, /--tactile-keyline:\s*rgb\(var\(--tactile-text-rgb\)/);
  assert.match(baseTokenBlock, /--tactile-sidebar-bg:\s*linear-gradient/);
  assert.equal(lastDeclarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--usk-native-control-min-block-size'), '3.05rem');
  assert.equal(lastDeclarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--usk-native-range-track-border'), '2px solid var(--tactile-track-rim)');
  assert.equal(lastDeclarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--usk-native-range-thumb-radius'), '.08rem');
  assert.equal(lastDeclarationFor(css, '[data-ui="tactile"][data-theme][data-mode]', '--usk-native-progress-track-radius'), '0');
  assert.match(tokenBlock, /--tactile-progress-fill:\s*repeating-linear-gradient/);
  assert.match(
    blockFor(css, '.tactile-surface, .tactile-card, .tactile-panel, .tactile-toolbar, .tactile-table-wrap'),
    /box-shadow:\s*var\(--tactile-panel-shadow\)/
  );
  assert.match(tokenBlock, /--tactile-panel-shadow:\s*inset 0 2px 0 var\(--tactile-bevel-highlight\), inset 0 -3px 0 var\(--tactile-bevel-shadow\)/);
  assert.match(lastExactBlockFor(css, '.tactile-title'), /font-family:\s*var\(--tactile-font-display\)/);
  assert.match(lastExactBlockFor(css, '.tactile-title'), /letter-spacing:\s*-\.035em/);
  assert.match(lastExactBlockFor(css, '.tactile-label'), /text-transform:\s*uppercase/);
  assert.match(lastExactBlockFor(css, '.tactile-label'), /letter-spacing:\s*\.12em/);
  assert.match(blockFor(css, '.tactile-button-primary'), /background:\s*var\(--tactile-action-bg\)/);
  assert.match(blockFor(css, '.tactile-button-primary'), /box-shadow:\s*var\(--tactile-button-shadow\)/);
  assert.match(lastExactBlockFor(css, '.tactile-nav'), /background:\s*var\(--tactile-sidebar-bg\)/);
  assert.match(blockFor(css, '.tactile-switch-track'), /background:\s*var\(--tactile-recessed-track\)/);
  assert.match(lastExactBlockFor(css, '.tactile-progress'), /border:\s*2px solid var\(--tactile-track-rim\)/);
  assert.match(lastExactBlockFor(css, '.tactile-progress-bar'), /background:\s*var\(--tactile-progress-fill\)/);
  assert.match(lastExactBlockFor(css, '.tactile-table th'), /background:\s*var\(--tactile-sidebar-bg\)/);
  assert.match(lastExactBlockFor(css, '.tactile-button, .tactile-icon-button'), /clip-path:\s*polygon/);
});

test('Neumorphism preset follows the soft workspace product reference styling', () => {
  const css = cssFor('styles/neumorphism.css');
  const tokenBlock = lastExactBlockFor(css, '[data-ui="neumorphism"][data-theme][data-mode]');

  assert.match(exactBlockFor(css, ':root'), /--neo-radius-xl:\s*2\.25rem;/);
  assert.match(tokenBlock, /--neo-raised-shadow:\s*-\.9rem -\.9rem 1\.75rem var\(--neo-nm-light\), 1rem 1rem 1\.9rem var\(--neo-nm-dark\);/);
  assert.doesNotMatch(tokenBlock, /radial-gradient/);
  assert.match(tokenBlock, /--neo-theme-bg:\s*linear-gradient\(rgb\(var\(--neo-primary-rgb\) \/ \.08\)/);
  assert.match(tokenBlock, /--neo-card-bg:\s*linear-gradient\(rgb\(var\(--neo-primary-rgb\) \/ \.055\)/);
  assert.match(tokenBlock, /--neo-control-bg:\s*linear-gradient\(rgb\(var\(--neo-primary-rgb\) \/ \.025\)/);
  assert.match(tokenBlock, /--usk-native-control-min-block-size:\s*3\.25rem;/);
  assert.match(tokenBlock, /--usk-native-border-width:\s*0;/);
  assert.match(tokenBlock, /--usk-native-range-track-shadow:\s*var\(--neo-inset-shadow\);/);
  assert.match(tokenBlock, /--usk-native-range-thumb-shadow:\s*var\(--neo-button-shadow\);/);
  assert.match(tokenBlock, /--usk-native-progress-track-shadow:\s*var\(--neo-inset-shadow\);/);
  assert.match(lastExactBlockFor(css, '.neo-title'), /font-weight:\s*680/);
  assert.match(lastExactBlockFor(css, '.neo-surface, .neo-card, .neo-panel, .neo-toolbar, .neo-table-wrap'), /box-shadow:\s*var\(--neo-raised-shadow\)/);
  assert.match(lastExactBlockFor(css, '.neo-surface, .neo-card, .neo-panel, .neo-toolbar, .neo-table-wrap'), /border:\s*0 solid transparent/);
  assert.match(lastExactBlockFor(css, '.neo-well, .neo-inset'), /box-shadow:\s*var\(--neo-inset-shadow\)/);
  assert.match(lastExactBlockFor(css, '.neo-input, .neo-textarea, .neo-select'), /box-shadow:\s*var\(--neo-control-shadow\)/);
  assert.match(lastExactBlockFor(css, '.neo-button-primary'), /box-shadow:\s*var\(--neo-button-primary-shadow\)/);
  assert.match(lastExactBlockFor(css, '.neo-progress'), /box-shadow:\s*var\(--neo-inset-shadow\)/);
  assert.match(lastExactBlockFor(css, '.neo-table'), /border-collapse:\s*separate/);
  assert.match(
    blockFor(css, '[data-ui="neumorphism"][data-theme][data-mode] :where(input[type="file"])::file-selector-button'),
    /background:\s*var\(--neo-control-bg\)/
  );
});

test('Retrofuturism preset follows the atomic appliance reference styling', () => {
  const css = cssFor('styles/retrofuturism.css');
  const rootBlock = exactBlockFor(css, ':root');
  const tokenBlock = lastExactBlockFor(css, '[data-ui="retrofuturism"][data-theme][data-mode]');

  assert.match(rootBlock, /--retro-font-display:\s*"Arial Narrow",\s*"Aptos Narrow",\s*Bahnschrift,/);
  assert.doesNotMatch(rootBlock, /Orbitron|Eurostile|Bank Gothic/);
  assert.match(tokenBlock, /--retro-enamel-bg:\s*linear-gradient/);
  assert.match(tokenBlock, /--retro-metal-rim:\s*linear-gradient/);
  assert.match(tokenBlock, /--retro-recess-bg:\s*linear-gradient/);
  assert.match(tokenBlock, /--retro-progress-fill:\s*repeating-linear-gradient/);
  assert.equal(lastDeclarationFor(css, '[data-ui="retrofuturism"][data-theme][data-mode]', '--usk-native-control-min-block-size'), '2.75rem');
  assert.equal(lastDeclarationFor(css, '[data-ui="retrofuturism"][data-theme][data-mode]', '--usk-native-range-track-size'), '.28rem');
  assert.equal(lastDeclarationFor(css, '[data-ui="retrofuturism"][data-theme][data-mode]', '--usk-native-range-thumb-border'), '3px double var(--retro-metal-edge)');
  assert.match(
    lastDeclarationFor(css, '[data-ui="retrofuturism"][data-theme][data-mode]', '--usk-native-progress-value-background'),
    /var\(--retro-progress-fill\)/
  );
  assert.equal(lastDeclarationFor(css, '.retro-page', 'background-image'), 'none');
  assert.match(lastDeclarationFor(css, '.retro-page', 'box-shadow'), /inset/);
  assert.match(lastExactBlockFor(css, '.retro-title'), /text-transform:\s*none/);
  assert.match(lastExactBlockFor(css, '.retro-label'), /text-transform:\s*uppercase/);
  assert.match(lastExactBlockFor(css, '.retro-button, .retro-icon-button'), /border:\s*3px double var\(--retro-metal-edge\)/);
  assert.match(lastExactBlockFor(css, '.retro-button.retro-button-cut, .retro-button-cut'), /clip-path:\s*inset\(0 round var\(--retro-radius-pill\)\)/);
  assert.match(lastExactBlockFor(css, '.retro-input, .retro-textarea, .retro-select'), /box-shadow:\s*var\(--retro-recess-shadow\)/);
  assert.match(lastExactBlockFor(css, '.retro-progress-bar'), /background:\s*var\(--retro-progress-fill\)/);
  assert.match(lastExactBlockFor(css, '.retro-table th'), /font-family:\s*var\(--retro-font-control\)/);
});

test('remaining presets expose template-specific CSS signatures instead of arbitrary token drift', () => {
  const contracts = [
    ['brutalism', [
      /\.brutal-title\s*\{[^}]*font-weight:\s*1000/,
      /\.brutal-progress\s*\{[^}]*repeating-linear-gradient/,
      /\.brutal-table th\s*\{[^}]*background:\s*var\(--brutal-text\)/
    ]],
    ['cyberpunk', [
      /\.cyber-card, \.cyber-panel\s*\{[^}]*clip-path:\s*polygon/,
      /\.cyber-button, \.cyber-icon-button\s*\{[^}]*clip-path:\s*polygon/,
      /\.cyber-progress-bar\s*\{[^}]*repeating-linear-gradient/
    ]],
    ['y2k', [
      /\.y2k-title\s*\{[^}]*font-family:\s*Impact/,
      /\.y2k-button, \.y2k-icon-button\s*\{[^}]*border:\s*1px outset/,
      /\.y2k-progress-bar\s*\{[^}]*repeating-linear-gradient/
    ]],
    ['retro-glass', [
      /\.rg-card, \.rg-panel\s*\{[^}]*backdrop-filter:\s*blur\(14px\) saturate\(135%\)/,
      /\.rg-nav\s*\{[^}]*linear-gradient\(180deg, var\(--rg-primary-hover\)/,
      /\.rg-callout-bar\s*\{[^}]*rgb\(var\(--rg-text-rgb\)/
    ]],
    ['editorial-luxe', [
      /\.luxe-title\s*\{[^}]*font-weight:\s*500/,
      /\.luxe-progress\s*\{[^}]*height:\s*\.22rem/,
      /\.luxe-table th\s*\{[^}]*background:\s*transparent/
    ]],
    ['organic-modern', [
      /--organic-hairline:\s*rgb\(var\(--organic-primary-rgb\)/,
      /\.organic-table-wrap\s*\{[^}]*border-radius:\s*\.9rem 1\.25rem \.8rem 1\.4rem/,
      /\.organic-progress-bar\s*\{[^}]*border-radius:\s*46% 54% 48% 52%/
    ]],
    ['industrial-utility', [
      /\.utility-card, \.utility-panel\s*\{[^}]*border:\s*3px double/,
      /\.utility-button, \.utility-icon-button\s*\{[^}]*border:\s*2px outset/,
      /\.utility-progress\s*\{[^}]*border:\s*2px inset/
    ]],
    ['technical-blueprint', [
      /\.blueprint-well, \.blueprint-inset\s*\{[^}]*repeating-linear-gradient/,
      /\.blueprint-button, \.blueprint-icon-button\s*\{[^}]*background:\s*transparent/,
      /\.blueprint-table th\s*\{[^}]*repeating-linear-gradient/
    ]],
    ['art-deco', [
      /\.deco-title\s*\{[^}]*letter-spacing:\s*\.12em/,
      /\.deco-button, \.deco-icon-button\s*\{[^}]*clip-path:\s*polygon/,
      /\.deco-table-wrap\s*\{[^}]*inset 0 0 0 4px var\(--deco-border\)/
    ]],
    ['clay', [
      /--clay-slab-bg:\s*linear-gradient/,
      /--clay-carved-shadow:\s*inset/,
      /\.clay-table th\s*\{[^}]*background:\s*var\(--clay-raised-bg\)/
    ]],
    ['data-terminal', [
      /\.terminal-title,\s*\.terminal-heading[^}]*font-family:\s*var\(--terminal-font-mono\)/,
      /\.terminal-button,\s*\.terminal-icon-button\s*\{[^}]*font-family:\s*var\(--terminal-font-mono\)/,
      /\.terminal-progress-bar\s*\{[^}]*repeating-linear-gradient/
    ]],
    ['paper-editorial', [
      /\.paper-title\s*\{[^}]*letter-spacing:\s*\.025em/,
      /\.paper-table-wrap\s*\{[^}]*repeating-linear-gradient/,
      /\.paper-progress-bar\s*\{[^}]*repeating-linear-gradient/
    ]],
    ['neo-noir', [
      /\.noir-button, \.noir-icon-button, \.noir-input, \.noir-textarea, \.noir-select\s*\{[^}]*clip-path:\s*polygon/,
      /\.noir-table-wrap\s*\{[^}]*linear-gradient\(145deg/,
      /\.noir-progress-bar\s*\{[^}]*repeating-linear-gradient/
    ]]
  ];

  for (const [preset, signatures] of contracts) {
    const css = cssFor(`styles/${preset}.css`);
    for (const signature of signatures) {
      assert.match(css, signature, `${preset} should retain ${signature}`);
    }
  }
});
