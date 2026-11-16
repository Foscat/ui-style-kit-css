import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('studio entrypoints expose the same workspace and use canonical composition', () => {
  for (const file of ['index.html', 'demo/index.html']) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /Style Studio/);
    assert.match(html, /id="preview-b"/);
    assert.match(html, /id="inspector"/);
    assert.match(html, /dist\/visual\/minimal-saas\.css/);
    assert.match(html, /interactive-surface-theme\.css/);
    assert.match(html, /vendor\/state-core\.css/);
    assert.doesNotMatch(html, /id="semantic-runtime"|with-bridge\.css/);
    assert.match(html, /<option value="minimal-saas" data-prefix="saas" selected>/);
  }
});

test('studio manifest records the current version and native palette roles', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync('demo/demo-manifest.js', 'utf8'), sandbox);
  const inventory = sandbox.window.UI_STYLE_KIT_MANIFEST;
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(inventory.studio.version, pkg.version);
  assert.match(inventory.studio.buildId, /^[a-f0-9]{12}$/);
  assert.equal(Object.keys(inventory.paletteRoles).length, inventory.presets.length);
  assert.ok(inventory.paletteRoles['tactile'].includes('primary'));
  assert.equal(inventory.icons.version, '2.0.0');
  assert.equal(inventory.icons.defaultPack, 'minimal-saas');
  assert.equal(inventory.icons.defaultVariant, 'monochrome');
  for (const { id } of inventory.presets) {
    for (const variant of ['monochrome', 'themed']) {
      const assets = { window: {} };
      vm.runInNewContext(
        fs.readFileSync('demo/icon-packs/' + id + '/' + variant + '.js', 'utf8'),
        assets,
      );
      for (const name of inventory.icons.names)
        assert.match(
          assets.window.UI_STYLE_KIT_ICON_ASSETS[id][variant][name],
          /<svg/,
          id + '/' + variant + '/' + name,
        );
    }
  }
});

test('authored references and licensed offline companions remain available', () => {
  for (const file of [
    'demo/reference.html',
    'demo/preview.html',
    'demo/vendor/layout.css',
    'demo/vendor/state-core.css',
    'demo/vendor/motion.css',
    'demo/vendor/layout-LICENSE.txt',
    'demo/vendor/interaction-LICENSE.txt',
    'demo/vendor/motion-LICENSE.txt',
    'demo/vendor/icons.css',
    'demo/vendor/icons-LICENSE.txt',
  ])
    assert.ok(fs.existsSync(file), file);
  const reference = fs.readFileSync('demo/reference.html', 'utf8');
  assert.match(reference, /id="semantic-runtime"/);
  assert.match(reference, /demo\.js/);
  assert.match(fs.readFileSync('demo/studio/specimens.js', 'utf8'), /abort\.abort/);
});

test('granular studio docs contain parsed module names and exported contracts', () => {
  for (const name of [
    'studio-state',
    'studio-protocol',
    'studio-examples',
    'studio-catalog',
    'studio-icons',
    'studio-preview',
    'studio-app',
    'studio-specimens',
    'build-studio',
    'serve-studio',
  ]) {
    const doc = fs.readFileSync('docs/api/' + name + '.md', 'utf8');
    assert.match(doc, /Generated with jsdoc2md/);
    assert.ok(doc.length > 500, name);
    assert.doesNotMatch(doc, /<a name="[^"]*\n/);
  }
  assert.match(fs.readFileSync('docs/api/studio-protocol.md', 'utf8'), /isFrameMessage/);
});

/** Generated runtime artifacts retain readable, content-versioned sources without catalog payload in the host. */
test('studio minified entrypoints link accurate source maps and keep payload budgets', async () => {
  const { createHash } = await import('node:crypto');
  const { specimenEntries } = await import('../demo/studio/specimen-inventory.js');
  for (const file of [
    'studio.js',
    'preview.js',
    'studio-specimens.js',
    'demo.js',
    ...specimenEntries.map((entry) => entry.file),
  ]) {
    const script = fs.readFileSync('demo/' + file, 'utf8');
    const mapBytes = fs.readFileSync('demo/' + file + '.map');
    const hash = createHash('sha256').update(mapBytes).digest('hex').slice(0, 12);
    assert.ok(
      script.endsWith('//# sourceMappingURL=' + file.split('/').at(-1) + '.map?v=' + hash + '\n'),
      file,
    );
    const map = JSON.parse(mapBytes);
    assert.equal(map.version, 3);
    assert.equal(map.sources.length, map.sourcesContent.length);
    assert.ok(
      map.sources.some((source) => source.includes('studio/')),
      file,
    );
  }
  const host = fs.readFileSync('demo/studio.js', 'utf8');
  assert.ok(Buffer.byteLength(host) < 40000, 'Host stays below 40 KB');
  assert.ok(
    !host.includes('button-indeterminate') && !host.includes('checkbox-indeterminate'),
    'Host does not bundle catalog markup',
  );
  const full = fs.statSync('dist/ui-style-kit.visual.css').size;
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const { id } of manifest.presets)
    assert.ok(fs.statSync('dist/visual/' + id + '.css').size < full * 0.25, id);
});

/** Both document consumers share maintained CSS without redundant preview files or build copies. */
test('demo uses shared authored stylesheets without preview copies', () => {
  for (const file of [
    'index.html',
    'demo/index.html',
    'demo/preview.html',
    'demo/reference.html',
  ]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /href="(?:demo\/)?demo\.css(?:\?[^"\s]*)?"/, file);
    assert.doesNotMatch(html, /href="[^"\s]*preview\.css/, file);
  }
  for (const file of ['demo/preview.css', 'demo/studio/preview.css', 'demo/studio/studio.css'])
    assert.equal(fs.existsSync(file), false, file);
});
