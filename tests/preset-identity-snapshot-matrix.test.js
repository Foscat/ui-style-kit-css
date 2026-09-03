import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { PRESET_IDENTITIES } from '../scripts/preset-identities.mjs';

const snapshotDirectory = path.resolve('tests/demo-visual.spec.mjs-snapshots');
const platform = process.platform;
const viewports = ['desktop', 'mobile'];
const specimens = Object.freeze([
  Object.freeze({ prefix: 'component-identity', minimumDifference: 0.2 }),
  Object.freeze({ prefix: 'native-controls', minimumDifference: 0.1 })
]);
const decodedSnapshots = new Map();

/**
 * Loads and decodes one approved Playwright identity snapshot exactly once.
 *
 * @param {string} prefix Snapshot specimen prefix.
 * @param {string} preset Public preset identifier.
 * @param {string} viewport Approved viewport name.
 * @returns {PNG} Decoded snapshot pixels.
 */
function loadSnapshot(prefix, preset, viewport) {
  const filename = `${prefix}-${preset}-${viewport}-${platform}.png`;
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
          if (ratio < specimen.minimumDifference) {
            failures.push(`${left.id} vs ${right.id}: ${ratio.toFixed(4)}`);
          }
        }
      }

      assert.deepEqual(
        failures,
        [],
        `${viewport} ${specimen.prefix} pairs below ${specimen.minimumDifference}:\n${failures.join('\n')}`
      );
    });
  }
}
