import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { writeGeneratedFile } from './write-generated-file.mjs';

export const defaultBundleSizeEntries = [
  ['ui-style-kit-css/dist/ui-style-kit.min.css', 'dist/ui-style-kit.min.css'],
  ['ui-style-kit-css/visual.min.css', 'dist/ui-style-kit.visual.min.css'],
  ['ui-style-kit-css/visual/minimal-saas.css', 'dist/visual/minimal-saas.css'],
  ['ui-style-kit-css/visual/industrial-utility.css', 'dist/visual/industrial-utility.css'],
  ['ui-style-kit-css/with-bridge.css', 'dist/ui-style-kit.with-bridge.css'],
  ['ui-style-kit-css/theme-colors.css', 'styles/theme-colors.css'],
  ['ui-style-kit-css/native-elements.css', 'styles/native-elements.css'],
  ['ui-style-kit-css/content-overflow.css', 'styles/content-overflow.css'],
  ['ui-style-kit-css/interactive-surface-theme.css', 'styles/interactive-surface-theme.css']
];

/**
 * Formats a byte count as the approximate whole-kilobyte value used in README tables.
 *
 * @param {number} byteLength Number of bytes in the generated asset.
 * @returns {string} Approximate size label in kilobytes.
 */
function formatApproxKb(byteLength) {
  return `~${Math.round(byteLength / 1024)} KB`;
}

/**
 * Escapes a literal package import path for use in a regular expression.
 *
 * @param {string} value Literal text to escape.
 * @returns {string} Regular-expression-safe text.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Synchronizes documented raw and gzip bundle sizes with generated package artifacts.
 *
 * @param {string} root Absolute repository root.
 * @param {string[][]} [entries=defaultBundleSizeEntries] Import-path and artifact-path pairs.
 * @returns {Promise<void>} Resolves after the measured table has been written.
 */
export async function syncReadmeBundleSizes(root, entries = defaultBundleSizeEntries) {
  const readmePath = path.join(root, 'README.md');
  let readme = fs.readFileSync(readmePath, 'utf8');

  for (const [importPath, relativePath] of entries) {
    const css = fs.readFileSync(path.join(root, relativePath));
    const rawSize = formatApproxKb(css.byteLength);
    const gzipSize = formatApproxKb(zlib.gzipSync(css).byteLength);
    const row = new RegExp('(\\| `' + escapeRegExp(importPath) + '` \\|) [^|]+ (\\|) [^|]+ (\\|[^\\n]+\\|)');

    if (!row.test(readme)) {
      throw new Error(`README bundle size row is missing: ${importPath}`);
    }

    readme = readme.replace(row, `$1 ${rawSize} $2 ${gzipSize} $3`);
  }

  await writeGeneratedFile(readmePath, readme);
}
