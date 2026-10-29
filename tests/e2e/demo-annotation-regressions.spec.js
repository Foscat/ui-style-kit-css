import fs from 'node:fs';

import { expect, test } from '@playwright/test';

const css = fs.readFileSync(new URL('../../dist/ui-style-kit.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));

/**
 * Loads public semantic and prefixed specimens with the actual distributed CSS.
 * @param {import('@playwright/test').Page} page Isolated browser fixture.
 * @returns {Promise<void>} Resolves after the specimen is rendered.
 */
async function loadSpecimens(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(`<style>${css}\nhtml { font-size: 16px; } main { inline-size: 300px; padding: 12px; background: var(--usk-native-bg); color: var(--usk-native-text); } * { transition: none !important; }</style><main data-ui="minimal-saas" data-mode="light"></main>`);
}

test('shared demo geometry keeps stars, text and progress inside their frames', async ({ page }) => {
  await loadSpecimens(page);
  const result = await page.evaluate(presets => {
    const root = document.querySelector('main');
    const failures = [];
    let states = 0;
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      for (const mode of ['light', 'dark', 'contrast']) {
        root.dataset.mode = mode;
        root.innerHTML = ['usk', prefix].map(p => `<section class="${p}-card">
          <span class="${p}-empty-state-icon">☆</span>
          <div class="${p}-progress"><div class="${p}-progress-bar" style="width:68%"></div></div>
          <span class="${p}-chip">Promoted</span>
          <div class="${p}-popover">Popover surface</div><div class="${p}-menu"><button class="${p}-menu-item">Action</button></div><div class="${p}-listbox"><div class="${p}-listbox-option">Option</div></div>
          <div class="${p}-tabs"><div class="${p}-tab-list"><button class="${p}-tab" aria-selected="true">Overview</button></div><section class="${p}-tab-panel">Tab content</section></div>
          <aside class="${p}-toast"><strong class="${p}-toast-title">Runtime verification complete</strong><p class="${p}-toast-body">Preset switching keeps semantic markup stable.</p></aside>
        </section>`).join('');
        for (const p of ['usk', prefix]) {
          const element = suffix => root.querySelector(`.${p}-${suffix}`);
          const check = (condition, contract, actual) => { if (!condition) failures.push({ preset: id, mode, namespace: p, contract, actual }); };
          check(parseFloat(getComputedStyle(element('empty-state-icon')).fontSize) >= 40, 'prominent empty-state icon', getComputedStyle(element('empty-state-icon')).fontSize);
          const track = element('progress').getBoundingClientRect(), bar = element('progress-bar').getBoundingClientRect();
          check(Math.abs(track.top + track.height / 2 - bar.top - bar.height / 2) <= 1, 'progress center', { track: track.toJSON(), bar: bar.toJSON() });
          check(bar.left >= track.left && bar.right <= track.right + 1 && bar.bottom <= track.bottom + 1, 'progress containment', { track: track.toJSON(), bar: bar.toJSON() });
          const chip = getComputedStyle(element('chip'));
          check(parseFloat(chip.paddingInlineStart) >= 8 && parseFloat(chip.paddingInlineEnd) >= 8, 'status text inset', chip.padding);
          for (const suffix of ['popover', 'menu', 'menu-item', 'listbox', 'listbox-option']) {
            const style = getComputedStyle(element(suffix));
            check(parseFloat(style.paddingInlineStart) >= 8 && parseFloat(style.paddingInlineEnd) >= 8, 'overlay text inset', { suffix, padding: style.padding });
          }
          const tab = element('tab'), tabBox = tab.getBoundingClientRect(), text = document.createRange();
          text.selectNodeContents(tab);
          check(text.getBoundingClientRect().width + parseFloat(getComputedStyle(tab).paddingInlineStart) + parseFloat(getComputedStyle(tab).paddingInlineEnd) <= tabBox.width + 1, 'tab label fits its inset frame', { width: tabBox.width, text: text.getBoundingClientRect().width });
          check(element('tab-list').getBoundingClientRect().bottom <= element('tab-panel').getBoundingClientRect().top + 1, 'tab header precedes panel content', { list: element('tab-list').getBoundingClientRect().toJSON(), panel: element('tab-panel').getBoundingClientRect().toJSON() });
          const toast = element('toast').getBoundingClientRect(), title = element('toast-title').getBoundingClientRect(), body = element('toast-body').getBoundingClientRect();
          check(title.bottom <= body.top + 1 && title.width >= toast.width * .75, 'title above toast content', { toast: toast.toJSON(), title: title.toJSON(), body: body.toJSON() });
          check(getComputedStyle(element('toast-title')).overflowWrap === 'normal' && getComputedStyle(element('toast-title')).wordBreak === 'normal', 'word-boundary title wrapping', getComputedStyle(element('toast-title')).overflowWrap);
          check(title.right <= toast.right && body.right <= toast.right && element('toast').scrollWidth <= element('toast').clientWidth + 1, 'toast containment', { scroll: element('toast').scrollWidth, client: element('toast').clientWidth });
        }
        states += 1;
      }
    }
    return { states, failures };
  }, manifest.presets);
  expect(result.states).toBe(manifest.presets.length * 3);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 8), null, 2)).toBe(0);
});

