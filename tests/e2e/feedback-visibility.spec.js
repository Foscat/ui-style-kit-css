import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));
const css = fs.readFileSync(new URL('../../dist/ui-style-kit.css', import.meta.url), 'utf8');
const assetsUrl = new URL('../../dist/', import.meta.url).href;

/**
 * Samples the browser-painted tile behind each glyph, including pseudo plates,
 * chrome, conic gradients and translucent ancestor surfaces.
 * @param {import('@playwright/test').Page} page Isolated browser fixture.
 * @param {object[]} presets Selected preset records.
 * @param {(string|null)[]} themes Palette choices.
 * @param {string[]} modes Presentation modes.
 * @returns {Promise<{states: number, failures: object[]}>} Pixel-backed results.
 */
async function inspectIconPixels(page, presets, themes, modes) {
  const failures = [];
  let states = 0;
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const { id, prefix } of presets) {
    const specimens = themes.flatMap(theme => modes.map(mode => ({ theme, mode })));
    await page.setContent(`<base href="${assetsUrl}"><style>${css}\n.catalog { display:grid;grid-template-columns:repeat(6,200px);gap:16px; } .sample {width:200px;min-height:180px;padding:12px;background:var(--usk-native-bg);color:var(--usk-native-text);} .sample article {margin:0;} .sample .fixture-media {height:70px;background:var(--usk-native-surface);} </style><div class="catalog">${specimens.map(({ theme, mode }, index) => `<div class="sample" data-ui="${id}" data-mode="${mode}" ${theme ? `data-theme="${theme}"` : ''}><article class="${prefix}-card-service"><div class="${prefix}-card-media fixture-media"></div><span class="${prefix}-icon-medallion" data-icon-specimen="${index}">★</span><h3>Service</h3><p>Available service.</p></article></div>`).join('')}</div>`);
    await page.evaluate(() => document.fonts.ready);
    const facts = await page.locator('[data-icon-specimen]').evaluateAll(nodes => {
      const canvas = document.createElement('canvas').getContext('2d');
      return nodes.map(node => {
        const s = getComputedStyle(node), r = node.getBoundingClientRect();
        canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = s.color; canvas.fillRect(0, 0, 1, 1);
        return { ink: [...canvas.getImageData(0, 0, 1, 1).data], x: r.left + r.width / 2, y: r.top + r.height / 2, radius: parseFloat(s.fontSize) * .2 };
      });
    });
    // Clear only fixture glyphs: engines need not implement a text-fill mask alike.
    const cleared = await page.locator('[data-icon-specimen]').evaluateAll(nodes => nodes.map(node => {
      node.textContent = '';
      const r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }));
    for (let i = 0; i < facts.length; i += 1) {
      expect(Math.abs(cleared[i].x - facts[i].x)).toBeLessThan(.5);
      expect(Math.abs(cleared[i].y - facts[i].y)).toBeLessThan(.5);
    }
    const png = PNG.sync.read(await page.screenshot({ fullPage: true, scale: 'css' }));
    expect(png.width, 'pixel samples and DOM coordinates share CSS-pixel units').toBe(page.viewportSize().width);
    for (const [index, fact] of facts.entries()) {
      const paints = [-1, 0, 1].map(offset => {
        const x = Math.max(0, Math.min(png.width - 1, Math.round(fact.x))), y = Math.max(0, Math.min(png.height - 1, Math.round(fact.y + offset * fact.radius)));
        const start = (png.width * y + x) * 4;
        return [...png.data.subarray(start, start + 3)];
      });
      const luminance = rgb => rgb.reduce((sum, v, i) => { const c = v / 255; return sum + [.2126, .7152, .0722][i] * (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); }, 0);
      const ratios = paints.map(bg => {
        const alpha = fact.ink[3] / 255, fg = fact.ink.slice(0, 3).map((v, i) => v * alpha + bg[i] * (1 - alpha));
        const a = luminance(fg), b = luminance(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      });
      if (ratios.some(r => r < 3)) failures.push({ preset: id, ...specimens[index], contract: 'visible icon on its painted tile', ink: fact.ink, background: paints, ratios });
      states += 1;
    }
  }
  return { states, failures };
}

/**
 * Measures feedback paint through the browser's color engine and actual cascade.
 * Busy contrast samples cover the central glyph lane, not a control's bevel edge.
 * @param {object} options Fixture kind, selected presets, themes and modes.
 * @returns {{states: number, failures: object[]}} Rendered acceptance results.
 */
