import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';
import {
  PRESET_IDENTITIES,
  validatePresetIdentities
} from '../scripts/preset-identities.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const signatureProperties = [
  'background',
  'border',
  'border-radius',
  'box-shadow',
  'clip-path',
  'inline-size',
  'justify-self',
  'font-family'
];

/**
 * Build a prefix-neutral declaration signature for one public class.
 *
 * @param {string} css Complete authored stylesheet.
 * @param {string} className Public class name without the leading period.
 * @param {string} prefix Preset class and token prefix.
 * @returns {string} Stable normalized signature.
 */
function classSignature(css, className, prefix) {
  const declarations = new Map();
  const ast = parse(css);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (!generate(rule.prelude).includes(`.${className}`)) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
      });
    }
  });

  return signatureProperties
    .map((property) => `${property}:${declarations.get(property) ?? ''}`)
    .join(';')
    .replaceAll(`--${prefix}-`, '--preset-');
}

test('identity registry exactly matches the public preset manifest', () => {
  assert.doesNotThrow(() => validatePresetIdentities(manifest));
  assert.deepEqual(
    PRESET_IDENTITIES.map(({ id, prefix }) => [id, prefix]),
    manifest.presets.map(({ id, prefix }) => [id, prefix])
  );
});

test('identity validation rejects a missing manifest preset', () => {
  assert.throws(
    () => validatePresetIdentities(manifest, PRESET_IDENTITIES.slice(1)),
    /missing identity for minimal-saas/
  );
});

test('identity validation rejects duplicate preset identities', () => {
  assert.throws(
    () => validatePresetIdentities(manifest, [...PRESET_IDENTITIES, PRESET_IDENTITIES[0]]),
    /duplicate identity for minimal-saas/
  );
});

test('identity validation rejects prefix drift', () => {
  const mismatched = PRESET_IDENTITIES.map((identity) =>
    identity.id === 'minimal-saas'
      ? { ...identity, prefix: 'drifted' }
      : identity
  );

  assert.throws(
    () => validatePresetIdentities(manifest, mismatched),
    /prefix mismatch for minimal-saas: expected saas, received drifted/
  );
});

test('all presets expose distinct composite surface identities', () => {
  const signatures = new Map();

  for (const identity of PRESET_IDENTITIES) {
    const css = fs.readFileSync(path.join(rootDir, 'styles', `${identity.id}.css`), 'utf8');
    const surfaceSelectors = [
      'card-service',
      'media-scrim',
      'callout-bar',
      identity.specimenSuffix
    ];
    const signature = surfaceSelectors
      .map((suffix) => classSignature(css, `${identity.prefix}-${suffix}`, identity.prefix))
      .join('|');

    assert.equal(
      signatures.has(signature),
      false,
      `${identity.id} duplicates ${signatures.get(signature) ?? 'another preset'} surface identity`
    );
    signatures.set(signature, identity.id);
  }
});
