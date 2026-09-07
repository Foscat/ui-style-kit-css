import assert from 'node:assert/strict';
import test from 'node:test';
import uri from 'fast-uri';
import Ajv from 'ajv';

/**
 * Check that normalization either rejects malformed input or retains a harmless representation.
 * @param {string} input Untrusted URI fixture; never fetched over the network.
 * @param {(normalized: string) => void} verify Safety assertion for a returned representation.
 * @returns {void}
 */
function assertSafeNormalization(input, verify) {
  let normalized;
  try {
    normalized = uri.normalize(input);
  } catch (error) {
    assert.ok(error instanceof Error);
    return;
  }
  verify(normalized);
}

test('release URI tooling rejects host confusion across malformed and encoded inputs', () => {
  for (const host of ['[::not-valid]', '[fc00::not-hex]', '[fe80::not-hex]']) {
    assert.ok(uri.parse(`http://${host}/private`).error, `Malformed host must fail: ${host}`);
  }
  for (const input of ['%2f%2fevil.example:/pwn', '%u002f%u002fevil.example:/pwn', 'http%0d%0a:/path']) {
    assertSafeNormalization(input, (normalized) => {
      assert.doesNotMatch(normalized, /^\/\/evil\.example|[\r\n]/);
    });
  }
  assertSafeNormalization('http://%256c%256f%2563%2561%256c%2568%256f%2573%2574/', (normalized) => {
    assert.notEqual(normalized, 'http://localhost/');
  });
  const resolved = uri.resolve('https://example.com/base', '//ｅxample.com/path');
  assert.equal(resolved, 'https://example.com/path');
});

test('release URI tooling preserves ordinary AJV schema references and URI resolution', () => {
  assert.equal(uri.resolve('https://example.com/schemas/root.json', './child.json'), 'https://example.com/schemas/child.json');
  assert.equal(uri.normalize('https://EXAMPLE.com/path'), 'https://example.com/path');
  const ajv = new Ajv();
  ajv.addSchema({ $id: 'https://example.com/schemas/name.json', type: 'string', minLength: 1 });
  const validate = ajv.compile({
    $id: 'https://example.com/schemas/root.json',
    type: 'object',
    required: ['name'],
    properties: { name: { $ref: './name.json' } }
  });
  assert.equal(validate({ name: 'Release candidate' }), true);
  assert.equal(validate({ name: '' }), false);
});
