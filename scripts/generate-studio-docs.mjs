/**
 * @module scripts/generate-studio-docs
 * @description Generates granular studio API references directly from professional JSDoc.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsdoc2md from 'jsdoc-to-markdown';
import prettier from 'prettier';

const root = fileURLToPath(new URL('..', import.meta.url));
const sources = await fs.readdir(path.join(root, 'demo/studio'), { recursive: true });
const files = sources
  .filter((name) => name.endsWith('.js'))
  .sort()
  .map((name) => [
    'demo/studio/' + name.replaceAll('\\', '/'),
    'studio-' +
      name
        .replace(/\.js$/, '')
        .replaceAll(/[\\/]/g, '-')
        .replace(/^frame$/, 'preview'),
  ]);
files.push(
  ['scripts/build.mjs', 'build-library'],
  ['scripts/build-studio.mjs', 'build-studio'],
  ['scripts/serve-studio.mjs', 'serve-studio'],
);
const check = process.argv.includes('--check');
let drift = false;
for (const [source, name] of files) {
  const target = path.join(root, 'docs/api', name + '.md');
  const markdown = await jsdoc2md.render({
    source: await fs.readFile(path.join(root, source), 'utf8'),
    'heading-depth': 2,
  });
  const content = await prettier.format(
    '<!-- Generated with jsdoc2md from ' +
      source +
      '; do not edit by hand. -->\n\n# ' +
      name.replaceAll('-', ' ') +
      '\n\n' +
      markdown,
    { parser: 'markdown', printWidth: 100, proseWrap: 'preserve' },
  );
  if (check) {
    const actual = await fs.readFile(target, 'utf8').catch(() => null);
    if (actual !== content) {
      console.error('Generated documentation drift: ' + path.relative(root, target));
      drift = true;
    }
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
}
if (drift) process.exitCode = 1;
else
  console.log(
    check
      ? 'Studio API references are current.'
      : 'Generated ' + files.length + ' granular studio API references.',
  );
