import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

/** Verifies the documented one-to-one source mapping against authored and packaged APIs. */
test('Bento source mapping is public in authored and focused CSS', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const publicClasses = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras.bento].map(name => `bento-${name}`));
  const mapping = [...fs.readFileSync('docs/BENTO.md', 'utf8').matchAll(/\| `\.(?:bm-[a-z-]+|bento-ui)` \| `\.(bento-[a-z-]+)` \|/g)].map(match => match[1]);
  assert.ok(mapping.length >= 50, 'The entire retained component surface must be mapped');
  for (const file of ['styles/bento.css', 'dist/visual/bento.css']) {
    const classes = new Set();
    walk(parse(fs.readFileSync(file, 'utf8')), { visit: 'ClassSelector', enter(node) { classes.add(node.name); } });
    for (const name of mapping) {
      assert.ok(publicClasses.has(name), `${name} is missing from the manifest`);
      assert.ok(classes.has(name), `${name} is missing from ${file}`);
    }
  }
  const css = fs.readFileSync('styles/bento.css', 'utf8');
  const definitions = new Set([...css.matchAll(/(--bento-mosaic-[a-z-]+)\s*:/g)].map(match => match[1]));
  for (const match of css.matchAll(/var\((--bento-mosaic-[a-z-]+)/g)) assert.ok(definitions.has(match[1]), `Unresolved template role ${match[1]}`);
  assert.ok(fs.statSync('dist/assets/bento-manrope.ttf').size > 10000);
  assert.match(fs.readFileSync('styles/assets/bento-manrope-OFL.txt', 'utf8'), /SIL OPEN FONT LICENSE/);
});
