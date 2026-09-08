import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

/** Verifies the documented reference mapping and packaged font dependencies. */
test('Bauhaus template mapping and local fonts are part of the public package', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const publicClasses = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras.bauhaus].map(name => `bau-${name}`));
  const mapping = [...fs.readFileSync('docs/BAUHAUS.md', 'utf8').matchAll(/\| `\.(?:bh-[a-z-]+|bauhaus-ui)` \| `\.(bau-[a-z-]+)` \|/g)].map(match => match[1]);
  assert.ok(mapping.length >= 60, 'The full reference component inventory must be mapped');
  for (const file of ['styles/bauhaus.css', 'dist/visual/bauhaus.css']) {
    const classes = new Set();
    walk(parse(fs.readFileSync(file, 'utf8')), { visit: 'ClassSelector', enter(node) { classes.add(node.name); } });
    for (const name of mapping) {
      assert.ok(publicClasses.has(name), `${name} absent from manifest`);
      assert.ok(classes.has(name), `${name} absent from ${file}`);
    }
  }
  for (const name of ['bauhaus-barlow', 'bauhaus-barlow-semibold', 'bauhaus-condensed-bold', 'bauhaus-condensed-extrabold']) assert.ok(fs.statSync(`dist/assets/${name}.ttf`).size > 10000);
  for (const family of ['barlow', 'condensed']) assert.match(fs.readFileSync(`styles/assets/bauhaus-${family}-OFL.txt`, 'utf8'), /SIL OPEN FONT LICENSE/);
});
