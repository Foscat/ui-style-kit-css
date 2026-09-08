import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import postcss from 'postcss';

/**
 * Parses authored CSS for offline contracts; this does not emulate browser layout.
 * @param {string} path Repository-relative stylesheet path.
 * @returns {import('postcss').Root} Parsed stylesheet.
 */
function stylesheet(path) {
  return postcss.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
}

/**
 * Collects declarations from rules with the exact requested selector in source order.
 * @param {import('postcss').Root} root Parsed stylesheet.
 * @param {string} selector Exact selector, including any pseudo-element.
 * @returns {Map<string, string>} Authored declaration values.
 */
function declarations(root, selector) {
  const result = new Map();
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls((decl) => result.set(decl.prop, decl.value));
    }
  });
  return result;
}

test('demo toolbar keeps one dropdown indicator per select treatment', () => {
  const root = stylesheet('demo/demo.css');
  const base = declarations(root, '.demo-controls select');
  assert.equal(base.get('appearance'), 'auto');
  assert.equal(base.get('-webkit-appearance'), 'auto');
  assert.equal(base.get('background-image'), 'none');
  assert.equal(base.get('padding-inline-end'), '2rem');
  const presetIndicatorSelectors = new Set([
    '[data-ui="art-deco"] .demo-controls select',
    '[data-ui="clay"] .demo-controls select',
    '[data-ui="data-terminal"] .demo-controls select'
  ]);
  root.walkRules((rule) => {
    if (!rule.selectors.some((selector) => selector.endsWith('.demo-controls select'))) return;
    rule.walkDecls((decl) => {
      if (decl.prop.endsWith('appearance')) {
        assert.equal(decl.value, presetIndicatorSelectors.has(rule.selector) ? 'none' : 'auto', rule.selector);
      }
      if (decl.prop === 'background-image') {
        assert.ok(
          decl.value === 'none'
            || decl.value === 'var(--clay-grain-image)'
            || decl.value.startsWith('var(--usk-native-select-indicator-image)'),
          rule.selector
        );
      }
    });
  });
});

test('Maximalist medallions use scalable artwork for the star, check and arrow only', () => {
  const context = vm.createContext({
    URL,
    URLSearchParams,
    location: { pathname: '/demo/index.html' },
    window: {
      UI_STYLE_KIT_MANIFEST: JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8')),
      location: { search: '' }
    },
    document: {
      getElementById: () => ({ value: 'light', dataset: { defaultHref: 'dist/ui-style-kit.css' } })
    }
  });
  vm.runInContext(fs.readFileSync(new URL('../demo/demo-icons.js', import.meta.url), 'utf8'), context);
  const source = fs.readFileSync(new URL('../demo/demo.js', import.meta.url), 'utf8');
  vm.runInContext(source.slice(0, source.lastIndexOf('\nsyncManifestSelectOptions();')), context);

  for (const [name, glyph] of [['star', '★'], ['check', '✓'], ['arrow-right', '→']]) {
    const svg = context.window.UI_STYLE_KIT_ICONS[name];
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.equal(context.renderMedallionIcon('maximalist', name, glyph), svg);
    assert.equal(context.renderMedallionIcon('minimal-saas', name, glyph), glyph);
    assert.equal(context.renderMedallionIcon('clay', name, glyph), svg);
  }
  assert.equal(context.renderMedallionIcon('maximalist', 'diamond', '◆'), '◆');

  const root = stylesheet('styles/maximalist.css');
  const star = declarations(root, '.max-card-service > .max-icon-medallion :where(svg)');
  assert.equal(star.get('inline-size'), '1.75rem');
  assert.equal(star.get('block-size'), '1.75rem');
  for (const selector of [
    '.max-feature-item > .max-icon-medallion > :where(svg)',
    '.max-callout-bar > .max-icon-medallion > :where(svg)'
  ]) {
    assert.ok(Number(declarations(root, selector).get('stroke-width')) >= 3, selector);
  }
});

test('Maximalist native forms get a full responsive row instead of stranding a neighbor', () => {
  const root = stylesheet('demo/demo.css');
  const forms = declarations(root, '[data-ui="maximalist"] .demo-native-grid > [data-testid="native-forms"]');
  assert.equal(forms.get('grid-column'), '1 / -1');
  assert.equal(forms.has('order'), false, 'Keep the native DOM and keyboard order');
  assert.equal(
    declarations(root, '.demo-form-grid').get('grid-template-columns'),
    'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))'
  );
});

test('Maximalist range alignment accounts for the track border without offsetting Firefox', () => {
  const root = stylesheet('styles/maximalist.css');
  const control = '[data-ui="maximalist"][data-mode] :where(input[type="range"])';
  const tokens = declarations(root, '[data-ui="maximalist"][data-mode]');
  const webkitThumb = declarations(root, `${control}::-webkit-slider-thumb`);
  assert.equal(
    webkitThumb.get('margin-block-start'),
    'calc((var(--usk-native-range-track-size) - var(--usk-native-range-thumb-size)) / 2 - var(--usk-native-border-width))'
  );
  assert.equal(tokens.get('--usk-native-range-track-border'), 'var(--usk-native-border-width) solid var(--max-ink)');
  for (const pseudo of ['::-webkit-slider-runnable-track', '::-webkit-slider-thumb', '::-moz-range-track', '::-moz-range-thumb']) {
    assert.equal(declarations(root, `${control}${pseudo}`).get('box-sizing'), 'border-box', pseudo);
  }
  assert.equal(declarations(root, `${control}::-moz-range-thumb`).has('margin-block-start'), false);
});

test('Maximalist authored and native busy buttons share the style spinner and motion policy', () => {
  const root = stylesheet('styles/maximalist.css');
  const spinner = declarations(root, '.max-spinner');
  const native = '[data-ui="maximalist"] :where(button[aria-busy="true"], input[type="button"][aria-busy="true"], input[type="submit"][aria-busy="true"], input[type="reset"][aria-busy="true"])::after';
  for (const selector of ['.max-button[aria-busy="true"]::after', '.max-icon-button[aria-busy="true"]::after', native]) {
    const busy = declarations(root, selector);
    for (const property of ['background', 'border', 'border-radius', 'box-shadow', 'animation']) {
      assert.equal(busy.get(property), spinner.get(property), `${selector}: ${property}`);
    }
    assert.equal(busy.get('border-width'), '.12em');
    assert.equal(busy.get('flex-shrink'), '0');
    assert.equal(busy.get('clip-path'), 'none');
  }
  assert.match(spinner.get('background'), /var\(--max-accent\)/, 'Loader paint follows the active palette');
  let reducedMotion = false;
  root.walkAtRules('media', (rule) => {
    if (rule.params !== '(prefers-reduced-motion: reduce)') return;
    rule.walkDecls('animation-iteration-count', (decl) => {
      if (decl.parent.selector.includes('[data-ui="maximalist"] *::after')) {
        reducedMotion = decl.important && decl.value === '1';
      }
    });
  });
  assert.ok(reducedMotion, 'The native and classed pseudo-elements retain reduced-motion coverage');
});