test('annotated selectable controls keep readable foreground and background pairs', async ({ page }) => {
  test.setTimeout(180000);
  await loadSpecimens(page);
  const result = await page.evaluate(({ presets, themes }) => {
    const root = document.querySelector('main');
    const failures = [];
    let states = 0;
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    /** Converts any browser-supported computed color to RGBA channels.
     * @param {string} color Computed CSS color.
     * @returns {number[]} RGB channels and normalized alpha.
     */
    function channels(color) {
      context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      const value = [...context.getImageData(0, 0, 1, 1).data]; value[3] /= 255; return value;
    }
    /** Composites a translucent foreground over an opaque background.
     * @param {number[]} front Foreground RGBA.
     * @param {number[]} back Background RGBA.
     * @returns {number[]} Opaque RGBA channels.
     */
    function over(front, back) { return [...front.slice(0, 3).map((value, i) => value * front[3] + back[i] * (1 - front[3])), 1]; }
    /** Resolves the effective solid backdrop through transparent ancestors.
     * @param {Element} element Measured element.
     * @returns {number[]} Opaque backdrop.
     */
    function backdrop(element) {
      if (!element) return [255, 255, 255, 1];
      const style = getComputedStyle(element), color = channels(style.backgroundColor);
      let background = color[3] === 1 ? color : over(color, backdrop(element.parentElement));
      // A glass face paints a gradient over its solid base; its label sits at the center.
      if (style.backgroundImage.startsWith('linear-gradient(')) {
        const stops = [...style.backgroundImage.matchAll(/((?:rgba?|color)\([^)]*\))\s*(?:(\d+(?:\.\d+)?)%)?/g)]
          .map(match => ({ color: channels(match[1]), position: match[2] === undefined ? null : Number(match[2]) / 100 }));
        if (stops.length > 1) {
          stops[0].position ??= 0; stops[stops.length - 1].position ??= 1;
          for (let i = 1; i < stops.length - 1; i += 1) {
            if (stops[i].position !== null) continue;
            let end = i + 1; while (stops[end].position === null) end += 1;
            const start = i - 1;
            for (let j = i; j < end; j += 1) stops[j].position = stops[start].position + (stops[end].position - stops[start].position) * (j - start) / (end - start);
            i = end - 1;
          }
          const right = stops.findIndex(stop => stop.position >= .5);
          const a = stops[Math.max(0, right - 1)], b = stops[Math.max(0, right)];
          const fraction = b.position === a.position ? 0 : (.5 - a.position) / (b.position - a.position);
          background = over(a.color.map((value, i) => value + (b.color[i] - value) * fraction), background);
        }
      }
      return background;
    }
    /** Calculates relative luminance for WCAG contrast.
     * @param {number[]} rgb Opaque RGB channels.
     * @returns {number} Relative luminance.
     */
    function luminance(rgb) { return rgb.slice(0, 3).reduce((sum, value, i) => { const c = value / 255; return sum + [0.2126, 0.7152, 0.0722][i] * (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); }, 0); }
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      root.innerHTML = `<section class="${prefix}-card">${['usk', prefix].map(p => `<div class="${p}-tabs"><div class="${p}-tab-list" role="tablist"><button class="${p}-tab" aria-selected="true">Overview</button></div><section class="${p}-tab-panel">Tab content</section></div><button class="${p}-segment" aria-pressed="true">Grid</button>
        ${['secondary', 'warning'].map(variant => `<button class="${p}-button ${p === 'usk' ? '' : `${p}-button-${variant}`}" ${p === 'usk' ? `data-ui-variant="${variant}"` : ''}>${variant}</button>`).join('')}
        ${['primary', 'secondary', 'accent'].map(variant => `<span role="tooltip" class="${p}-tooltip ${p === 'usk' ? '' : `${p}-tooltip-${variant}`}" ${p === 'usk' ? `data-ui-variant="${variant}"` : ''}>${variant}</span>`).join('')}`).join('')}</section>`;
      for (const theme of [null, ...themes]) {
        if (theme) root.dataset.theme = theme; else root.removeAttribute('data-theme');
        for (const mode of ['light', 'dark', 'contrast']) {
          root.dataset.mode = mode;
          for (const button of root.querySelectorAll('button, [role="tooltip"]')) {
            const style = getComputedStyle(button), background = backdrop(button), foreground = over(channels(style.color), background);
            const a = luminance(foreground), b = luminance(background), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
            if (ratio < 4.5) failures.push({ preset: id, theme, mode, className: button.className, color: style.color, background: style.backgroundColor, ratio });
          }
          states += 1;
        }
      }
    }
    return { states, failures };
  }, { presets: manifest.presets, themes: manifest.themes });
  expect(result.states).toBe(manifest.presets.length * (manifest.themes.length + 1) * 3);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 10), null, 2)).toBe(0);
});

