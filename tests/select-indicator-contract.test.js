import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk, generate } from 'css-tree';
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

/** Indicators share legible geometry; native color tokens retain each preset's palette. */
test('every select indicator uses joined halves without font glyphs or decorative geometry', () => {
  const expected = {
    '--usk-native-select-indicator-image':
      'linear-gradient(45deg,transparent 50%,var(--usk-native-indicator) 50%),linear-gradient(135deg,var(--usk-native-indicator) 50%,transparent 50%)',
    '--usk-native-select-indicator-size': '.3rem .3rem,.3rem .3rem',
    '--usk-native-select-indicator-position': 'calc(100% - 1rem) 50%,calc(100% - .7rem) 50%',
  };
  for (const { id } of manifest.presets) {
    const source = fs.readFileSync('styles/' + id + '.css', 'utf8');
    const found = new Map();
    walk(parse(source), {
      visit: 'Declaration',
      enter(node) {
        if (node.property in expected)
          found.set(
            node.property,
            generate(parse(generate(node.value).trim(), { context: 'value' })),
          );
      },
    });
    if (id === 'neo-noir') {
      assert.equal(found.get('--usk-native-select-indicator-image'), 'none');
      continue;
    }
    for (const [property, value] of Object.entries(expected))
      assert.equal(found.get(property), value, id + ' ' + property);
  }
  assert.equal(
    fs
      .readFileSync('styles/paper-editorial.css', 'utf8')
      .includes('content: "' + String.fromCodePoint(0x2304) + '"'),
    false,
  );
});
