import assert from 'node:assert/strict';
import test from 'node:test';

import { PNG } from 'pngjs';

const comparatorUrl = new URL('../scripts/visual-snapshot-comparator.mjs', import.meta.url);

function solidPng(width, height, rgba, options = {}) {
  const png = new PNG({ width, height });
  for (let offset = 0; offset < png.data.length; offset += 4) {
    png.data.set(rgba, offset);
  }
  return PNG.sync.write(png, options);
}

function changePixels(buffer, changes) {
  const png = PNG.sync.read(buffer);
  for (const { index, rgba } of changes) {
    png.data.set(rgba, index * 4);
  }
  return PNG.sync.write(png);
}

async function compare(actual, expected, options) {
  const { comparePngSnapshots } = await import(comparatorUrl);
  return comparePngSnapshots(actual, expected, options);
}

test('pixel-identical PNGs pass despite different color metadata and compression', async () => {
  const expected = solidPng(12, 8, [24, 96, 180, 255], {
    colorType: 6,
    deflateLevel: 1
  });
  const actual = solidPng(12, 8, [24, 96, 180, 255], {
    colorType: 2,
    inputHasAlpha: true,
    deflateLevel: 9
  });

  assert.notDeepEqual(actual, expected);
  const result = await compare(actual, expected);

  assert.equal(result.pass, true);
  assert.equal(result.reason, 'match');
  assert.equal(result.diffPixels, 0);
  assert.equal(result.diffRatio, 0);
});

test('a small raster difference within the default ratio tolerance passes', async () => {
  const expected = solidPng(20, 20, [240, 245, 255, 255]);
  const actual = changePixels(expected, [{ index: 137, rgba: [0, 0, 0, 255] }]);

  const result = await compare(actual, expected);

  assert.equal(result.pass, true);
  assert.equal(result.diffPixels, 1);
  assert.equal(result.allowedDiffPixels, 1);
});

test('a meaningful 42 percent visual change exceeds the default tolerance', async () => {
  const expected = solidPng(10, 10, [240, 245, 255, 255]);
  const changes = Array.from({ length: 42 }, (_, index) => ({
    index,
    rgba: [20, 30, 50, 255]
  }));
  const actual = changePixels(expected, changes);

  const result = await compare(actual, expected);

  assert.equal(result.pass, false);
  assert.equal(result.reason, 'pixel-difference');
  assert.equal(result.diffPixels, 42);
  assert.equal(result.diffRatio, 0.42);
  assert.ok(Buffer.isBuffer(result.diffPng));
  assert.deepEqual(
    { width: PNG.sync.read(result.diffPng).width, height: PNG.sync.read(result.diffPng).height },
    { width: 10, height: 10 }
  );
});

test('a change above an explicit one-pixel allowance fails', async () => {
  const expected = solidPng(10, 10, [240, 245, 255, 255]);
  const actual = changePixels(expected, [
    { index: 37, rgba: [220, 225, 235, 255] },
    { index: 38, rgba: [220, 225, 235, 255] }
  ]);

  const result = await compare(actual, expected, {
    colorThreshold: 0,
    maxDiffPixels: 1,
    maxDiffPixelRatio: 0
  });

  assert.equal(result.pass, false);
  assert.equal(result.reason, 'pixel-difference');
  assert.equal(result.diffPixels, 2);
  assert.equal(result.allowedDiffPixels, 1);
});

test('dimension mismatch fails exact validation and produces a visual diff artifact', async () => {
  const expected = solidPng(10, 10, [240, 245, 255, 255]);
  const actual = solidPng(11, 10, [240, 245, 255, 255]);

  const result = await compare(actual, expected);

  assert.equal(result.pass, false);
  assert.equal(result.reason, 'dimension-mismatch');
  assert.deepEqual(result.expectedDimensions, { width: 10, height: 10 });
  assert.deepEqual(result.actualDimensions, { width: 11, height: 10 });
  assert.deepEqual(
    { width: PNG.sync.read(result.diffPng).width, height: PNG.sync.read(result.diffPng).height },
    { width: 11, height: 10 }
  );
});
