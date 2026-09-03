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
const templateSignatureKeys = ['typography', 'density', 'geometry', 'material', 'feedback', 'data'];
const referenceTraitKeys = ['typography', 'density', 'geometry', 'material', 'feedback', 'data'];
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

const visibleIdentityAxes = Object.freeze({
  typography: Object.freeze([
    ['title', ['font-weight', 'letter-spacing']],
    ['label', ['font-size', 'font-weight']],
    ['button', ['font-weight']]
  ]),
  density: Object.freeze([
    ['button', ['min-height', 'padding']],
    ['input', ['min-height', 'padding']],
    ['card', ['padding']],
    ['table th', ['padding']]
  ]),
  geometry: Object.freeze([
    ['button', ['border-radius']],
    ['input', ['border-radius']],
    ['card', ['border-radius']],
    ['alert', ['border-radius']]
  ]),
  material: Object.freeze([
    ['card', ['background', 'border', 'box-shadow']],
    ['well', ['background', 'border', 'box-shadow']],
    ['button', ['background', 'box-shadow']]
  ]),
  feedback: Object.freeze([
    ['badge', ['min-height', 'padding', 'border-radius']],
    ['alert', ['background', 'border', 'box-shadow']],
    ['progress', ['height', 'background']]
  ]),
  data: Object.freeze([
    ['table-wrap', ['background', 'border-radius', 'box-shadow']],
    ['table th', ['background', 'font-weight']],
    ['table td', ['padding']]
  ])
});

const allPresetNativeIdentityTokens = Object.freeze([
  '--usk-native-font-control',
  '--usk-native-control-min-block-size',
  '--usk-native-control-padding-block',
  '--usk-native-control-padding-inline',
  '--usk-native-border-width',
  '--usk-native-radius-sm',
  '--usk-native-radius',
  '--usk-native-radius-lg',
  '--usk-native-shadow',
  '--usk-native-shadow-md',
  '--usk-native-focus-ring',
  '--usk-native-subcontrol-padding-block',
  '--usk-native-subcontrol-padding-inline',
  '--usk-native-choice-size',
  '--usk-native-choice-background',
  '--usk-native-choice-border',
  '--usk-native-checkbox-radius',
  '--usk-native-radio-radius',
  '--usk-native-choice-shadow',
  '--usk-native-choice-checked-background',
  '--usk-native-choice-mark-color',
  '--usk-native-select-indicator-image',
  '--usk-native-select-indicator-size',
  '--usk-native-select-indicator-position',
  '--usk-native-select-padding-inline-end',
  '--usk-native-range-track-size',
  '--usk-native-range-track-background',
  '--usk-native-range-track-border',
  '--usk-native-range-track-radius',
  '--usk-native-range-track-shadow',
  '--usk-native-range-progress-background',
  '--usk-native-range-thumb-size',
  '--usk-native-range-thumb-background',
  '--usk-native-range-thumb-border',
  '--usk-native-range-thumb-radius',
  '--usk-native-range-thumb-shadow',
  '--usk-native-progress-size',
  '--usk-native-progress-track-background',
  '--usk-native-progress-track-border',
  '--usk-native-progress-track-radius',
  '--usk-native-progress-track-shadow',
  '--usk-native-progress-value-background',
  '--usk-native-progress-value-radius',
  '--usk-native-progress-value-shadow',
  '--usk-native-scrollbar-size',
  '--usk-native-scrollbar-track',
  '--usk-native-scrollbar-thumb',
  '--usk-native-scrollbar-radius'
]);

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

/**
 * Collect the final declarations contributed by every rule that targets a class fragment.
 *
 * @param {string} css Complete authored stylesheet.
 * @param {string} classFragment Prefix-relative class fragment, optionally with a descendant.
 * @param {string} prefix Preset class and token prefix.
 * @param {readonly string[]} properties CSS properties that define the requested identity axis.
 * @returns {readonly string[]} Prefix-neutral declaration values in property order.
 */
function classIdentityValues(css, classFragment, prefix, properties) {
  const declarations = new Map();
  const ast = parse(css);
  const selector = `.${prefix}-${classFragment}`;

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (!generate(rule.prelude).includes(selector)) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration' && properties.includes(node.property)) {
          declarations.set(node.property, generate(node.value));
        }
      });
    }
  });

  return properties.map((property) => normalizeIdentityValue(declarations.get(property) ?? '', prefix));
}

/**
 * Collect preset-scoped native identity tokens in a stable, prefix-neutral order.
 *
 * @param {string} css Complete authored stylesheet.
 * @param {string} id Public preset identifier.
 * @param {string} prefix Preset token prefix.
 * @param {readonly string[]} properties Native token names to collect.
 * @returns {readonly string[]} Prefix-neutral token values in property order.
 */
function nativeIdentityValues(css, id, prefix, properties) {
  const declarations = new Map();
  const rootSelector = `[data-ui="${id}"][data-theme][data-mode]`;
  const ast = parse(css);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (generate(rule.prelude) !== rootSelector) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration' && properties.includes(node.property)) {
          declarations.set(node.property, generate(node.value));
        }
      });
    }
  });

  return properties.map((property) => normalizeIdentityValue(declarations.get(property) ?? '', prefix));
}

/**
 * Remove preset prefixes and semantic theme channels from a comparable CSS value.
 *
 * @param {string} value Authored CSS declaration value.
 * @param {string} prefix Preset token prefix.
 * @returns {string} Palette- and prefix-neutral value.
 */
function normalizeIdentityValue(value, prefix) {
  return value
    .replaceAll(`--${prefix}-`, '--preset-')
    .replace(/--usk-(?:bg|surface(?:-strong|-soft)?|text(?:-muted)?|border|primary(?:-hover|-text)?|secondary(?:-hover|-text)?|accent|success|warning|danger|link|focus)-rgb/g, '--theme-channel');
}