function inspectFeedback({ kind, presets, themes, modes }) {
  const root = document.querySelector('main');
  const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const failures = [];
  let states = 0;
  /** @param {string} paint Computed CSS color. @returns {number[]} RGBA channels. */
  function rgba(paint) {
    canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = paint; canvas.fillRect(0, 0, 1, 1);
    const c = [...canvas.getImageData(0, 0, 1, 1).data]; c[3] /= 255; return c;
  }
  /** @param {number[]} a Front RGBA. @param {number[]} b Back RGBA. @returns {number[]} Opaque RGB. */
  function over(a, b) { return [...a.slice(0, 3).map((v, i) => v * a[3] + b[i] * (1 - a[3])), 1]; }
  /** @param {number[]} c RGB channels. @returns {number} Relative luminance. */
  function luminance(c) { return c.slice(0, 3).reduce((sum, v, i) => { const n = v / 255; return sum + [.2126, .7152, .0722][i] * (n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4); }, 0); }
  /** @param {number[]} a Foreground RGB. @param {number[]} b Background RGB. @returns {number} Contrast ratio. */
  function ratio(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  /** @param {Element} el Painted element. @param {number} at Gradient location. @returns {number[]} Effective RGB. */
  function background(el, at = .5) {
    if (!el) return [255, 255, 255, 1];
    const s = getComputedStyle(el), c = rgba(s.backgroundColor);
    let paint = c[3] === 1 ? c : over(c, background(el.parentElement, at));
    // Negative stacking plates paint behind a glyph even when its own box is clear.
    for (const pseudo of ['::before', '::after']) {
      const plate = getComputedStyle(el, pseudo);
      if (plate.content !== 'none' && plate.position === 'absolute' && Number(plate.zIndex) < 0) paint = over(rgba(plate.backgroundColor), paint);
    }
    if (s.backgroundImage.startsWith('linear-gradient(')) {
      let depth = 0, end = 0;
      for (; end < s.backgroundImage.length; end += 1) {
        if (s.backgroundImage[end] === '(') depth += 1;
        if (s.backgroundImage[end] === ')' && --depth === 0) break;
      }
      const layer = s.backgroundImage.slice(0, end + 1);
      const stops = [...layer.matchAll(/((?:rgba?|color)\([^)]*\))\s*(?:(\d+(?:\.\d+)?)%)?/g)]
        .map(m => ({ color: rgba(m[1]), at: m[2] === undefined ? null : Number(m[2]) / 100 }));
      if (stops.length > 1) {
        stops[0].at ??= 0; stops.at(-1).at ??= 1;
        for (let i = 1; i < stops.length - 1; i += 1) {
          if (stops[i].at !== null) continue;
          let end = i + 1; while (stops[end].at === null) end += 1;
          for (let j = i; j < end; j += 1) stops[j].at = stops[i - 1].at + (stops[end].at - stops[i - 1].at) * (j - i + 1) / (end - i + 1);
          i = end - 1;
        }
        const index = stops.findIndex(stop => stop.at >= at);
        const b = stops[index < 0 ? stops.length - 1 : index];
        const a = index < 0 ? b : stops[Math.max(0, index - 1)];
        const fraction = b.at === a.at ? 0 : (at - a.at) / (b.at - a.at);
        paint = over(a.color.map((v, i) => v + (b.color[i] - v) * fraction), paint);
      }
    }
    return paint;
  }
  for (const { id, prefix } of presets) {
    root.dataset.ui = id;
    if (kind === 'messages') root.innerHTML = ['usk', 'ui', prefix].map(p => ['success', 'warning', 'danger'].map(tone =>
      `<div class="${p}-alert ${p === prefix ? `${p}-alert-${tone}` : ''}" ${p === prefix ? '' : `data-ui-variant="${tone}"`} data-tone="${tone}"><p class="${p}-alert-title">${tone}</p><p class="${p}-alert-body">The requested operation has completed.</p></div>`).join('')).join('');
    else if (kind === 'icons') root.innerHTML = `<article class="${prefix}-card-service"><span class="${prefix}-icon-medallion" data-icon-specimen>★</span></article>`;
    else root.innerHTML = `<button aria-busy="true">Native busy</button>${['', 'primary', 'secondary', 'ghost'].map(v => `<button aria-busy="true" class="${prefix}-button ${v ? `${prefix}-button-${v}` : ''}">${v || 'neutral'}</button>`).join('')}<button class="usk-button" data-ui-variant="primary" aria-busy="true">Semantic busy</button>`;
    for (const theme of themes) {
      if (theme) root.dataset.theme = theme; else root.removeAttribute('data-theme');
      for (const mode of modes) {
        root.dataset.mode = mode;
        const check = (ok, contract, details) => { if (!ok) failures.push({ preset: id, theme, mode, contract, ...details }); };
        const specimens = kind === 'icons' ? root.querySelectorAll('[data-icon-specimen]') : [...root.children];
        for (const el of specimens) {
          const s = getComputedStyle(el), bg = background(el);
          if (kind === 'messages') {
            const title = el.firstElementChild, titleInk = rgba(getComputedStyle(title).color), body = el.lastElementChild;
            const surface = background(root), toneProbe = document.createElement('span'); root.append(toneProbe);
            toneProbe.style.color = `var(--usk-native-${el.dataset.tone})`;
            const signal = rgba(getComputedStyle(toneProbe).color); toneProbe.remove();
            const frame = rgba(s.borderInlineStartColor);
            check(bg.slice(0, 3).some((v, i) => Math.abs(v - surface[i]) > 6), 'status-tinted message face', { tone: el.dataset.tone, background: bg });
            check(frame.slice(0, 3).every((v, i) => Math.abs(v - signal[i]) < 2), 'status-colored leading edge', { tone: el.dataset.tone, frame, signal });
            check(ratio(over(titleInk, background(title)), background(title)) >= 4.5, 'readable message title', { tone: el.dataset.tone, ink: titleInk, background: bg });
            check(getComputedStyle(title).color === getComputedStyle(body).color, 'title uses readable message ink', { tone: el.dataset.tone, title: getComputedStyle(title).color, body: getComputedStyle(body).color });
            check(getComputedStyle(title).textShadow === 'none', 'title remains crisp without a shadow', { tone: el.dataset.tone });
            check(ratio(over(rgba(getComputedStyle(body).color), background(body)), background(body)) >= 4.5, 'readable message body', { tone: el.dataset.tone });
          } else if (kind === 'icons') {
            check([.35, .5, .65].every(at => ratio(over(rgba(s.color), background(el, at)), background(el, at)) >= 3), 'visible icon on its own tile', { ink: s.color, image: s.backgroundImage, background: [.35, .5, .65].map(at => background(el, at)), parentPaint: getComputedStyle(el.parentElement).backgroundColor });
          } else {
            const glyph = getComputedStyle(el, '::after'), borders = ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].map(k => rgba(glyph[k]));
            const paintedBorders = ['Top', 'Right', 'Bottom', 'Left'].flatMap((side, index) => parseFloat(glyph[`border${side}Width`]) > 0 && glyph[`border${side}Style`] !== 'none' ? [borders[index]] : []);
            const imagePaints = [...glyph.backgroundImage.matchAll(/(?:rgba?|color)\([^)]*\)/g)].map(m => rgba(m[0]));
            const visible = [...paintedBorders, rgba(glyph.backgroundColor), ...imagePaints].filter(c => c[3] > .5);
            check(glyph.content !== 'none' && parseFloat(glyph.width) >= 10 && parseFloat(glyph.height) >= 10, 'sized busy glyph', { control: el.textContent, width: glyph.width });
            check(visible.some(c => [.35, .5, .65].every(at => ratio(over(c, background(el, at)), background(el, at)) >= 3)), 'busy paint contrasts with control face', { control: el.textContent, borders, image: s.backgroundImage, glyphImage: glyph.backgroundImage, glyphInk: glyph.color, foreground: s.color });
            if (id === 'tactile') check(new Set(borders.map(c => c.join(','))).size > 1, 'distinct rotating busy arc', { control: el.textContent, borders });
          }
        }
        states += 1;
      }
    }
  }
  return { states, failures };
}

