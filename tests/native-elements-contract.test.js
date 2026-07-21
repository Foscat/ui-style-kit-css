import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, walk } from 'css-tree';

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
