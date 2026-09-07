import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../demo/demo.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

/**
 * Exercises the demo's actual palette controller without launching a browser.
 * CSS resolution is an injected boundary; browser coverage verifies real paint.
 * @returns {object} Isolated controller, controls, and observable style state.
 */
function createWorkbench() {
  const inline = new Map();
  const nativeProperties = new Map();
  const controls = Object.fromEntries(['uiSelect', 'themeSelect', 'modeSelect'].map((id) => [id, {
    value: { uiSelect: 'minimal-saas', themeSelect: '', modeSelect: 'light' }[id],
    replaceChildren(...options) { this.options = options; this.value = options.find((option) => option.selected)?.value ?? options[0]?.value; }
  }]));
  const body = {
    dataset: {},
    style: { setProperty: (name, value) => inline.set(name, value), removeProperty: (name) => inline.delete(name) },
    removeAttribute(name) { delete this.dataset[name.slice(5)]; }
  };
  const palettes = new Map();
  for (const { id, prefix } of manifest.presets) {
    const css = fs.readFileSync(new URL(`../styles/${id}.css`, import.meta.url), 'utf8');
    for (const mode of manifest.modes) {
      const block = css.split(`[data-ui="${id}"][data-mode="${mode}"] {`)[1].split('}')[0];
      palettes.set(`${id}|${mode}`, new Map([...block.matchAll(new RegExp(`--${prefix}-fallback-([\\w-]+)-rgb:\\s*([\\d ]+);`, 'g'))]
        .map(([, role, value]) => [role, value.trim()])));
    }
  }
  const preview = { textContent: '' };
  const sandbox = {
    URLSearchParams,
    window: { UI_STYLE_KIT_MANIFEST: manifest, location: { search: '' } },
    document: {
      body,
      createElement: () => ({ dataset: {} }),
      getElementById: (id) => controls[id] ?? { dataset: { defaultHref: 'dist/ui-style-kit.css' } },
      querySelector: () => preview
    },
    getComputedStyle: () => ({
      [Symbol.iterator]: function* () { yield* nativeProperties.keys(); },
      getPropertyValue(name) {
        if (inline.has(name)) return inline.get(name);
        if (nativeProperties.has(name)) return nativeProperties.get(name);
        const role = name.replace(/^--(?:usk|[\w]+)-/, '').replace(/-rgb$/, '');
        if (name.startsWith('--usk-')) return body.dataset.theme ? '64 94 184' : '';
        return inline.get(`--usk-${role}-rgb`) ?? palettes.get(`${body.dataset.ui}|${body.dataset.mode}`)?.get(role) ?? '';
      }
    })
  };
  // Omit only bootstrapping; execute the real declarations, not rewritten helpers.
  vm.runInNewContext(source.slice(0, source.lastIndexOf('\nsyncManifestSelectOptions();')), sandbox);
  return { app: sandbox, controls, body, inline, palettes, preview, nativeProperties };
}

test('None and null selections activate the native palette for every preset and mode', () => {
  const { app, controls, body, inline, palettes } = createWorkbench();
  for (const { id, prefix } of manifest.presets) {
    controls.uiSelect.value = id;
    for (const mode of manifest.modes) {
      controls.modeSelect.value = mode;
      for (const theme of [null, '', 'None', 'null', 'reference-palette']) {
        controls.themeSelect.value = theme;
        app.applyPaletteSelection();
        assert.equal(body.dataset.theme, undefined, `${id}/${mode}/${theme}`);
        assert.equal(controls.themeSelect.value, '');
        const tokens = app.getActiveColorTokens();
        assert.equal(tokens.length, 23);
        for (const token of tokens) assert.equal(token.value, palettes.get(`${id}|${mode}`).get(token.role));
        assert.equal(inline.get('--demo-primary-rgb'), `var(--${prefix}-primary-rgb)`);
      }
    }
  }
});

test('native edits are isolated by preset and mode while named-theme edits follow the theme', () => {
  const { app, controls, inline, palettes } = createWorkbench();
  const primary = () => app.getActiveColorTokens().find(({ role }) => role === 'primary').value;
  app.applyPaletteSelection();
  app.setTokenOverride('primary', '18 52 86');
  assert.equal(primary(), '18 52 86');
  controls.uiSelect.value = 'y2k';
  app.applyPaletteSelection();
  assert.equal(primary(), palettes.get('y2k|light').get('primary'));
  controls.uiSelect.value = 'minimal-saas';
  controls.modeSelect.value = 'dark';
  app.applyPaletteSelection();
  assert.equal(primary(), palettes.get('minimal-saas|dark').get('primary'));
  controls.modeSelect.value = 'light';
  app.applyPaletteSelection();
  assert.equal(primary(), '18 52 86');
  controls.themeSelect.value = 'arctic-indigo';
  app.applyPaletteSelection();
  assert.equal(primary(), '64 94 184');
  app.setTokenOverride('primary', '25 75 125');
  controls.uiSelect.value = 'y2k';
  app.applyPaletteSelection();
  assert.equal(primary(), '25 75 125');
  app.resetTokenOverride('primary');
  assert.equal(inline.has('--usk-primary-rgb'), false);
  assert.equal(primary(), '64 94 184');
  controls.themeSelect.value = '';
  controls.uiSelect.value = 'minimal-saas';
  app.applyPaletteSelection();
  app.resetTokenOverride('primary');
  assert.equal(primary(), palettes.get('minimal-saas|light').get('primary'));
});