/**
 * Runs a bounded component matrix and retains every failing state for diagnosis.
 * @param {import('@playwright/test').Page} page Isolated fixture.
 * @param {string} kind Feedback contract to inspect.
 * @param {boolean} tactileOnly Whether the contract is preset-specific.
 * @returns {Promise<void>} Resolves when every selected state satisfies its contract.
 */
async function verify(page, kind, tactileOnly = false) {
  const selected = process.env.USK_FEEDBACK_PRESETS?.split(',');
  const presets = manifest.presets.filter(p => (!tactileOnly || p.id === 'tactile') && (!selected || selected.includes(p.id)));
  expect(presets.length).toBeGreaterThan(0);
  const themes = process.env.USK_FEEDBACK_THEMES?.split(',').map(x => x === 'none' ? null : x) ?? [null, ...manifest.themes];
  const modes = process.env.USK_FEEDBACK_MODES?.split(',') ?? manifest.modes;
  await page.goto(new URL('../../index.html', import.meta.url).href);
  await page.setContent(`<base href="${assetsUrl}"><style>${css}\nmain { width: 360px; background: var(--usk-native-bg); color: var(--usk-native-text); } * { transition: none !important; }</style><main></main>`);
  const result = kind === 'icons' ? await inspectIconPixels(page, presets, themes, modes) : await page.evaluate(inspectFeedback, { kind, presets, themes, modes });
  await test.info().attach('feedback-results', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  expect(result.states).toBe(presets.length * themes.length * modes.length);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 8), null, 2)).toBe(0);
}

test('status messages preserve signal tints and readable neutral titles', async ({ page }) => {
  test.setTimeout(180000);
  await verify(page, 'messages');
});
test('icon tiles keep contrasting ink across presentation combinations', async ({ page }) => {
  test.setTimeout(180000);
  await verify(page, 'icons');
});
test('busy indicators remain visible across presentation combinations', async ({ page }) => {
  test.setTimeout(180000);
  await verify(page, 'busy');
});
