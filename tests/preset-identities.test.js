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
const nativeIdentityKeys = ['control', 'select', 'range', 'progress'];
const nativeSignatureTokens = [
  '--usk-native-border-width',
  '--usk-native-control-min-block-size',
  '--usk-native-control-padding-block',
  '--usk-native-choice-size',
  '--usk-native-checkbox-radius',
  '--usk-native-radio-radius',
  '--usk-native-select-indicator-image',
  '--usk-native-select-indicator-size',
  '--usk-native-range-track-size',
  '--usk-native-range-track-border',
  '--usk-native-range-track-radius',
  '--usk-native-range-track-shadow',
  '--usk-native-range-thumb-size',
  '--usk-native-range-thumb-border',
  '--usk-native-range-thumb-radius',
  '--usk-native-range-thumb-shadow',
  '--usk-native-progress-size',
  '--usk-native-progress-track-border',
  '--usk-native-progress-track-radius',
  '--usk-native-progress-track-shadow',
  '--usk-native-progress-value-radius',
  '--usk-native-progress-value-shadow',
  '--usk-native-scrollbar-size',
  '--usk-native-scrollbar-radius'
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

/**
 * Build a palette- and prefix-neutral native-control signature.
 *
 * @param {string} css Complete authored stylesheet.
 * @param {string} id Public preset identifier.
 * @param {string} prefix Preset token prefix.
 * @returns {string} Stable native-control identity signature.
 */
function nativeControlSignature(css, id, prefix) {
  const rootSelector = `[data-ui="${id}"][data-theme][data-mode]`;
  const declarations = new Map();
  const ast = parse(css);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (generate(rule.prelude) !== rootSelector) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration' && nativeSignatureTokens.includes(node.property)) {
          declarations.set(node.property, generate(node.value));
        }
      });
    }
  });

  return nativeSignatureTokens
    .map((property) => `${property}:${declarations.get(property) ?? ''}`)
    .join(';')
    .replaceAll(`--${prefix}-`, '--preset-')
    .replace(/--usk-(?:bg|surface(?:-strong|-soft)?|text(?:-muted)?|border|primary(?:-hover|-text)?|secondary(?:-hover|-text)?|accent|success|warning|danger|link|focus)-rgb/g, '--theme-channel');
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

test('every identity declares a frozen native-control intent contract', () => {
  for (const identity of PRESET_IDENTITIES) {
    assert.equal(Object.isFrozen(identity.nativeIdentity), true, `${identity.id} nativeIdentity should be frozen`);
    assert.deepEqual(Object.keys(identity.nativeIdentity), nativeIdentityKeys, `${identity.id} nativeIdentity keys should remain stable`);
    for (const key of nativeIdentityKeys) {
      assert.match(identity.nativeIdentity[key], /\S/, `${identity.id} nativeIdentity.${key} should describe intent`);
    }
  }
});

test('identity validation rejects incomplete native-control intent', () => {
  const invalid = PRESET_IDENTITIES.map((identity) => identity.id === 'minimal-saas'
    ? { ...identity, nativeIdentity: { ...identity.nativeIdentity, range: '' } }
    : identity);

  assert.throws(
    () => validatePresetIdentities(manifest, invalid),
    /missing native identity range for minimal-saas/
  );
});

test('all presets expose complete and distinct native-control signatures', () => {
  const signatures = new Map();

  for (const identity of PRESET_IDENTITIES) {
    const css = fs.readFileSync(path.join(rootDir, 'styles', `${identity.id}.css`), 'utf8');
    const signature = nativeControlSignature(css, identity.id, identity.prefix);

    for (const token of nativeSignatureTokens) {
      assert.doesNotMatch(signature, new RegExp(`${token}:;`), `${identity.id} should map ${token}`);
    }
    assert.equal(
      signatures.has(signature),
      false,
      `${identity.id} duplicates ${signatures.get(signature) ?? 'another preset'} native-control identity`
    );
    signatures.set(signature, identity.id);
  }
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
