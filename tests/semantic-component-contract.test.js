import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse, walk } from 'css-tree';

import {
  semanticComponentMarkup,
  semanticRuntimeCases
} from './fixtures/semantic-component-cases.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

const expectedSemanticComponentApi = {
  presetSwitchAttribute: 'data-ui',
  selectorsByRole: {
    button: [
      { selector: '.ui-button', sourceSuffix: 'button' },
      { selector: '.ui-icon-button', sourceSuffix: 'icon-button' }
    ],
    card: [
      { selector: '.ui-card', sourceSuffix: 'card' }
    ],
    form: [
      { selector: '.ui-field', sourceSuffix: 'field' },
      { selector: '.ui-label', sourceSuffix: 'label' },
      { selector: '.ui-help-text', sourceSuffix: 'help-text' },
      { selector: '.ui-input', sourceSuffix: 'input' },
      { selector: '.ui-select', sourceSuffix: 'select' },
      { selector: '.ui-textarea', sourceSuffix: 'textarea' },
      { selector: '.ui-check', sourceSuffix: 'check' },
      { selector: '.ui-check-control', sourceSuffix: 'check-control' },
      { selector: '.ui-radio', sourceSuffix: 'radio' },
      { selector: '.ui-radio-control', sourceSuffix: 'radio-control' },
      { selector: '.ui-switch', sourceSuffix: 'switch' },
      { selector: '.ui-switch-track', sourceSuffix: 'switch-track' },
      { selector: '.ui-switch-thumb', sourceSuffix: 'switch-thumb' }
    ],
    badge: [
      { selector: '.ui-badge', sourceSuffix: 'badge' }
    ],
    alert: [
      { selector: '.ui-alert', sourceSuffix: 'alert' },
      { selector: '.ui-alert-title', sourceSuffix: 'alert-title' },
      { selector: '.ui-alert-body', sourceSuffix: 'alert-body' }
    ],
    navigation: [
      { selector: '.ui-nav', sourceSuffix: 'nav' },
      { selector: '.ui-nav-link', sourceSuffix: 'nav-link' }
    ],
    table: [
      { selector: '.ui-table', sourceSuffix: 'table' },
      { selector: '.ui-table-wrap', sourceSuffix: 'table-wrap' }
    ],
    progress: [
      { selector: '.ui-progress', sourceSuffix: 'progress' },
      { selector: '.ui-progress-bar', sourceSuffix: 'progress-bar' }
    ],
    toolbar: [
      { selector: '.ui-toolbar', sourceSuffix: 'toolbar' }
    ],
    loading: [
      { selector: '.ui-spinner', sourceSuffix: 'spinner' }
    ],
    tooltip: [
      { selector: '.ui-tooltip', sourceSuffix: 'tooltip' }
    ]
  },
  variantAttribute: {
    name: 'data-ui-variant',
    neutral: 'omitted',
    valuesBySelector: {
      '.ui-button': ['primary', 'secondary', 'danger', 'ghost'],
      '.ui-badge': ['primary', 'secondary', 'success', 'warning', 'danger'],
      '.ui-alert': ['success', 'warning', 'danger']
    }
  },
  nativeFallbacks: [
    {
      roles: ['modal', 'dialog'],
      element: 'dialog',
      genericSelectors: []
    }
  ],
  presetPrefixedClasses: {
    status: 'supported',
    uses: ['compatibility', 'advanced']
  }
};

function semanticEntries(api = manifest.semanticComponentApi) {
  assert.ok(api, 'manifest.json must declare semanticComponentApi');
  return Object.values(api.selectorsByRole).flat();
}

function semanticRequiredSuffixes(api = manifest.semanticComponentApi) {
  const entries = semanticEntries(api);
  const variantSuffixes = Object.entries(api.variantAttribute.valuesBySelector)
    .flatMap(([selector, variants]) => {
      const sourceSuffix = entries.find((entry) => entry.selector === selector)?.sourceSuffix;
      assert.ok(sourceSuffix, `${selector} variants need a declared semantic selector`);
      return variants.map((variant) => `${sourceSuffix}-${variant}`);
    });

  return new Set([
    ...entries.map(({ sourceSuffix }) => sourceSuffix),
    ...variantSuffixes
  ]);
}

function composedClassNames(preset) {
  const classNames = new Set();

  // The authoritative preset API composes shared component and preset source files.
  for (const relativeFile of ['styles/components.css', `styles/${preset.id}.css`]) {
    const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
    walk(parse(css, { filename: relativeFile }), {
      visit: 'ClassSelector',
      enter(node) {
        classNames.add(node.name);
      }
    });
  }

  return classNames;
}

