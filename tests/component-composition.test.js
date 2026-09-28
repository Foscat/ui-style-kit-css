import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const compositionFile = new URL('../styles/component-composition.css', import.meta.url);
const packageFile = new URL('../package.json', import.meta.url);
const visualBundleFile = new URL('../dist/ui-style-kit.visual.css', import.meta.url);
const defaultBundleFile = new URL('../dist/ui-style-kit.css', import.meta.url);

test('component composition is owned and exported by the CSS library', () => {
  assert.equal(fs.existsSync(compositionFile), true);

  const css = fs.readFileSync(compositionFile, 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

  assert.match(css, /\.usk-button__icon\s*\{/);
  assert.match(css, /\.usk-modal__surface\s*\{/);
  assert.match(css, /\.usk-image-preview__viewport/);
  assert.equal(
    packageJson.exports['./component-composition.css'],
    './styles/component-composition.css'
  );
  assert.doesNotMatch(
    fs.readFileSync(visualBundleFile, 'utf8'),
    /\.usk-modal__surface\s*\{/,
    'optional component geometry must stay out of the visual-only bundle'
  );
  assert.doesNotMatch(
    fs.readFileSync(defaultBundleFile, 'utf8'),
    /\.usk-modal__surface\s*\{/,
    'optional component geometry must require its explicit package import'
  );
});
