import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('../demo/demo.js', import.meta.url), 'utf8');

/**
 * Loads the authored renderers without browser bootstrapping or approximating their HTML.
 * @param {string} search Demo query string.
 * @returns {object} Isolated renderer context.
 */
function createShowcase(search = '') {
  const context = vm.createContext({
    URL,
    URLSearchParams,
    location: { pathname: '/index.html' },
    window: { UI_STYLE_KIT_MANIFEST: manifest, UI_STYLE_KIT_ICONS: {}, location: { search } },
    document: {
      currentScript: { src: 'https://demo.example/demo/module.js' },
      getElementById: () => ({ value: 'light', dataset: { defaultHref: 'dist/ui-style-kit.css' } })
    }
  });
  for (const name of ['art-deco', 'editorial-lux', 'neo-noir', 'clay', 'organic', 'bento', 'bauhaus']) {
    vm.runInContext(fs.readFileSync(new URL(`../demo/demo-${name}.js`, import.meta.url), 'utf8'), context);
  }
  vm.runInContext(source.slice(0, source.lastIndexOf('\nsyncManifestSelectOptions();')), context);
  return context;
}

test('public demo omits full template boards while reference view retains them', () => {
  const publicDemo = createShowcase();
  const reference = createShowcase('?view=reference');
  for (const { id, prefix } of manifest.presets) {
    assert.equal(publicDemo.renderTemplateReferences(id, prefix), '', id);
    const gallery = publicDemo.renderStyleSpecificGallery(id, prefix);
    assert.match(gallery, /id="style-specific"/, id);
    assert.match(gallery, /Style-specific components/, id);
    assert.doesNotMatch(gallery, /data-testid="[\w-]+-template-specimen"/, id);
    assert.equal(reference.renderStyleSpecificGallery(id, prefix), '', id);
  }
  assert.match(reference.renderTemplateReferences('industrial-utility', 'utility'), /data-testid="industrial-utility-template-specimen"/);
  assert.match(reference.renderTemplateReferences('clay', 'clay'), /clay-sheet/);
  assert.match(reference.renderTemplateReferences('cyberpunk', 'cyber'), /cyberpunk-template-specimen/);
  assert.ok(source.indexOf('${renderStyleSpecificGallery(ui, p)}') > source.indexOf('<section id="components"'));
});

test('Industrial gallery keeps working instruments and alarm flow without duplicate board chrome', () => {
  const app = createShowcase();
  const gallery = app.renderStyleSpecificGallery('industrial-utility', 'utility');
  for (const control of ['utility-key-switch', 'utility-emergency-stop', 'utility-pilot-light', 'utility-three-position', 'utility-pressure', 'utility-stage-track', 'data-utility-critical', 'data-utility-ack-open', 'data-utility-silence', 'data-utility-dialog-confirm', 'data-utility-feedback']) {
    assert.ok(gallery.includes(control), control);
  }
  for (const duplicate of ['demo-iu-specimen-header', 'demo-iu-panel-inputs', 'demo-iu-panel-buttons', 'demo-iu-panel-table', 'data-utility-reference']) {
    assert.ok(!gallery.includes(duplicate), duplicate);
  }
  assert.equal((gallery.match(/id="utility-pressure"/g) ?? []).length, 1);
  assert.doesNotMatch(gallery, /data-theme=|--usk-[\w-]+:/);
  assert.match(gallery, /No equipment is connected/);
});

test('curated galleries retain distinctive progress systems from their actual templates', () => {
  const app = createShowcase();
  const cases = [
    ['clay', 'clay', 'clay-milestones'],
    ['neo-noir', 'noir', 'noir-exposure'],
    ['editorial-luxe', 'luxe', 'luxe-segmented-progress'],
    ['art-deco', 'deco', 'deco-meter'],
    ['retro-glass', 'rg', 'rg-stepper'],
    ['technical-blueprint', 'blueprint', 'blueprint-stepper']
  ];
  for (const [ui, prefix, feature] of cases) {
    const gallery = app.renderStyleSpecificGallery(ui, prefix);
    assert.ok(gallery.includes(feature), `${ui}: ${feature}`);
    assert.ok(app.renderActiveTemplateSpecimen(ui, prefix).includes(feature), `${ui}: shared source`);
    assert.doesNotMatch(gallery, /data-theme=|--usk-[\w-]+:/);
  }
});

