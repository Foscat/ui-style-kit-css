import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';
import { PRESET_IDENTITIES } from '../scripts/preset-identities.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function readFile(relativeFile) {
  return fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
}

function astFor(relativeFile) {
  return parse(readFile(relativeFile), { filename: relativeFile, positions: true });
}

function collect(ast, type, mapper) {
  const values = [];

  walk(ast, {
    visit: type,
    enter(node) {
      values.push(mapper(node));
    }
  });

  return values;
}

/**
 * Collect the effective declarations from rules accepted by a selector predicate.
 *
 * @param {import('css-tree').CssNode} ast Parsed stylesheet.
 * @param {(selector: string) => boolean} matchesSelector Selector predicate.
 * @returns {Map<string, string>} Effective declarations in source order.
 */
function effectiveDeclarations(ast, matchesSelector) {
  const declarations = new Map();

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const selector = generate(rule.prelude);
      if (!matchesSelector(selector)) return;

      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
      });
    }
  });

  return declarations;
}

test('every preset extends native actions and dialogs with matching identity paint', () => {
  const identityPaint = ['background', 'border', 'border-radius', 'box-shadow'];

  for (const { id } of PRESET_IDENTITIES) {
    const ast = astFor(`styles/${id}.css`);
    const rootSelector = `[data-ui="${id}"][data-theme][data-mode]`;
    const actions = effectiveDeclarations(ast, (selector) => (
      selector.includes(rootSelector)
      && selector.includes('button:not([class])')
      && selector.includes('input[type="submit"]:not([class])')
    ));
    const dialog = effectiveDeclarations(ast, (selector) => (
      selector.includes(rootSelector)
      && selector.includes(':where(dialog)')
    ));

    assert.ok(
      identityPaint.filter((property) => actions.has(property)).length >= 2,
      `${id} native actions should expose at least two preset identity paint properties`
    );
    assert.ok(
      identityPaint.filter((property) => dialog.has(property)).length >= 2,
      `${id} dialogs should expose at least two matching preset identity paint properties`
    );
  }
});

test('preset native paint overrides keep foregrounds paired with replacement backgrounds', () => {
  for (const { id } of PRESET_IDENTITIES) {
    const ast = astFor(`styles/${id}.css`);
    const rootSelector = `[data-ui="${id}"][data-theme][data-mode]`;
    const actions = effectiveDeclarations(ast, (selector) => (
      selector.includes(rootSelector)
      && selector.includes('button:not([class])')
      && selector.includes('input[type="submit"]:not([class])')
    ));

    if (actions.has('background') || actions.has('background-color')) {
      assert.equal(actions.has('color'), true, `${id} replacement action backgrounds must include their paired foreground`);
    }
  }
});

test('gradient-only dialogs retain opaque fallback paint and inherit readable copy color', () => {
  for (const id of ['tactile', 'neo-noir']) {
    const ast = astFor(`styles/${id}.css`);
    const dialog = effectiveDeclarations(ast, (selector) => (
      selector.includes(`[data-ui="${id}"][data-theme][data-mode]`)
      && selector.includes(':where(dialog)')
    ));

    assert.equal(dialog.has('background-color'), true, `${id} dialog should expose an opaque semantic fallback`);
    assert.equal(dialog.has('background-image'), true, `${id} dialog should retain its preset gradient identity`);
  }

  const nativeAst = astFor('styles/native-elements.css');
  const dialogCopy = effectiveDeclarations(nativeAst, (selector) => selector.includes(':where(dialog p)'));
  assert.equal(dialogCopy.get('color'), 'inherit');
});

test('native layer exposes documented sizing and paint tokens', () => {
  const declarations = new Set(collect(astFor('styles/native-elements.css'), 'Declaration', (node) => node.property));
  const requiredTokens = [
    '--usk-native-border-width',
    '--usk-native-control-padding-block',
    '--usk-native-control-padding-inline',
    '--usk-native-field-gap',
    '--usk-native-panel-padding',
    '--usk-native-control-min-block-size',
    '--usk-native-subcontrol-padding-block',
    '--usk-native-subcontrol-padding-inline',
    '--usk-native-track',
    '--usk-native-track-fill',
    '--usk-native-thumb',
    '--usk-native-thumb-border',
    '--usk-native-indicator'
  ];

  for (const token of requiredTokens) {
    assert.equal(declarations.has(token), true, `styles/native-elements.css should define ${token}`);
  }
});

test('editable field paint excludes button-like inputs with independent surface ownership', () => {
  const selectors = collect(astFor('styles/native-elements.css'), 'Rule', (node) => generate(node.prelude));
  const editableSelector = selectors.find((selector) => (
    selector.includes('input:not([type="checkbox"])')
    && selector.includes('textarea')
    && selector.includes('select')
  ));

  assert.ok(editableSelector, 'native layer should expose one shared editable-field selector');
  for (const type of ['button', 'submit', 'reset']) {
    assert.match(
      editableSelector,
      new RegExp(`:not\\(\\[type="${type}"\\]\\)`),
      `editable-field background paint must not leak onto input[type="${type}"]`
    );
  }
});