test('copyable native overrides and usage omit data-theme and scope edits to the active preset', () => {
  const { app, controls } = createWorkbench();
  app.applyPaletteSelection();
  app.setTokenOverride('primary', '18 52 86');
  assert.match(app.buildThemeOverrideCss(), /\[data-ui="minimal-saas"\]:not\(\[data-theme\]\)\[data-mode="light"\]/);
  assert.match(app.buildThemeOverrideCss(), /--saas-primary-rgb: 18 52 86;/);
  assert.equal(app.getThemeUsageStatement(), 'document.body.removeAttribute("data-theme");');
  controls.themeSelect.value = 'arctic-indigo';
  app.applyPaletteSelection();
  assert.match(app.buildThemeOverrideCss(), /\[data-ui\]\[data-theme="arctic-indigo"\]\[data-mode="light"\]/);
  assert.equal(app.getThemeUsageStatement(), 'document.body.dataset.theme = "arctic-indigo";');
});

test('manifest options expose None once and preserve explicit theme selections', () => {
  const { app, controls } = createWorkbench();
  app.syncManifestSelectOptions();
  assert.equal(controls.themeSelect.options.length, manifest.themes.length + 1);
  assert.equal(controls.themeSelect.options[0].textContent, 'None — style defaults');
  assert.equal(controls.themeSelect.value, '');
  controls.themeSelect.value = 'arctic-indigo';
  app.syncManifestSelectOptions();
  assert.equal(controls.themeSelect.value, 'arctic-indigo');
});

test('invalid values do not change colors and palette reset preserves other contexts', () => {
  const { app, controls, inline } = createWorkbench();
  app.applyPaletteSelection();
  app.setTokenOverride('primary', '18 52 86');
  for (const value of ['', '256 0 0', '-1 2 3', '1.5 2 3', '1 2', '1 2 3 4', 'red']) {
    assert.equal(app.setTokenOverride('primary', value), '');
    assert.equal(inline.get('--saas-primary-rgb'), '18 52 86');
  }
  assert.equal(app.setTokenOverride('unknown-role', '1 2 3'), '');
  controls.modeSelect.value = 'dark';
  app.applyPaletteSelection();
  app.setTokenOverride('primary', '100 150 200');
  app.resetPaletteOverrides();
  assert.equal(inline.has('--saas-primary-rgb'), false);
  controls.modeSelect.value = 'light';
  app.applyPaletteSelection();
  assert.equal(inline.get('--saas-primary-rgb'), '18 52 86');
});

test('native material colors are editable and exported without injecting a shared theme', () => {
  const { app, controls, nativeProperties, inline } = createWorkbench();
  controls.uiSelect.value = 'tactile';
  nativeProperties.set('--tactile-paper-rgb', '246 240 224');
  nativeProperties.set('--tactile-ink-rgb', '45 40 34');
  nativeProperties.set('--tactile-fallback-bg-rgb', '248 242 231');
  app.applyPaletteSelection();
  const paper = app.getActiveColorTokens().find(({ role }) => role === 'paper');
  assert.ok(paper, 'The native inventory must include the active paper material');
  assert.deepEqual(JSON.parse(JSON.stringify(paper)), {
    role: 'paper', name: '--tactile-paper-rgb', value: '246 240 224'
  });
  assert.ok(!app.getActiveColorTokens().some(({ role }) => role.startsWith('fallback-')));
  app.setTokenOverride('paper', '210 200 180');
  assert.equal(inline.get('--tactile-paper-rgb'), '210 200 180');
  assert.match(app.buildThemeOverrideCss(), /--tactile-paper-rgb: 210 200 180;/);
  assert.ok(![...inline.keys()].some((name) => name.startsWith('--usk-')));
  controls.themeSelect.value = 'arctic-indigo';
  app.applyPaletteSelection();
  assert.equal(inline.has('--tactile-paper-rgb'), false);
  assert.ok(app.getActiveColorTokens().every(({ name }) => name.startsWith('--usk-')));
  controls.themeSelect.value = '';
  app.applyPaletteSelection();
  assert.equal(inline.get('--tactile-paper-rgb'), '210 200 180');
  app.resetTokenOverride('paper');
  assert.equal(inline.has('--tactile-paper-rgb'), false);
});

test('demo deep links honor supported presets, palettes and modes without accepting unknown values', () => {
  const { app, controls } = createWorkbench();
  app.window.location.search = '?personality=maximalist&theme=None&mode=dark';
  app.applyDemoQuerySelection();
  assert.equal(controls.uiSelect.value, 'maximalist');
  assert.equal(controls.themeSelect.value, '');
  assert.equal(controls.modeSelect.value, 'dark');
  app.window.location.search = '?ui=tactile&personality=maximalist&theme=arctic-indigo&mode=contrast';
  app.applyDemoQuerySelection();
  assert.equal(controls.uiSelect.value, 'tactile');
  assert.equal(controls.themeSelect.value, 'arctic-indigo');
  assert.equal(controls.modeSelect.value, 'contrast');
  app.window.location.search = '?ui=__proto__&theme=invalid&mode=invalid';
  app.applyDemoQuerySelection();
  assert.equal(controls.uiSelect.value, 'tactile');
  assert.equal(controls.themeSelect.value, '');
  assert.equal(controls.modeSelect.value, 'contrast');
});
