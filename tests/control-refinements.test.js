import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const identityProperties = [
  'animation',
  'background',
  'border',
  'border-block-start-color',
  'border-inline-end-color',
  'border-radius',
  'box-shadow',
  'clip-path'
];

/**
 * Read one authored stylesheet from the package root.
 *
 * @param {string} relativeFile - Repository-relative stylesheet path.
 * @returns {string} Authored CSS text.
 */
function readCss(relativeFile) {
  return fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
}

/**
 * Resolve the effective declarations contributed by rules matching a predicate.
 * Later declarations replace earlier declarations to mirror stylesheet source order.
 *
 * @param {string} css - Complete stylesheet text.
 * @param {(selector: string) => boolean} matchesSelector - Rule selector predicate.
 * @returns {Map<string, string>} Effective declaration values by property.
 */
function effectiveDeclarations(css, matchesSelector) {
  const declarations = new Map();
  const ast = parse(css);

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

/**
 * Build a prefix-neutral visual signature for a preset-owned loader.
 *
 * @param {Map<string, string>} declarations - Effective loader declarations.
 * @param {string} prefix - Preset class and token prefix.
 * @returns {string} Stable identity signature.
 */
function loaderSignature(declarations, prefix) {
  return identityProperties
    .map((property) => `${property}:${declarations.get(property) ?? ''}`)
    .join(';')
    .replaceAll(`--${prefix}-`, '--preset-')
    .replaceAll(`${prefix}-spin`, 'preset-spin');
}

test('all preset loading indicators expose distinct visual identities', () => {
  const signatures = new Map();

  for (const { id, prefix } of manifest.presets) {
    const css = readCss(`styles/${id}.css`);
    const declarations = effectiveDeclarations(css, (selector) => selector.includes(`.${prefix}-spinner`));
    const signature = loaderSignature(declarations, prefix);

    assert.equal(
      signatures.has(signature),
      false,
      `${id} loading spinner duplicates ${signatures.get(signature) ?? 'another preset'}: ${signature}`
    );
    signatures.set(signature, id);
  }
}
);

test('all preset busy-button indicators inherit distinct visual identities', () => {
  const signatures = new Map();

  for (const { id, prefix } of manifest.presets) {
    const css = readCss(`styles/${id}.css`);
    const declarations = effectiveDeclarations(
      css,
      (selector) => selector.includes(`.${prefix}-button`) && selector.includes('[aria-busy="true"]') && selector.includes('::after')
    );
    const signature = loaderSignature(declarations, prefix);

    assert.equal(
      signatures.has(signature),
      false,
      `${id} busy indicator duplicates ${signatures.get(signature) ?? 'another preset'}: ${signature}`
    );
    signatures.set(signature, id);
  }
});

test('shared switch foundations reserve track width without adding a second thumb movement', () => {
  const css = readCss('styles/components.css');

  for (const prefix of ['saas', 'clay']) {
    const track = effectiveDeclarations(css, (selector) => selector.includes(`.${prefix}-switch-track`));
    const checkedThumb = effectiveDeclarations(
      css,
      (selector) => selector.includes(`.${prefix}-switch-thumb`) && selector.includes(':has(input:checked)')
    );

    assert.equal(track.get('flex'), '0 0 auto', `${prefix} switch tracks should not shrink into their labels`);
    assert.equal(checkedThumb.has('transform'), false, `${prefix} switch thumbs should use only the preset-owned position model`);
  }
});
