import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadReferenceController } from './helpers/reference-controller.js';
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

test('reference toolbar uses semantic fields without demo platform indicator overrides', () => {
  const root = stylesheet('demo/demo.css');
  for (const entry of ['demo/reference.html']) {
    const html = fs.readFileSync(new URL(`../${entry}`, import.meta.url), 'utf8');
    assert.match(html, /class="demo-controls usk-toolbar[^"]*"/);
    for (const id of ['uiSelect', 'themeSelect', 'modeSelect']) {
      assert.match(html, new RegExp(`<select id="${id}" class="usk-select"`), `${entry}: ${id}`);
    }
  }

  const base = declarations(root, '.demo-controls .usk-select');
  assert.equal(base.size, 0, 'The library alone owns select paint and its native indicator');
  const presetSpecificOverrides = [];
  root.walkRules((rule) => {
    if (rule.selectors.some((selector) => selector.startsWith('[data-ui=') && selector.includes('.demo-controls'))) {
      presetSpecificOverrides.push(rule.selector);
    }
  });
  assert.deepEqual(presetSpecificOverrides, []);
});

test('Maximalist medallions use scalable artwork for the star, check and arrow only', () => {
  const context = loadReferenceController({
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

test('native forms use public Layout flow without demo component overrides', () => {
  const source = fs.readFileSync(new URL('../demo/studio/reference.js', import.meta.url), 'utf8');
  assert.match(source, /demo-native-sample ly-span-full" data-testid="native-forms"/);
  assert.match(source, /demo-form-grid ly-grid/);
  assert.equal(declarations(stylesheet('demo/demo.css'), '.demo-form-grid').size, 0);
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
  const busySelectors = ['.max-button[aria-busy="true"]::after', '.max-icon-button[aria-busy="true"]::after', native];
  const firstBusy = declarations(root, busySelectors[0]);
  for (const selector of busySelectors) {
    const busy = declarations(root, selector);
    for (const property of ['background', 'border', 'border-radius', 'box-shadow', 'animation', 'border-width', 'flex-shrink', 'clip-path']) {
      assert.equal(busy.get(property), firstBusy.get(property), `${selector}: ${property}`);
    }
    assert.equal(busy.get('border-width'), '.12em');
    assert.equal(busy.get('flex-shrink'), '0');
    assert.equal(busy.get('clip-path'), 'none');
  }
  assert.match(firstBusy.get('background'), /conic-gradient\(currentColor/, 'Button loaders follow readable button ink');
  assert.match(spinner.get('background'), /var\(--max-accent\)/, 'Standalone loader keeps its palette accent');
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