test('gallery ranges keep value flags and track positions synchronized', () => {
  const app = createShowcase();
  for (const [className, value, min, max, property, display] of [
    ['noir-range', '2', '-5', '5', '--noir-value', '+2.0'],
    ['clay-range-input', '25', '0', '100', '--clay-value', '25'],
    ['rg-range', '81', '0', '100', '--rg-value', '81'],
    ['blueprint-range', '40', '0', '100', '--blueprint-value', '40']
  ]) {
    const paint = new Map();
    const output = {};
    const style = { setProperty: (name, next) => paint.set(name, next) };
    const range = {
      value, min, max, style,
      matches: (selector) => selector === `.${className}`,
      parentElement: { style, querySelector: () => output }
    };
    app.updateStyleFeatureRange(range);
    assert.equal(output.value, display);
    assert.equal(paint.get(property), `${(Number(value) - Number(min)) / (Number(max) - Number(min)) * 100}%`);
    if (className === 'noir-range') assert.equal(paint.get('--noir-position'), '0.7');
  }
});

test('Industrial gallery binds without removed board controls and preserves local alarm interactions', () => {
  const app = createShowcase();
  /** @returns {object} Minimal event-capable element boundary for the actual controller. */
  function control() {
    const listeners = new Map();
    const attributes = new Map();
    return {
      dataset: {}, textContent: '', classList: { toggle() {} },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: (name) => attributes.get(name),
      addEventListener(name, handler) { listeners.set(name, [...(listeners.get(name) || []), handler]); },
      fire(name) { for (const handler of listeners.get(name) || []) handler({ currentTarget: this, target: this }); },
      focus() { this.focused = true; }
    };
  }
  const feedback = control();
  const pressure = control();
  const readout = control();
  const key = control();
  key.dataset.position = 'auto';
  key.nextElementSibling = control();
  const stop = control();
  const ack = control();
  const silence = control();
  const confirm = control();
  const cancel = control();
  const badge = control();
  const dialog = control();
  dialog.querySelector = (selector) => selector.includes('cancel') ? cancel : confirm;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.fire('close'); };
  const nodes = new Map([
    ['[data-utility-feedback]', feedback], ['#utility-pressure', pressure],
    ['#utility-pressure-value', readout], ['[data-utility-key]', key],
    ['#utility-estop', stop], ['dialog', dialog], ['[data-utility-silence]', silence],
    ['[data-utility-critical]', { querySelector: () => badge }]
  ]);
  app.document.getElementById = () => ({
    querySelector: (selector) => nodes.get(selector) || null,
    querySelectorAll: (selector) => selector === '[data-utility-ack-open]' ? [ack] : []
  });
  assert.doesNotThrow(() => app.bindIndustrialSpecimen());
  pressure.value = '81.2';
  pressure.fire('input');
  assert.equal(readout.value, '81.2');
  key.fire('click');
  assert.equal(key.getAttribute('aria-label'), 'Key switch: On');
  stop.fire('click');
  assert.equal(stop.getAttribute('aria-pressed'), 'true');
  assert.equal(stop.textContent, 'RESET');
  assert.match(feedback.textContent, /No equipment is connected/);
  stop.fire('click');
  assert.equal(stop.getAttribute('aria-pressed'), 'false');
  silence.fire('click');
  assert.equal(silence.getAttribute('aria-pressed'), 'true');
  assert.match(feedback.textContent, /alarms remain visible/);
  ack.fire('click');
  assert.equal(dialog.open, true);
  confirm.fire('click');
  assert.equal(dialog.open, false);
  assert.equal(badge.textContent, 'Acknowledged');
  assert.match(feedback.textContent, /Critical pressure remains active/);
  assert.equal(ack.focused, true);
});

test('feature deep links keep Components selected in the shared navigation', () => {
  const app = createShowcase();
  const links = ['overview', 'tokens', 'components', 'native', 'bridge', 'usage'].map((section) => {
    const attributes = new Map([['href', `#${section}`]]);
    return {
      classList: { toggle() {} },
      getAttribute: (name) => attributes.get(name),
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: (name) => attributes.delete(name)
    };
  });
  app.main = { querySelector: () => ({ querySelectorAll: () => links }) };
  app.syncPrimaryNavCurrent('style-specific');
  assert.equal(links[2].getAttribute('aria-current'), 'page');
  assert.equal(links.filter((link) => link.getAttribute('aria-current')).length, 1);
});