test('read-only field paint cannot override semantic action inputs', () => {
  const selectors = collect(astFor('styles/native-elements.css'), 'Rule', (node) => generate(node.prelude));
  const readOnlySelector = selectors.find((selector) => selector.includes('input:read-only'));

  assert.ok(readOnlySelector, 'native layer should style read-only editable fields');
  for (const type of ['button', 'submit', 'reset']) {
    assert.match(
      readOnlySelector,
      new RegExp(`:not\\(\\[type=["']?${type}["']?\\]\\)`),
      `read-only field paint must not match input[type="${type}"]`
    );
  }
});

test('semantic action normalization survives bridge hook classes without taking paint ownership', () => {
  const nativeAst = astFor('styles/native-elements.css');
  const actionFoundation = effectiveDeclarations(nativeAst, (selector) => (
    selector.includes('button')
    && selector.includes('input[type="button"]')
    && selector.includes('input[type="submit"]')
    && selector.includes('input[type="reset"]')
    && !selector.includes(':not([class])')
  ));

  assert.equal(actionFoundation.get('-webkit-appearance'), 'none');
  assert.equal(actionFoundation.get('appearance'), 'none');
  assert.equal(actionFoundation.get('box-sizing'), 'border-box');
  assert.equal(actionFoundation.get('font'), 'inherit');
  assert.equal(actionFoundation.get('min-block-size'), 'var(--usk-native-control-min-block-size)');
  assert.equal(actionFoundation.get('padding'), '.7rem 1rem');
  assert.equal(actionFoundation.has('color'), false, 'shared normalization must not steal preset or bridge foreground paint');
  assert.equal(actionFoundation.has('background'), false, 'shared normalization must not steal preset or bridge background paint');
});

test('native layer covers omitted modern elements and classifies platform-owned popups', () => {
  const nativeAst = astFor('styles/native-elements.css');
  const typeSelectors = new Set(collect(nativeAst, 'TypeSelector', (node) => node.name));
  const requiredTypes = ['form', 'hgroup', 'u', 'bdi', 'bdo', 'selectedcontent', 'datalist'];

  for (const type of requiredTypes) {
    assert.equal(typeSelectors.has(type), true, `native layer should include ${type}`);
  }

  const manifest = JSON.parse(readFile('manifest.json'));
  assert.equal(manifest.nativeElements.progressivelyEnhanced.includes('selectedcontent'), true);
  assert.equal(manifest.nativeElements.nonRendered.includes('datalist'), true);

  for (const popup of ['datalist-popup', 'select-popup', 'date-time-picker-dialog', 'color-picker-dialog']) {
    assert.equal(manifest.nativeParts.platformOwned.includes(popup), true, `${popup} should be platform-owned`);
  }
});

test('native layer has executable selectors for supported native subparts and states', () => {
  const nativeAst = astFor('styles/native-elements.css');
  const pseudoElements = new Set(collect(nativeAst, 'PseudoElementSelector', (node) => node.name));
  const pseudoClasses = new Set(collect(nativeAst, 'PseudoClassSelector', (node) => node.name));
  const classes = new Set(collect(nativeAst, 'ClassSelector', (node) => node.name));
  const attributes = collect(nativeAst, 'AttributeSelector', (node) => ({
    name: node.name?.name,
    value: node.value?.value ?? node.value?.name ?? null
  }));

  for (const pseudo of [
    'placeholder',
    'file-selector-button',
    '-webkit-file-upload-button',
    '-webkit-slider-runnable-track',
    '-moz-range-track',
    '-webkit-slider-thumb',
    '-moz-range-thumb',
    '-webkit-color-swatch-wrapper',
    '-webkit-color-swatch',
    '-moz-color-swatch',
    '-webkit-progress-bar',
    '-webkit-progress-value',
    '-moz-progress-bar',
    '-webkit-meter-bar',
    '-webkit-meter-optimum-value',
    '-webkit-meter-suboptimum-value',
    '-webkit-meter-even-less-good-value',
    '-moz-meter-bar',
    '-webkit-calendar-picker-indicator',
    '-webkit-search-cancel-button',
    '-webkit-inner-spin-button',
    '-webkit-outer-spin-button',
    'marker',
    '-webkit-scrollbar',
    '-webkit-scrollbar-track',
    '-webkit-scrollbar-thumb'
  ]) {
    assert.equal(pseudoElements.has(pseudo), true, `native layer should include ::${pseudo}`);
  }

  for (const state of ['hover', 'focus-visible', 'active', 'disabled', 'read-only', 'required', 'user-valid', 'user-invalid', 'indeterminate']) {
    assert.equal(pseudoClasses.has(state), true, `native layer should include :${state}`);
  }

  assert.equal(pseudoClasses.has('invalid'), false, 'native layer should avoid premature untouched :invalid paint');
  assert.equal(classes.has('is-invalid'), true);
  assert.equal(classes.has('is-valid'), true);
  assert.equal(attributes.some(({ name, value }) => name === 'aria-invalid' && value === 'true'), true);
});

test('native coverage documentation records the platform contract', () => {
  const docs = readFile('docs/NATIVE-ELEMENTS.md');

  for (const phrase of [
    'fully themed',
    'progressively enhanced',
    'platform-owned',
    'non-rendered',
    'selectedcontent',
    'datalist popup',
    '--usk-native-control-min-block-size',
    '--usk-native-subcontrol-padding-inline'
  ]) {
    assert.match(docs, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});
