/**
 * @module scripts/demo-asset-versions
 * @description Resolve content-versioned asset URLs before generated HTML reaches disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeGeneratedFile } from './write-generated-file.mjs';

/** Versions local CSS/JavaScript references without an intermediate template write.
 * Existing non-version query parameters and external URLs are preserved.
 * @param {string} root Absolute repository root.
 * @param {string} entry HTML path relative to the repository.
 * @param {string} html Rendered template contents.
 * @returns {string} Final HTML with current asset hashes.
 */
export function versionDemoAssetUrls(root, entry, html) {
  const filename = path.join(root, entry);
  return html.replace(
    /\b(data-default-href|data-bridge-href|href|src)="([^"\s]+\.(?:css|js)(?:\?[^"\s]*)?)"/g,
    (attribute, name, value) => {
      if (/^(?:https?:)?\/\//.test(value)) return attribute;
      const [asset] = value.split('?');
      const absolute = path.resolve(path.dirname(filename), asset);
      const relative = path.relative(root, absolute);
      if (relative.startsWith('..') || path.isAbsolute(relative))
        throw new Error('Demo asset escapes repository: ' + asset);
      const hash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(absolute))
        .digest('hex')
        .slice(0, 12);
      const url = new URL(value, 'https://demo.invalid/');
      url.searchParams.set('v', hash);
      return name + '="' + asset + '?' + url.searchParams + '"';
    },
  );
}

/** Refreshes all maintained entrypoints without touching already-current files.
 * @param {string} root Absolute repository root.
 * @returns {Promise<void>} Resolves when every local asset URL is current.
 */
export async function syncDemoAssetVersions(root) {
  for (const entry of [
    'index.html',
    'demo/index.html',
    'demo/reference.html',
    'demo/preview.html',
  ]) {
    const filename = path.join(root, entry);
    const original = fs.readFileSync(filename, 'utf8');
    const updated = versionDemoAssetUrls(root, entry, original);
    if (updated !== original) await writeGeneratedFile(filename, updated);
  }
}
