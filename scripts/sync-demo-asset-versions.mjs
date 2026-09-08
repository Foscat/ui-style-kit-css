import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeGeneratedFile } from './write-generated-file.mjs';

/**
 * Refreshes local demo asset URLs when their bytes change, including bridge bundle metadata.
 * Only quoted CSS/JavaScript attributes in the two maintained entrypoints are rewritten.
 * @param {string} root Repository root directory.
 * @returns {Promise<void>} Resolves after both entrypoints contain current asset hashes.
 */
export async function syncDemoAssetVersions(root) {
  for (const entry of ['index.html', 'demo/index.html']) {
    const filename = path.join(root, entry);
    const original = fs.readFileSync(filename, 'utf8');
    const updated = original.replace(/\b(data-default-href|data-bridge-href|href|src)="([^"\s]+\.(?:css|js)(?:\?[^"\s]*)?)"/g, (attribute, name, value) => {
      if (/^(?:https?:)?\/\//.test(value)) return attribute;
      const [asset] = value.split('?');
      const absolute = path.resolve(path.dirname(filename), asset);
      const relative = path.relative(root, absolute);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Demo asset escapes repository: ${asset}`);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex').slice(0, 12);
      const url = new URL(value, 'https://demo.invalid/');
      url.searchParams.set('v', hash);
      return `${name}="${asset}?${url.searchParams}"`;
    });
    if (updated !== original) await writeGeneratedFile(filename, updated);
  }
}
