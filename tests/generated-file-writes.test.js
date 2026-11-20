import {
  syncExpandedComponents,
  renderExpandedComponents,
} from '../scripts/generate-expanded-components.mjs';
import {
  syncContentOverflowCss,
  renderContentOverflowCss,
} from '../scripts/generate-content-overflow.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import * as generated from '../scripts/write-generated-file.mjs';
import { writeGeneratedFile } from '../scripts/write-generated-file.mjs';

/** @description Exercise bounded build-write retries without touching repository files. */
test('generated files retry transient Windows locks and preserve the requested bytes', async (context) => {
  const writes = [];
  context.mock.method(fs.promises, 'writeFile', async (...args) => {
    writes.push(args);
    if (writes.length < 3)
      throw Object.assign(new Error('Temporary file lock'), { code: 'UNKNOWN' });
  });

  await writeGeneratedFile('generated-example.css', 'body { color: inherit; }', 3);
  assert.deepEqual(
    writes,
    Array.from({ length: 3 }, () => ['generated-example.css', 'body { color: inherit; }']),
  );
});

test('generated file writes surface persistent locks after the bounded retry limit', async (context) => {
  const error = Object.assign(new Error('File remains locked'), { code: 'EBUSY' });
  const writer = context.mock.method(fs.promises, 'writeFile', async () => {
    throw error;
  });
  await assert.rejects(
    writeGeneratedFile('generated-example.css', 'body {}', 2),
    (failure) => failure === error,
  );
  assert.equal(writer.mock.callCount(), 2);
});

test('generated file writes do not retry non-transient filesystem errors', async (context) => {
  const error = Object.assign(new Error('Missing directory'), { code: 'ENOENT' });
  const writer = context.mock.method(fs.promises, 'writeFile', async () => {
    throw error;
  });
  await assert.rejects(
    writeGeneratedFile('generated-example.css', 'body {}'),
    (failure) => failure === error,
  );
  assert.equal(writer.mock.callCount(), 1);
});

/** Byte-identical artifacts must preserve file timestamps and leave watchers quiet. */
test('generated files skip writes when the existing bytes are identical', async (context) => {
  context.mock.method(fs.promises, 'readFile', async () => Buffer.from('same bytes'));
  const writer = context.mock.method(fs.promises, 'writeFile', async () => {});
  await writeGeneratedFile('generated-example.css', 'same bytes');
  assert.equal(writer.mock.callCount(), 0);
});

/** Read failures remain errors rather than being mistaken for a missing artifact. */
test('generated files do not replace unreadable existing output', async (context) => {
  const error = Object.assign(new Error('Unreadable output'), { code: 'EIO' });
  context.mock.method(fs.promises, 'readFile', async () => {
    throw error;
  });
  const writer = context.mock.method(fs.promises, 'writeFile', async () => {});
  await assert.rejects(
    writeGeneratedFile('generated-example.css', 'bytes'),
    (failure) => failure === error,
  );
  assert.equal(writer.mock.callCount(), 0);
});

/** Generated companion copies obey the same no-op contract for binary assets. */
test('generated copies skip identical binary output and replace changed bytes', async (context) => {
  const source = Buffer.from([0, 1, 255]);
  let target = Buffer.from(source);
  context.mock.method(fs.promises, 'readFile', async (file) =>
    file === 'source.bin' ? source : target,
  );
  const writer = context.mock.method(fs.promises, 'writeFile', async () => {});
  await generated.copyGeneratedFile('source.bin', 'target.bin');
  assert.equal(writer.mock.callCount(), 0);
  target = Buffer.from([0]);
  await generated.copyGeneratedFile('source.bin', 'target.bin');
  assert.equal(writer.mock.callCount(), 1);
  assert.deepEqual(writer.mock.calls[0].arguments, ['target.bin', source]);
});

/** Whole builds must not touch manifest-derived source modules when their bytes match. */
test('manifest-generated CSS retains identical artifacts without writes', (context) => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const components = '/* Authored */\n\n' + renderExpandedComponents(manifest) + '\n';
  const overflow = renderContentOverflowCss(manifest);
  context.mock.method(fs, 'readFileSync', (file) =>
    String(file).endsWith('components.css') ? components : overflow,
  );
  context.mock.method(fs, 'existsSync', () => true);
  const writer = context.mock.method(fs, 'writeFileSync', () => {});
  syncExpandedComponents('fixture', manifest);
  syncContentOverflowCss('fixture', manifest);
  assert.equal(writer.mock.callCount(), 0);
});
