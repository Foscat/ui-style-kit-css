import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const stylesDir = path.join(rootDir, 'styles');

function styleFiles() {
  return fs.readdirSync(stylesDir)
    .filter((file) => file.endsWith('.css'))
    .map((file) => path.join(stylesDir, file));
}

function declarationBlocks(css) {
  const blocks = [];
  const re = /\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(css))) blocks.push(match[1]);
  return blocks;
}

function declarations(block) {
  return block
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.match(/^(-(?:webkit|moz)-[a-z-]+|[a-z-]+)\s*:/)?.[1])
    .filter(Boolean);
}

function baseProperty(property) {
  return property.replace(/^-(?:webkit|moz)-/, '');
}

test('vendor-prefixed declarations are grouped before standard declarations', () => {
  for (const file of styleFiles()) {
    const css = fs.readFileSync(file, 'utf8');
    for (const block of declarationBlocks(css)) {
      const props = declarations(block);
      const firstIndex = new Map();
      props.forEach((prop, index) => {
        if (!firstIndex.has(prop)) firstIndex.set(prop, index);
      });

      for (const prop of props) {
        if (!prop.startsWith('-webkit-') && !prop.startsWith('-moz-')) continue;

        const base = baseProperty(prop);
        const standardIndex = firstIndex.get(base);
        if (standardIndex !== undefined) {
          assert.ok(
            firstIndex.get(prop) < standardIndex,
            `${path.relative(rootDir, file)} should place ${prop} before ${base}`
          );
        }

        const webkitIndex = firstIndex.get(`-webkit-${base}`);
        const mozIndex = firstIndex.get(`-moz-${base}`);
        if (webkitIndex !== undefined && mozIndex !== undefined) {
          assert.ok(
            webkitIndex < mozIndex,
            `${path.relative(rootDir, file)} should place -webkit-${base} before -moz-${base}`
          );
        }
      }
    }
  }
});

test('font smoothing includes WebKit and Firefox declarations together', () => {
  for (const file of styleFiles()) {
    if (path.basename(file) === 'interactive-surface-bridge.css') continue;

    const css = fs.readFileSync(file, 'utf8');
    if (!css.includes('-webkit-font-smoothing')) continue;

    assert.match(
      css,
      /-webkit-font-smoothing:\s*antialiased;\s*-moz-osx-font-smoothing:\s*grayscale;/,
      `${path.relative(rootDir, file)} should include Firefox font smoothing next to WebKit smoothing`
    );
  }
});

