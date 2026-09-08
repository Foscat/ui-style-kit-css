import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { writeGeneratedFile } from '../scripts/write-generated-file.mjs';

/** @description Exercise bounded build-write retries without touching repository files. */
test('generated files retry transient Windows locks and preserve the requested bytes', async (context) => {
  const writes = [];
  context.mock.method(fs.promises, 'writeFile', async (...args) => {
    writes.push(args);
    if (writes.length < 3) throw Object.assign(new Error('Temporary file lock'), { code: 'UNKNOWN' });
  });

  await writeGeneratedFile('generated-example.css', 'body { color: inherit; }', 3);
  assert.deepEqual(writes, Array.from({ length: 3 }, () => ['generated-example.css', 'body { color: inherit; }']));
});

test('generated file writes surface persistent locks after the bounded retry limit', async (context) => {
  const error = Object.assign(new Error('File remains locked'), { code: 'EBUSY' });
  const writer = context.mock.method(fs.promises, 'writeFile', async () => { throw error; });
  await assert.rejects(writeGeneratedFile('generated-example.css', 'body {}', 2), (failure) => failure === error);
  assert.equal(writer.mock.callCount(), 2);
});

test('generated file writes do not retry non-transient filesystem errors', async (context) => {
  const error = Object.assign(new Error('Missing directory'), { code: 'ENOENT' });
  const writer = context.mock.method(fs.promises, 'writeFile', async () => { throw error; });
  await assert.rejects(writeGeneratedFile('generated-example.css', 'body {}'), (failure) => failure === error);
  assert.equal(writer.mock.callCount(), 1);
});