/**
 * Count positional differences between two stable identity vectors.
 *
 * @param {readonly string[]} left First identity vector.
 * @param {readonly string[]} right Second identity vector.
 * @returns {number} Number of values that differ at the same position.
 */
function identityDifferenceCount(left, right) {
  assert.equal(left.length, right.length, 'identity vectors must use the same shape');
  return left.reduce((count, value, index) => count + Number(value !== right[index]), 0);
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

test('every identity declares an explicit template signature across all visible axes', () => {
  for (const identity of PRESET_IDENTITIES) {
    assert.equal(
      Object.isFrozen(identity.templateSignature),
      true,
      `${identity.id} templateSignature should be frozen`
    );
    assert.deepEqual(
      Object.keys(identity.templateSignature),
      templateSignatureKeys,
      `${identity.id} template signature axes should remain stable`
    );
    for (const key of templateSignatureKeys) {
      assert.match(
        identity.templateSignature[key],
        /\S/,
        `${identity.id} templateSignature.${key} should describe a specific design requirement`
      );
    }
  }
});

test('every identity exposes executable reference traits for each visible axis', () => {
  for (const identity of PRESET_IDENTITIES) {
    assert.equal(
      Object.isFrozen(identity.referenceTraits),
      true,
      `${identity.id} referenceTraits should be frozen`
    );
    assert.deepEqual(
      Object.keys(identity.referenceTraits),
      referenceTraitKeys,
      `${identity.id} reference trait axes should remain stable`
    );

    for (const axis of referenceTraitKeys) {
      const traits = identity.referenceTraits[axis];
      assert.equal(Array.isArray(traits), true, `${identity.id} ${axis} traits should be an array`);
      assert.equal(traits.length > 0, true, `${identity.id} ${axis} should include an executable trait`);

      for (const trait of traits) {
        assert.match(trait.selector, /\S/, `${identity.id} ${axis} selector should be explicit`);
        assert.match(trait.property, /\S/, `${identity.id} ${axis} property should be explicit`);
        assert.match(trait.includes, /\S/, `${identity.id} ${axis} expected value should be explicit`);
      }
    }
  }
});

for (const identity of PRESET_IDENTITIES) {
  test(`${identity.id} authored CSS realizes its executable reference traits`, () => {
    const css = fs.readFileSync(path.join(rootDir, 'styles', `${identity.id}.css`), 'utf8');

    for (const axis of referenceTraitKeys) {
      for (const trait of identity.referenceTraits[axis]) {
        const [actual] = classIdentityValues(
          css,
          trait.selector,
          identity.prefix,
          [trait.property]
        );
        const expected = normalizeIdentityValue(trait.includes, identity.prefix);

        assert.equal(
          actual.includes(expected),
          true,
          `${identity.id} ${axis} expects ${trait.selector} ${trait.property} to include ${trait.includes}; received ${actual || '<missing>'}`
        );
      }
    }
  });
}

test('identity validation rejects incomplete native-control intent', () => {
  const invalid = PRESET_IDENTITIES.map((identity) => identity.id === 'minimal-saas'
    ? { ...identity, nativeIdentity: { ...identity.nativeIdentity, range: '' } }
    : identity);

  assert.throws(
    () => validatePresetIdentities(manifest, invalid),
    /missing native identity range for minimal-saas/
  );
});

test('identity validation rejects an incomplete template signature', () => {
  const invalid = PRESET_IDENTITIES.map((identity) => identity.id === 'minimal-saas'
    ? { ...identity, templateSignature: { ...identity.templateSignature, material: '' } }
    : identity);

  assert.throws(
    () => validatePresetIdentities(manifest, invalid),
    /missing template signature material for minimal-saas/
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

test('every preset pair remains materially distinct across visible and native-control axes', () => {
  const failures = [];
  const presetCss = new Map(PRESET_IDENTITIES.map((identity) => [
    identity.id,
    fs.readFileSync(path.join(rootDir, 'styles', `${identity.id}.css`), 'utf8')
  ]));

  for (let leftIndex = 0; leftIndex < PRESET_IDENTITIES.length; leftIndex += 1) {
    const left = PRESET_IDENTITIES[leftIndex];
    const leftCss = presetCss.get(left.id);

    for (const right of PRESET_IDENTITIES.slice(leftIndex + 1)) {
      const rightCss = presetCss.get(right.id);

      for (const [axis, selectors] of Object.entries(visibleIdentityAxes)) {
        const leftValues = selectors.flatMap(([fragment, properties]) =>
          classIdentityValues(leftCss, fragment, left.prefix, properties));
        const rightValues = selectors.flatMap(([fragment, properties]) =>
          classIdentityValues(rightCss, fragment, right.prefix, properties));
        const minimumDifferences = Math.max(2, Math.ceil(leftValues.length / 2));

        const differences = identityDifferenceCount(leftValues, rightValues);
        if (differences < minimumDifferences) {
          failures.push(
            `${left.id}/${right.id} ${axis}: ${differences}/${leftValues.length}, requires ${minimumDifferences}`
          );
        }
      }

      const leftNative = nativeIdentityValues(
        leftCss,
        left.id,
        left.prefix,
        allPresetNativeIdentityTokens
      );
      const rightNative = nativeIdentityValues(
        rightCss,
        right.id,
        right.prefix,
        allPresetNativeIdentityTokens
      );

      const nativeDifferences = identityDifferenceCount(leftNative, rightNative);
      if (nativeDifferences < 32) {
        failures.push(`${left.id}/${right.id} native: ${nativeDifferences}/48, requires 32`);
      }
    }
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});
