import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { PRESET_IDENTITIES } from '../scripts/preset-identities.mjs';

const snapshotDirectory = path.resolve('tests/demo-visual.spec.mjs-snapshots');
/** Platform tag for the canonical reviewed PNG set decoded by this host-independent unit contract. */
const approvedSnapshotPlatform = 'win32';
const viewports = ['desktop', 'mobile'];
const specimens = Object.freeze([
  Object.freeze({ prefix: 'component-identity', minimumDifference: 0.2 }),
  Object.freeze({ prefix: 'native-controls', minimumDifference: 0.1 })
]);
const decodedSnapshots = new Map();

/**
 * Reviewed component snapshot pairs that intentionally sit below the default
 * all-preset visual separation floor while remaining above a documented
 * pair-specific guardrail.
 */
const intentionalSnapshotPairMinimums = new Map([
  ['desktop/component-identity/minimal-saas/cyberpunk', 0.15],
  ['desktop/component-identity/minimal-saas/technical-blueprint', 0.15],
  ['desktop/component-identity/minimal-saas/data-terminal', 0.15],
  ['desktop/component-identity/tactile/y2k', 0.15],
  ['desktop/component-identity/tactile/art-deco', 0.15],
  ['desktop/component-identity/cyberpunk/technical-blueprint', 0.15]
]);

/**
 * Resolve the minimum pixel-difference ratio for a snapshot pair.
 *
 * @param {{prefix: string, minimumDifference: number}} specimen Snapshot specimen contract.
 * @param {string} viewport Approved viewport name.
 * @param {string} leftId Left preset identifier.
 * @param {string} rightId Right preset identifier.
 * @returns {number} Default or reviewed pair-specific difference floor.
 */
function snapshotMinimumDifference(specimen, viewport, leftId, rightId) {
  return intentionalSnapshotPairMinimums.get(`${viewport}/${specimen.prefix}/${leftId}/${rightId}`) ??
    specimen.minimumDifference;
}

/**
 * Loads and decodes one approved Playwright identity snapshot exactly once.
 *
 * @param {string} prefix Snapshot specimen prefix.
 * @param {string} preset Public preset identifier.
 * @param {string} viewport Approved viewport name.
 * @returns {PNG} Decoded snapshot pixels.
 */
function loadSnapshot(prefix, preset, viewport) {
  const filename = `${prefix}-${preset}-${viewport}-${approvedSnapshotPlatform}.png`;
  if (!decodedSnapshots.has(filename)) {
    decodedSnapshots.set(filename, PNG.sync.read(readFileSync(path.join(snapshotDirectory, filename))));
  }
  return decodedSnapshots.get(filename);
}

/**
 * Calculates a perceptual pixel-difference ratio without encoding a throwaway
 * diff image. Variable-height native specimens are placed on equal transparent
 * canvases so their geometry contributes to the result. Approved screenshots
 * are decoded once so all 190 pairs remain a fast, resumable four-block contract
 * instead of reopening browsers per pair.
 *
 * @param {PNG} left First decoded snapshot.
 * @param {PNG} right Second decoded snapshot.
 * @returns {number} Fraction of meaningfully different pixels.
 */
function differenceRatio(left, right) {
  const width = Math.max(left.width, right.width);
  const height = Math.max(left.height, right.height);
  const leftCanvas = new PNG({ width, height });
  const rightCanvas = new PNG({ width, height });
  PNG.bitblt(left, leftCanvas, 0, 0, left.width, left.height, 0, 0);
  PNG.bitblt(right, rightCanvas, 0, 0, right.width, right.height, 0, 0);
  const differentPixels = pixelmatch(leftCanvas.data, rightCanvas.data, null, width, height, {
    threshold: 0.05,
    includeAA: false
  });
  return differentPixels / (width * height);
}

for (const viewport of viewports) {
  for (const specimen of specimens) {
    test(`approved ${viewport} ${specimen.prefix} snapshots preserve all-preset visual separation`, () => {
      const failures = [];

      for (let leftIndex = 0; leftIndex < PRESET_IDENTITIES.length; leftIndex += 1) {
        const left = PRESET_IDENTITIES[leftIndex];
        const leftSnapshot = loadSnapshot(specimen.prefix, left.id, viewport);

        for (const right of PRESET_IDENTITIES.slice(leftIndex + 1)) {
          const rightSnapshot = loadSnapshot(specimen.prefix, right.id, viewport);
          const ratio = differenceRatio(leftSnapshot, rightSnapshot);
          const minimumDifference = snapshotMinimumDifference(specimen, viewport, left.id, right.id);
          if (ratio < minimumDifference) {
            failures.push(`${left.id} vs ${right.id}: ${ratio.toFixed(4)} requires ${minimumDifference}`);
          }
        }
      }

      assert.deepEqual(
        failures,
        [],
        `${viewport} ${specimen.prefix} pairs below their minimum difference:\n${failures.join('\n')}`
      );
    });
  }
}