test('annotated demo frames stay contained at narrow and wide viewports', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto(new URL('../../index.html', import.meta.url).href);
  await page.addStyleTag({ content: '* { transition: none !important; }' });
  const failures = [];
  const widths = process.env.USK_DEMO_WIDTH_FILTER?.split(',').map(Number) ?? [320, 390, 768, 1280, 1440];
  const requestedPresets = process.env.USK_DEMO_PRESET_FILTER?.split(',');
  const presets = requestedPresets ? manifest.presets.filter(({ id }) => requestedPresets.includes(id)) : manifest.presets;
  expect(presets.length).toBe(requestedPresets?.length ?? manifest.presets.length);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const { id } of presets) {
      await page.locator('#uiSelect').selectOption(id);
      await expect(page.locator('body')).toHaveAttribute('data-ui', id);
      const result = await page.evaluate(() => {
        const failures = [];
        for (const element of document.querySelectorAll('#semantic-runtime .usk-progress, #semantic-runtime .usk-progress-bar, #semantic-runtime .usk-toast, #semantic-runtime .usk-popover, #semantic-runtime .usk-tabs, #semantic-runtime .usk-menu, .demo-control-showcase > section')) {
          const box = element.getBoundingClientRect(), parent = element.parentElement.getBoundingClientRect();
          if (box.left < parent.left - 1 || box.right > parent.right + 1) failures.push({ className: element.className, box: box.toJSON(), parent: parent.toJSON() });
        }
        if (document.documentElement.scrollWidth > innerWidth + 1) failures.push({ contract: 'page containment', scroll: document.documentElement.scrollWidth, viewport: innerWidth });
        return failures;
      });
      failures.push(...result.map(failure => ({ preset: id, width, ...failure })));
      expect(result.length, JSON.stringify({ preset: id, width, failures: result }, null, 2)).toBe(0);
      console.info(`Contained demo: ${id} at ${width}px`);
    }
  }
  expect(failures.length, JSON.stringify(failures.slice(0, 8), null, 2)).toBe(0);
});

