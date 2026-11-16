import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

/** External textures preserve exact artwork while keeping focused CSS within its measured delivery budget. */
test('Paper Editorial keeps exact texture bytes outside the CSS payload', () => {
  const css = fs.readFileSync('dist/visual/paper-editorial.css');
  assert.ok(gzipSync(css).length < 90000, 'Focused Paper CSS must remain below 90 KB gzip');
  const textures = {
    light: '69a2da2efe466508205d48f83090043d784ea683853efc4ac0af85d65eb9f1cc',
    dark: '1a7aeb5014e045fa0f9b9d8facfb07680b44b732f1b6a77becaf62b9c4e768b1',
  };
  for (const [mode, digest] of Object.entries(textures)) {
    const asset = 'assets/paper-sheet-' + mode + '.png';
    const original = fs.readFileSync('styles/' + asset);
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      digest,
      mode + ' artwork fidelity',
    );
    assert.deepEqual(fs.readFileSync('dist/' + asset), original, mode + ' package asset parity');
    assert.ok(css.toString().includes('../' + asset), mode + ' focused relative URL');
  }
});
