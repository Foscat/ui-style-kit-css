import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const variants = ['neutral', 'primary', 'secondary', 'warning', 'danger', 'ghost'];

test.use({ video: 'off' });
test.skip(({ browserName }) => browserName !== 'chromium', 'This pseudo-state matrix uses Chromium DevTools.');

/**
 * Builds matching prefixed, semantic, mixed-class, and anchor action probes.
 * @param {string} prefix Public component prefix selected by the manifest.
 * @returns {string} Accessible action markup with stable diagnostic identifiers.
 */
function actions(prefix) {
  return variants.flatMap((variant) => ['button', 'a'].flatMap((tag) => {
    const suffix = variant === 'neutral' ? '' : ` ${prefix}-button-${variant}`;
    return [
      `<${tag} data-probe="${tag}/prefixed/${variant}" class="${prefix}-button${suffix}" href="#fixture">Action</${tag}>`,
      ...['usk', 'ui'].flatMap((namespace) => [
        `<${tag} data-probe="${tag}/${namespace}/${variant}" class="${namespace}-button"${variant === 'neutral' ? '' : ` data-ui-variant="${variant}"`} href="#fixture">Action</${tag}>`,
        `<${tag} data-probe="${tag}/${namespace}-mixed/${variant}" data-peer="${tag}/${namespace}/${variant}" class="${namespace}-button ${prefix}-button"${variant === 'neutral' ? '' : ` data-ui-variant="${variant}"`} href="#fixture">Action</${tag}>`
      ])
    ];
  })).join('');
}

/**
 * Covers the sibling native, navigation, and table labels affected by shared hover rules.
 * @param {string} prefix Active preset's public class prefix.
 * @returns {string} Fixtures for ordinary and current navigation plus native controls.
 */
function siblingLabels(prefix) {
  return `
    ${['button', 'a'].flatMap((tag) => ['cut', 'outline-heavy', 'pill'].map((role) => `
      <${tag} data-probe="${tag}/marketing/${role}" class="${prefix}-button ${prefix}-button-${role}" href="#fixture">Action</${tag}>
    `)).join('')}
    <button data-probe="prefixed/icon" class="${prefix}-icon-button" aria-label="More actions">?</button>
    <button data-probe="native/button">Native action</button>
    <input data-probe="native/input" type="text" value="Field value">
    <select data-probe="native/select"><option>Selected option</option></select>
    <textarea data-probe="native/textarea">Field notes</textarea>
    <details open><summary data-probe="native/summary">Disclosure</summary><p>Details</p></details>
    ${[prefix, 'usk', 'ui'].flatMap((namespace) => [false, true].map((current) => `
      <nav class="${namespace}-nav"><a data-probe="${namespace}/nav/${current ? 'current' : 'ordinary'}" class="${namespace}-nav-link" href="#fixture"${current ? ' aria-current="page"' : ''}>Navigation</a></nav>
    `)).join('')}
    <table class="${prefix}-table"><tbody><tr data-hover-parent><td data-probe="prefixed/table">Table value</td></tr></tbody></table>
    <table><tbody><tr data-hover-parent><td data-probe="native/table">Table value</td></tr></tbody></table>
  `;
}

/**
 * Measures the central label lane, excluding edge-only gloss and grain decorations.
 * @param {{themes: string[], modes: string[]}} options Published palette inventory.
 * @returns {object[]} Contrast and mixed-class paint-equivalence failures.
 */