test('annotated form choices keep centered thumbs and distinct input states', async ({ page }) => {
  await loadSpecimens(page);
  const result = await page.evaluate(presets => {
    const root = document.querySelector('main'), failures = [];
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      root.removeAttribute('data-theme');
      for (const mode of ['light', 'dark', 'contrast']) {
        root.dataset.mode = mode;
        root.innerHTML = `<input id="checked" type="checkbox" checked><input id="unchecked" type="checkbox">
          <input id="radio" type="radio"><input id="disabled-radio" type="radio" disabled>
          <input id="range" type="range" value="50">
          ${['usk', prefix].map(p => `<label class="${p}-switch"><input type="checkbox"><span class="${p}-switch-track"><span class="${p}-switch-thumb"></span></span><span>Switch</span></label>
          <label class="${p}-check"><input type="checkbox" checked><span class="${p}-check-control"></span><span>Checked</span></label>`).join('')}`;
        const check = (condition, contract, actual) => { if (!condition) failures.push({ preset: id, mode, contract, actual }); };
        const checked = getComputedStyle(root.querySelector('#checked')), unchecked = getComputedStyle(root.querySelector('#unchecked'));
        check(checked.backgroundColor !== unchecked.backgroundColor || (checked.backgroundImage.match(/linear-gradient/g) ?? []).length >= 3, 'checked choice has a colored fill', { checked: checked.backgroundColor, unchecked: unchecked.backgroundColor, image: checked.backgroundImage });
        const disabled = getComputedStyle(root.querySelector('#disabled-radio'));
        check(disabled.borderStyle === 'dashed' && disabled.backgroundColor !== getComputedStyle(root.querySelector('#radio')).backgroundColor, 'disabled radio has a distinct muted treatment', { border: disabled.borderStyle, fill: disabled.backgroundColor });
        const range = root.querySelector('#range'), probe = document.createElement('span');
        root.append(probe); probe.style.background = 'var(--usk-native-range-thumb-background)';
        const fill = getComputedStyle(probe).backgroundColor, artwork = getComputedStyle(probe).backgroundImage;
        probe.style.background = 'var(--usk-native-primary)';
        const action = getComputedStyle(probe).backgroundColor;
        /** Reference presets may use paired colored artwork instead of a solid action fill. */
        if (id === 'editorial-luxe') {
          probe.style.background = 'var(--luxe-brass-light)';
          check(fill === getComputedStyle(probe).backgroundColor, 'editorial knob uses brass paint', { fill, brass: getComputedStyle(probe).backgroundColor });
        } else if (id === 'technical-blueprint' || id === 'data-terminal') {
          probe.style.background = id === 'technical-blueprint' ? 'var(--blueprint-surface)' : 'var(--terminal-accent)';
          const pairedColor = getComputedStyle(probe).backgroundColor;
          check(artwork.startsWith('linear-gradient(') && artwork.includes(action) && artwork.includes(pairedColor), 'range knob uses paired preset color artwork', { artwork, action, pairedColor });
        } else {
          check(fill === action, 'range knob uses the preset action color', { fill, action });
        }
        probe.remove();
        for (const p of ['usk', prefix]) {
          const control = root.querySelector(`.${p}-check-control`), marker = getComputedStyle(control, '::after');
          const drawnStroke = id === 'art-deco'
            ? parseFloat(marker.borderLeftWidth) > 0 && parseFloat(marker.borderBottomWidth) > 0 && marker.position === 'absolute'
            : parseFloat(marker.borderRightWidth) > 0 && parseFloat(marker.borderBottomWidth) > 0 && marker.position === 'static';
          check(marker.content !== '"✓"' && drawnStroke && marker.clipPath === 'none', 'choice marker uses its preset drawn stroke instead of a font glyph', { content: marker.content, border: marker.borderWidth, position: marker.position, clip: marker.clipPath });
          const input = root.querySelector(`.${p}-switch input`), track = root.querySelector(`.${p}-switch-track`), thumb = root.querySelector(`.${p}-switch-thumb`);
          for (const state of [false, true]) {
            input.checked = state;
            const a = track.getBoundingClientRect(), b = thumb.getBoundingClientRect();
            check(Math.abs(a.top + a.height / 2 - b.top - b.height / 2) <= 1 && b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom, 'switch thumb stays centered inside its track', { namespace: p, state, track: a.toJSON(), thumb: b.toJSON() });
            check(b.height >= 16, 'switch thumb remains prominent', { namespace: p, height: b.height });
          }
        }
        check(range.value === '50', 'range keeps its native value', range.value);
      }
    }
    return failures;
  }, manifest.presets);
  expect(result.length, JSON.stringify(result.slice(0, 8), null, 2)).toBe(0);
});

