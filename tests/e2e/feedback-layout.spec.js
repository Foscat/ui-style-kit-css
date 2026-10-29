import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const css = fs.readFileSync(new URL('../../dist/ui-style-kit.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));

/**
 * Loads distributed styles into an isolated, native-aware component surface.
 * @param {import('@playwright/test').Page} page Browser fixture.
 * @returns {Promise<void>} Resolves when the fixture is ready.
 */
async function load(page) {
  await page.setContent(`<style>${css}\nmain { background:var(--usk-native-bg);color:var(--usk-native-text); } main *, main *::before, main *::after { animation-play-state:paused !important; }</style><main></main>`);
}

test('Paper Editorial message icons are legible and centered beside wrapped content', async ({ page }) => {
  await load(page);
  const result = await page.evaluate(({ themes, modes }) => {
    const root = document.querySelector('main'), failures = [];
    root.dataset.ui = 'paper-editorial';
    root.innerHTML = ['paper', 'usk', 'ui'].flatMap(p => ['success', 'warning', 'danger'].map(tone => `<div class="${p}-alert ${p === 'paper' ? `${p}-alert-${tone}` : ''}" ${p === 'paper' ? '' : `data-ui-variant="${tone}"`}><p class="${p}-alert-title">${tone}</p><p class="${p}-alert-body">A longer message wraps onto several lines while its icon stays in a dedicated lane beside the full message.</p></div>`)).join('') + '<div class="paper-alert paper-alert-warning"><strong>Reference message</strong><button aria-label="Dismiss reference">×</button><p>Review the source before publication.</p></div>';
    let states = 0;
    for (const width of [320, 768]) {
      root.style.inlineSize = `${width}px`;
      for (const theme of themes) {
        if (theme) root.dataset.theme = theme; else root.removeAttribute('data-theme');
        for (const mode of modes) {
          root.dataset.mode = mode;
          for (const el of root.children) {
            const style = getComputedStyle(el), icon = getComputedStyle(el, '::before'), r = el.getBoundingClientRect();
            const h = parseFloat(icon.height), matrix = icon.transform === 'none' ? new DOMMatrix() : new DOMMatrix(icon.transform);
            const iconCenter = r.top + parseFloat(style.borderTopWidth) + parseFloat(icon.top) + h / 2 + matrix.m42 + parseFloat(icon.marginTop);
            const details = { width, theme, mode, className: el.className, size: [icon.width, icon.height, icon.fontSize], center: iconCenter, expectedCenter: r.top + r.height / 2 };
            if (parseFloat(icon.width) < 20 || h < 20 || parseFloat(icon.fontSize) < 18) failures.push({ contract: 'legible message symbol', ...details });
            if (!Number.isFinite(iconCenter) || Math.abs(iconCenter - r.top - r.height / 2) > 1) failures.push({ contract: 'vertical icon centering', ...details });
            const text = [...el.children].filter(n => n.tagName !== 'BUTTON');
            if (text.some(n => n.getBoundingClientRect().left < r.left + 40 || n.getBoundingClientRect().right > r.right - 6)) failures.push({ contract: 'separate icon lane and contained text', ...details });
            if (el.scrollWidth > el.clientWidth + 1) failures.push({ contract: 'contained alert content', ...details });
          }
          states += 1;
        }
      }
    }
    return { states, failures };
  }, { themes: [null, ...manifest.themes], modes: manifest.modes });
  await test.info().attach('feedback-results', { body: JSON.stringify(result), contentType: 'application/json' });
  expect(result.states).toBe(156);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 5), null, 2)).toBe(0);
});

test('native loading hooks retain the selected style spinner identity', async ({ page }) => {
  test.setTimeout(180000);
  await load(page);
  const selected = process.env.USK_FEEDBACK_PRESETS?.split(',');
  const presets = manifest.presets.filter(p => !selected || selected.includes(p.id));
  const result = await page.evaluate(({ presets, themes, modes }) => {
    const root = document.querySelector('main'), failures = [];
    let states = 0;
    const properties = ['display', 'width', 'height', 'minWidth', 'borderRadius', 'borderWidth', 'borderStyle', 'borderColor', 'backgroundColor', 'backgroundImage', 'boxShadow', 'clipPath', 'maskImage', 'animationName', 'animationDuration', 'animationTimingFunction'];
    const facts = (el, pseudo) => {
      const s = getComputedStyle(el, pseudo);
      if (pseudo && (s.content === 'none' || s.content === 'normal')) return { content: 'none' };
      return Object.fromEntries([...properties, ...(pseudo ? ['content', 'position'] : [])].map(p => [p, s[p]]));
    };
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      root.innerHTML = `<span class="${prefix}-spinner"></span><span class="ui-spinner" data-loading-spinner></span><span class="loading-spinner"></span><span data-loading-spinner></span><span class="usk-spinner"></span>`;
      for (const theme of themes) {
        if (theme) root.dataset.theme = theme; else root.removeAttribute('data-theme');
        for (const mode of modes) {
          root.dataset.mode = mode;
          for (const pseudo of [null, '::before', '::after']) {
            const expected = facts(root.firstElementChild, pseudo);
            for (const el of [...root.children].slice(1)) {
              const actual = facts(el, pseudo), differences = Object.keys(expected).filter(p => expected[p] !== actual[p]);
              if (differences.length) failures.push({ preset: id, theme, mode, hook: el.className || '[data-loading-spinner]', pseudo, differences, expected, actual });
            }
          }
          states += 1;
        }
      }
    }
    return { states, failures };
  }, { presets, themes: [null, ...manifest.themes], modes: manifest.modes });
  await test.info().attach('feedback-results', { body: JSON.stringify(result), contentType: 'application/json' });
  expect(result.states).toBe(presets.length * 78);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 3), null, 2)).toBe(0);
});
