import * as versions from '../scripts/sync-demo-asset-versions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Both demo entrypoints must request the exact current bytes, including bridge switches. */
test('demo asset URLs carry current content hashes', () => {
  for (const entry of [
    'index.html',
    'demo/index.html',
    'demo/reference.html',
    'demo/preview.html',
  ]) {
    const html = fs.readFileSync(entry, 'utf8');
    const assets = [
      ...html.matchAll(
        /(?:href|src|data-default-href|data-bridge-href)="([^"\s]+\.(?:css|js)(?:\?[^"\s]*)?)"/g,
      ),
    ]
      .map((match) => match[1])
      .filter((value) => !/^(?:https?:)?\/\//.test(value));
    assert.ok(assets.length > 5);
    for (const asset of assets) {
      const url = new URL(asset, 'https://demo.invalid/');
      const file = path.resolve(path.dirname(entry), asset.split('?')[0]);
      const hash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(file))
        .digest('hex')
        .slice(0, 12);
      assert.equal(url.searchParams.get('v'), hash, `${entry}: ${asset}`);
    }
  }
});

/** Rendered templates are versioned before writing, with stable URLs and no remote rewrites. */
test('demo template asset versioning is pure and idempotent', (context) => {
  context.mock.method(fs, 'readFileSync', () => Buffer.from('asset bytes'));
  const html =
    '<link href="app.css?feature=on"><script src="https://example.test/remote.js"></script>';
  const first = versions.versionDemoAssetUrls(path.resolve('fixture'), 'index.html', html);
  assert.match(first, /app\.css\?feature=on&v=[a-f0-9]{12}/);
  assert.equal(versions.versionDemoAssetUrls(path.resolve('fixture'), 'index.html', first), first);
  assert.match(first, /src="https:\/\/example\.test\/remote\.js"/);
});