test('annotated tooltip and warning treatments remain distinct and respect reduced motion', async ({ page }) => {
  await loadSpecimens(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const failures = await page.evaluate(presets => {
    const root = document.querySelector('main'), failures = [];
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      for (const mode of ['light', 'dark', 'contrast']) {
        root.dataset.mode = mode;
        root.innerHTML = ['usk', prefix].map(p => `<section>${['primary', 'secondary', 'accent'].map(variant => `<span role="tooltip" class="${p}-tooltip ${p === 'usk' ? '' : `${p}-tooltip-${variant}`}" ${p === 'usk' ? `data-ui-variant="${variant}"` : ''}>${variant}</span>`).join('')}
          <button class="${p}-button ${p === 'usk' ? '' : `${p}-button-secondary`}" ${p === 'usk' ? 'data-ui-variant="secondary"' : ''}>Secondary</button>
          <button class="${p}-button ${p === 'usk' ? '' : `${p}-button-ghost`}" ${p === 'usk' ? 'data-ui-variant="ghost"' : ''}>Ghost</button>
          <button class="${p}-button ${p === 'usk' ? '' : `${p}-button-warning`}" ${p === 'usk' ? 'data-ui-variant="warning"' : ''}>Warning</button>
          <span class="${p}-badge ${p === 'usk' ? '' : `${p}-badge-warning`}" ${p === 'usk' ? 'data-ui-variant="warning"' : ''}>Warning</span></section>`).join('');
        for (const section of root.children) {
          const paints = [...section.querySelectorAll('[role=tooltip]')].map(element => { const s = getComputedStyle(element); return [s.backgroundColor, s.color, s.borderStyle].join('|'); });
          if (new Set(paints).size !== 3) failures.push({ preset: id, mode, contract: 'three differentiated tooltip treatments', paints });
          const [secondary, ghost, warning] = [...section.querySelectorAll('button')].map(element => getComputedStyle(element));
          if (secondary.backgroundColor === ghost.backgroundColor && secondary.borderColor === ghost.borderColor) failures.push({ preset: id, mode, contract: 'secondary differs from ghost' });
          for (const style of [warning, getComputedStyle(section.querySelector('span:last-child'))]) if (style.animationName === 'none') failures.push({ preset: id, mode, contract: 'warning attention pulse' });
        }
      }
    }
    return failures;
  }, manifest.presets);
  expect(failures.length, JSON.stringify(failures.slice(0, 8), null, 2)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const element of await page.locator('main button:has-text("Warning"), main span:last-child').all()) {
    expect(await element.evaluate(node => getComputedStyle(node).animationName)).toBe('none');
  }
});