test('manifest specifies the exact generic semantic component API', () => {
  assert.ok(manifest.semanticComponentApi, 'manifest.json must declare semanticComponentApi');
  assert.deepEqual(manifest.semanticComponentApi, expectedSemanticComponentApi);

  const entries = semanticEntries();
  assert.equal(entries.length, 29);
  assert.equal(new Set(entries.map(({ selector }) => selector)).size, entries.length);
  assert.equal(new Set(entries.map(({ sourceSuffix }) => sourceSuffix)).size, entries.length);
  assert.equal(entries.every(({ selector }) => /^\.ui-[a-z]+(?:-[a-z]+)*$/.test(selector)), true);
});

test('semantic source suffixes and contextual variants exist in every composed preset API', () => {
  const currentSuffixes = new Set(manifest.classApi.universalVisualSuffixes);
  const requiredSuffixes = semanticRequiredSuffixes();

  assert.equal(manifest.classApi.universalVisualSuffixes.length, 81);
  for (const suffix of requiredSuffixes) {
    assert.equal(currentSuffixes.has(suffix), true, `${suffix} must remain a current universal visual suffix`);
  }

  for (const preset of manifest.presets) {
    const composedNames = composedClassNames(preset);
    for (const suffix of requiredSuffixes) {
      assert.equal(
        composedNames.has(`${preset.prefix}-${suffix}`),
        true,
        `${preset.id} composed source is missing .${preset.prefix}-${suffix}`
      );
    }
  }
});

test('partial extras and deprecated structural aliases stay outside the semantic contract', () => {
  const semanticSuffixes = semanticRequiredSuffixes();
  const partialExtras = new Set(Object.values(manifest.classApi.presetExtras).flat());
  const deprecatedSuffixes = new Set(manifest.classApi.deprecatedStructuralSuffixes);

  assert.equal(partialExtras.size, 23);
  assert.equal(deprecatedSuffixes.size, 7);
  for (const suffix of semanticSuffixes) {
    assert.equal(partialExtras.has(suffix), false, `${suffix} must not be a partial preset extra`);
    assert.equal(deprecatedSuffixes.has(suffix), false, `${suffix} must not be a deprecated structural alias`);
  }
  assert.deepEqual(manifest.semanticComponentApi.presetPrefixedClasses, {
    status: 'supported',
    uses: ['compatibility', 'advanced']
  });
});

test('modal and dialog use one native fallback without inventing generic selectors', () => {
  const selectors = new Set(semanticEntries().map(({ selector }) => selector));

  assert.deepEqual(manifest.semanticComponentApi.nativeFallbacks, [
    { roles: ['modal', 'dialog'], element: 'dialog', genericSelectors: [] }
  ]);
  assert.equal(selectors.has('.ui-modal'), false);
  assert.equal(selectors.has('.ui-dialog'), false);
});

test('data-ui-variant is the only semantic component attribute added to the preset switch', () => {
  const api = manifest.semanticComponentApi;
  assert.ok(api, 'manifest.json must declare semanticComponentApi');
  const variantContexts = Object.keys(api.variantAttribute.valuesBySelector);
  const selectors = new Set(semanticEntries().map(({ selector }) => selector));

  assert.equal(api.presetSwitchAttribute, 'data-ui');
  assert.equal(api.variantAttribute.name, 'data-ui-variant');
  assert.equal(api.variantAttribute.neutral, 'omitted');
  assert.equal(variantContexts.length, 3);
  assert.equal(variantContexts.every((selector) => selectors.has(selector)), true);
  for (const values of Object.values(api.variantAttribute.valuesBySelector)) {
    assert.equal(new Set(values).size, values.length, 'variant values must be unique within their selector context');
  }

  const serializedApi = JSON.stringify(api);
  for (const forbiddenAttribute of ['data-ui-state', 'data-ui-size', 'data-ui-placement']) {
    assert.equal(serializedApi.includes(forbiddenAttribute), false, `${forbiddenAttribute} must stay out of the API`);
  }
});

test('manifest presets generate unchanged generic markup cases for Task 11 runtime switching', () => {
  const cases = semanticRuntimeCases(manifest);
  const declaredSelectors = semanticEntries().map(({ selector }) => selector);
  const presetPrefixes = manifest.presets.map(({ prefix }) => prefix);

  assert.equal(cases.length, 11);
  assert.deepEqual(cases.map(({ preset }) => preset), manifest.presets.map(({ id }) => id));
  assert.equal(new Set(cases.map(({ markup }) => markup)).size, 1, 'generic markup must not change by preset');
  for (const runtimeCase of cases) {
    assert.deepEqual(runtimeCase.rootAttributes, { 'data-ui': runtimeCase.preset });
  }
  for (const selector of declaredSelectors) {
    assert.match(semanticComponentMarkup, new RegExp(`class="[^"]*\\b${selector.slice(1)}\\b`));
  }
  for (const prefix of presetPrefixes) {
    assert.doesNotMatch(semanticComponentMarkup, new RegExp(`class="[^"]*\\b${prefix}-`));
  }
  assert.match(semanticComponentMarkup, /<dialog>Native modal and dialog fallback<\/dialog>/);
  assert.doesNotMatch(semanticComponentMarkup, /\bui-(?:modal|dialog)\b/);
});
