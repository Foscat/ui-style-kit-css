import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMatrixBlocks,
  locateGlobalMatrixCase,
  projectSlicesForRange
} from '../scripts/run-ui-matrix.mjs';

const projects = ['chromium', 'firefox', 'webkit'];

test('UI matrix is partitioned into 36 stable blocks of 100 global cases', () => {
  const blocks = createMatrixBlocks(3_600, 36);

  assert.equal(blocks.length, 36);
  assert.deepEqual(blocks[0], { number: 1, start: 1, end: 100 });
  assert.deepEqual(blocks[9], { number: 10, start: 901, end: 1_000 });
  assert.deepEqual(blocks[32], { number: 33, start: 3_201, end: 3_300 });
  assert.deepEqual(blocks[35], { number: 36, start: 3_501, end: 3_600 });
});

test('an exact global case maps to one browser project and one logical case', () => {
  assert.deepEqual(locateGlobalMatrixCase(3_245, 1_200, projects), {
    globalCase: 3_245,
    project: 'webkit',
    projectIndex: 2,
    localCase: 845
  });
});

test('a range crossing a browser boundary is split without repeating cases', () => {
  assert.deepEqual(projectSlicesForRange(1_190, 1_210, 1_200, projects), [
    {
      project: 'chromium',
      globalStart: 1_190,
      globalEnd: 1_200,
      localStart: 1_190,
      localEnd: 1_200
    },
    {
      project: 'firefox',
      globalStart: 1_201,
      globalEnd: 1_210,
      localStart: 1,
      localEnd: 10
    }
  ]);
});
