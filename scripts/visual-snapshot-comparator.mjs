import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const DEFAULT_VISUAL_SNAPSHOT_COMPARISON = Object.freeze({
  colorThreshold: 0.1,
  includeAntialiasing: false,
  maxDiffPixels: 0,
  maxDiffPixelRatio: 0.0025
});

export function comparePngSnapshots(actualBuffer, expectedBuffer, overrides = {}) {
  const options = normalizeOptions(overrides);
  const actual = PNG.sync.read(actualBuffer);
  const expected = PNG.sync.read(expectedBuffer);
  const actualDimensions = dimensionsOf(actual);
  const expectedDimensions = dimensionsOf(expected);

  if (actual.width !== expected.width || actual.height !== expected.height) {
    return {
      pass: false,
      reason: 'dimension-mismatch',
      actualDimensions,
      expectedDimensions,
      diffPixels: null,
      diffRatio: null,
      allowedDiffPixels: 0,
      diffPng: createDimensionMismatchDiff(actual, expected)
    };
  }

  const diff = new PNG({ width: expected.width, height: expected.height });
  const diffPixels = pixelmatch(actual.data, expected.data, diff.data, expected.width, expected.height, {
    threshold: options.colorThreshold,
    includeAA: options.includeAntialiasing,
    diffColor: [255, 0, 76],
    aaColor: [255, 193, 7]
  });
  const totalPixels = expected.width * expected.height;
  const ratioAllowance = Math.floor(totalPixels * options.maxDiffPixelRatio);
  const allowedDiffPixels = Math.max(options.maxDiffPixels, ratioAllowance);
  const pass = diffPixels <= allowedDiffPixels;

  return {
    pass,
    reason: pass ? 'match' : 'pixel-difference',
    actualDimensions,
    expectedDimensions,
    diffPixels,
    diffRatio: diffPixels / totalPixels,
    allowedDiffPixels,
    colorThreshold: options.colorThreshold,
    diffPng: PNG.sync.write(diff)
  };
}

function normalizeOptions(overrides) {
  const options = { ...DEFAULT_VISUAL_SNAPSHOT_COMPARISON, ...overrides };
  assertUnitInterval(options.colorThreshold, 'colorThreshold');
  assertUnitInterval(options.maxDiffPixelRatio, 'maxDiffPixelRatio');
  if (!Number.isInteger(options.maxDiffPixels) || options.maxDiffPixels < 0) {
    throw new TypeError('maxDiffPixels must be a non-negative integer.');
  }
  if (typeof options.includeAntialiasing !== 'boolean') {
    throw new TypeError('includeAntialiasing must be a boolean.');
  }
  return options;
}

function assertUnitInterval(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new TypeError(`${name} must be a finite number between 0 and 1.`);
  }
}

function dimensionsOf(png) {
  return { width: png.width, height: png.height };
}

function createDimensionMismatchDiff(actual, expected) {
  const width = Math.max(actual.width, expected.width);
  const height = Math.max(actual.height, expected.height);
  const diff = new PNG({ width, height });

  // Cyan and magenta expose each overhanging dimension; red marks changed overlap pixels.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outputOffset = (y * width + x) * 4;
      const actualInBounds = x < actual.width && y < actual.height;
      const expectedInBounds = x < expected.width && y < expected.height;

      if (!actualInBounds) {
        diff.data.set([255, 0, 255, 255], outputOffset);
      } else if (!expectedInBounds) {
        diff.data.set([0, 229, 255, 255], outputOffset);
      } else {
        const actualOffset = (y * actual.width + x) * 4;
        const expectedOffset = (y * expected.width + x) * 4;
        const equal = rgbaEqual(actual.data, actualOffset, expected.data, expectedOffset);
        diff.data.set(equal ? [236, 239, 244, 255] : [255, 0, 76, 255], outputOffset);
      }
    }
  }

  return PNG.sync.write(diff);
}

function rgbaEqual(actual, actualOffset, expected, expectedOffset) {
  return (
    actual[actualOffset] === expected[expectedOffset] &&
    actual[actualOffset + 1] === expected[expectedOffset + 1] &&
    actual[actualOffset + 2] === expected[expectedOffset + 2] &&
    actual[actualOffset + 3] === expected[expectedOffset + 3]
  );
}
