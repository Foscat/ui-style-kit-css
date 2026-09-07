import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Both demo entrypoints must request the exact current bytes, including bridge switches. */
test('demo asset URLs carry current content hashes', () => {
  for (const entry of ['index.html', 'demo/index.html']) {
    const html = fs.readFileSync(entry, 'utf8');
    const assets = [...html.matchAll(/(?:href|src|data-default-href|data-bridge-href)="([^"\s]+\.(?:css|js)(?:\?[^"\s]*)?)"/g)]
      .map((match) => match[1]).filter((value) => !/^(?:https?:)?\/\//.test(value));
    assert.ok(assets.length > 5);
    for (const asset of assets) {
      const url = new URL(asset, 'https://demo.invalid/');
      const file = path.resolve(path.dirname(entry), asset.split('?')[0]);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
      assert.equal(url.searchParams.get('v'), hash, `${entry}: ${asset}`);
    }
  }
});