function measurePaletteContrast({ themes, modes }) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const parse = (value) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].map((channel, index) => index === 3 ? channel / 255 : channel);
  };
  const over = (top, bottom) => top.slice(0, 3).map((channel, index) => channel * top[3] + bottom[index] * (1 - top[3]));
  const gradientPaints = (image, backgroundSize) => {
    const layers = image.match(/(?:linear|radial)-gradient\((?:[^()]|\([^()]*\))*\)/g) ?? [];
    const sizes = backgroundSize.split(',');
    return layers.map((layer, index) => ({ layer, size: sizes[index] ?? 'auto' })).reverse().flatMap(({ layer, size }) => {
      // Dropdown arrows are small positioned images beside the label, not its background.
      if (!/auto|100%/.test(size)) return [];
      if (/\d(?:px|rem)\b/.test(layer)) return [];
      const stops = [...layer.matchAll(/(rgba?\([^)]*\)|color\([^)]*\)|transparent)(?:\s+([\d.]+)%)?/g)]
        .map((match) => ({ color: parse(match[1]), position: match[2] == null ? null : Number(match[2]) / 100 }));
      if (stops.length < 2) return [];
      stops[0].position ??= 0;
      stops.at(-1).position ??= 1;
      for (let index = 1; index < stops.length - 1; index++) {
        if (stops[index].position != null) continue;
        let end = index + 1;
        while (stops[end].position == null) end++;
        const start = stops[index - 1].position;
        const step = (stops[end].position - start) / (end - index + 1);
        for (let current = index; current < end; current++) stops[current].position = start + step * (current - index + 1);
      }
      return [[0.35, 0.5, 0.65].map((position) => {
        const end = stops.findIndex((stop) => stop.position >= position);
        if (end < 0) return stops.at(-1).color;
        if (end === 0) return stops[0].color;
        const start = stops[end - 1];
        const finish = stops[end];
        const fraction = (position - start.position) / (finish.position - start.position || 1);
        const alpha = start.color[3] + (finish.color[3] - start.color[3]) * fraction;
        return [...start.color.slice(0, 3).map((channel, index) => alpha === 0 ? 0 :
          (channel * start.color[3] * (1 - fraction) + finish.color[index] * finish.color[3] * fraction) / alpha), alpha];
      })];
    });
  };
  const luminance = (rgb) => rgb.reduce((total, channel, index) => {
    const value = channel / 255;
    return total + [0.2126, 0.7152, 0.0722][index] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  }, 0);
  const failures = [];
  for (const theme of ['', ...themes]) {
    if (theme) document.body.dataset.theme = theme;
    else document.body.removeAttribute('data-theme');
    for (const mode of modes) {
      document.body.dataset.mode = mode;
      for (const element of document.querySelectorAll('[data-probe]')) {
        const ancestors = [];
        for (let node = element; node; node = node.parentElement) ancestors.unshift(node);
        let backgrounds = [[255, 255, 255]];
        for (const node of ancestors) {
          const style = getComputedStyle(node);
          backgrounds = backgrounds.map((paint) => over(parse(style.backgroundColor), paint));
          for (const samples of gradientPaints(style.backgroundImage, style.backgroundSize)) {
            backgrounds = backgrounds.flatMap((paint) => samples.map((sample) => over(sample, paint)));
          }
          const before = getComputedStyle(node, '::before');
          if (before.content !== 'none' && before.position === 'absolute' && Number.parseFloat(before.top) === 0 && Number.parseFloat(before.bottom) === 0 && Number(before.zIndex) < 0) {
            backgrounds = backgrounds.map((paint) => over(parse(before.backgroundColor), paint));
            for (const samples of gradientPaints(before.backgroundImage, before.backgroundSize)) {
              backgrounds = backgrounds.flatMap((paint) => samples.map((sample) => over(sample, paint)));
            }
          }
        }
        const style = getComputedStyle(element);
        if (element.dataset.peer) {
          const peer = document.querySelector(`[data-probe="${element.dataset.peer}"]`);
          const peerStyle = getComputedStyle(peer);
          const differences = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor']
            .filter((property) => style[property] !== peerStyle[property])
            .map((property) => ({ property, actual: style[property], expected: peerStyle[property] }));
          if (differences.length) failures.push({ kind: 'mixed-class-paint', theme: theme || 'reference', mode, probe: element.dataset.probe, differences });
        }
        const foreground = parse(style.color);
        const ratio = Math.min(...backgrounds.map((background) => {
          const a = luminance(over(foreground, background));
          const b = luminance(background);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }));
        if (ratio < 4.5) failures.push({ theme: theme || 'reference', mode, probe: element.dataset.probe, ratio, color: style.color, background: style.background, opacity: style.opacity });
      }
    }
  }
  return failures;
}

for (const { id, prefix } of manifest.presets) {
  /** Matches the filled marketing combinations used by the rendered demo. */
  const filledMarketing = ['button', 'a'].flatMap((tag) => ['cut', 'pill'].map((role) =>
    `<${tag} data-probe="${tag}/primary-${role}" class="${prefix}-button ${prefix}-button-primary ${prefix}-button-${role}" href="#fixture">Action</${tag}>`
  )).join('');
  for (const { label, markup } of [
    { label: 'interactive labels', markup: `${actions(prefix)}${siblingLabels(prefix)}` },
    { label: 'filled marketing actions', markup: filledMarketing }
  ]) {
    test(`${id} ${label} retain contrast through hover across every palette and mode`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      await page.setContent(`<!doctype html><html><body data-ui="${id}" data-mode="light">${markup}</body></html>`);
      await page.addStyleTag({ path: path.resolve('dist/ui-style-kit.visual.css') });
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
      const session = await page.context().newCDPSession(page);
      await session.send('DOM.enable');
      await session.send('CSS.enable');
      const { root } = await session.send('DOM.getDocument');
      const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-probe], [data-hover-parent]' });
      const failures = [];
      for (const state of ['rest', 'hover', 'active', 'focus-visible', 'pressed-hover']) {
        await page.evaluate((pressed) => {
          for (const button of document.querySelectorAll('button[data-probe]')) {
            if (pressed) button.setAttribute('aria-pressed', 'true');
            else button.removeAttribute('aria-pressed');
          }
        }, state === 'pressed-hover');
        for (const nodeId of nodeIds) {
          const forcedPseudoClasses = state === 'rest' ? [] : state === 'active' ? ['hover', 'active'] :
            state === 'focus-visible' ? ['focus', 'focus-visible'] : ['hover'];
          await session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses });
        }
        failures.push(...(await page.evaluate(measurePaletteContrast, { themes: manifest.themes, modes: manifest.modes })).map((failure) => ({ state, ...failure })));
      }
      await testInfo.attach('contrast-readings', { body: JSON.stringify(failures, null, 2), contentType: 'application/json' });
      fs.writeFileSync(testInfo.outputPath('contrast-readings.json'), JSON.stringify(failures, null, 2));
      expect(failures.length, JSON.stringify(failures.slice(0, 15), null, 2)).toBe(0);
    });
  }
}
