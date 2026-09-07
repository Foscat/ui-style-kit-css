import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

/** Opens the annotated preset with deterministic theme and viewport settings. */
async function openRefinements(page, mode = 'light', width = 1115) {
  await page.setViewportSize({ width, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'neo-noir');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', mode);
}

test('Neo Noir refined shapes remove duplicate paint and retain native controls', async ({ page }) => {
  await openRefinements(page);
  const facts = await page.evaluate(() => {
    const css = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const s = css('#uiSelect');
    return {
      select: [s.appearance, s.backgroundImage],
      buttons: ['.noir-workflow .noir-button-secondary', '.noir-workflow .noir-button-outline', '.demo-state-grid .noir-button.is-active'].map((selector) => {
        const b = css(selector);
        return [b.backgroundColor, b.backgroundImage, b.boxShadow];
      }),
      radius: css('.demo-utility-shape.noir-rounded').borderRadius,
      medallion: css('.noir-feature-item .noir-icon-medallion', '::before').clipPath,
      check: css('#native input[type="checkbox"]:checked', '::before').content
    };
  });
  expect.soft(facts.select).toEqual(['auto', 'none']);
  for (const button of facts.buttons) expect.soft(button).toEqual(['rgba(0, 0, 0, 0)', 'none', 'none']);
  expect.soft(facts.radius).toBe('8px');
  expect.soft(facts.medallion).toContain('polygon(');
  expect.soft(facts.check).toBe('""');
});

test('Neo Noir dark button matrix and native dialog keep clean insets', async ({ page }) => {
  await openRefinements(page, 'dark');
  for (const select of await page.locator('.demo-controls select').all()) {
    await expect(select).toHaveCSS('background-image', 'none');
  }
  for (const button of await page.locator('#noir-group-2 .noir-button').all()) {
    await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(button).toHaveCSS('box-shadow', 'none');
  }
  for (const mark of await page.locator('.noir-feature-strip .noir-icon-medallion, .noir-badge-seal, .noir-callout-bar .noir-icon-medallion').all()) {
    expect(await mark.evaluate((node) => getComputedStyle(node, '::before').clipPath)).toContain('polygon(');
  }
  const dialog = page.locator('.demo-inline-dialog');
  await expect(dialog).toHaveCSS('padding', '20px');
  const bounds = await dialog.evaluate((node) => {
    const a = node.getBoundingClientRect();
    const b = node.querySelector('form').getBoundingClientRect();
    return [b.x - a.x, b.y - a.y, a.right - b.right, a.bottom - b.bottom];
  });
  bounds.forEach((gap) => expect(gap).toBeGreaterThanOrEqual(20));
  await page.addStyleTag({ content: '.demo-controls { position: static !important; }' });
  await page.locator('#noir-group-2').screenshot({ path: path.join(os.tmpdir(), 'noir-dark-button-matrix.png') });
  await dialog.screenshot({ path: path.join(os.tmpdir(), 'noir-dark-inline-dialog.png') });
});

test('Neo Noir exposure value follows the handle and keyboard input', async ({ page }) => {
  await openRefinements(page);
  const range = page.locator('#noir-exposure');
  const value = page.locator('.noir-slider-value');
  for (const setting of ['-5', '0', '1.3', '5']) {
    await range.fill(setting);
    const boxes = await range.evaluate((node) => {
      const r = node.getBoundingClientRect();
      const v = node.parentElement.querySelector('output').getBoundingClientRect();
      const progress = (Number(node.value) - Number(node.min)) / (Number(node.max) - Number(node.min));
      return { expected: r.x + 12 + progress * (r.width - 24), actual: v.x + v.width / 2 };
    });
    expect(Math.abs(boxes.actual - boxes.expected)).toBeLessThan(1);
  }
  await range.fill('1.3');
  await range.focus();
  await range.press('ArrowRight');
  await expect(value).toHaveText('+1.4');
  await expect(range).toHaveValue('1.4');
  await expect(range).toHaveCSS('min-height', '44px');
  const ticks = await page.locator('.noir-range-scale > span').evaluateAll((nodes) => nodes.map((node) => {
    const r = node.getBoundingClientRect();
    return r.x + r.width / 2;
  }));
  const track = await range.boundingBox();
  ticks.forEach((tick, i) => expect(Math.abs(tick - track.x - 12 - (track.width - 24) * i / 10)).toBeLessThan(1));
});

test('Neo Noir refinement visual and checkbox state checks', async ({ page }) => {
  for (const [mode, width] of [['light', 1115], ['dark', 1115], ['light', 390]]) {
    await openRefinements(page, mode, width);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addStyleTag({ content: '.demo-controls { position: static !important; }' });
    const check = page.locator('#native input[type="checkbox"]').first();
    await check.focus();
    await check.press('Space');
    await expect(check).not.toBeChecked();
    await check.press('Space');
    await expect(check).toBeChecked();
    for (const hidden of await page.locator('.noir-check input, .noir-switch input').all()) {
      await expect(hidden).toHaveCSS('position', 'absolute');
    }
    const glyph = await check.evaluate((node) => {
      const s = getComputedStyle(node, '::before');
      return { position: s.position, width: s.width, height: s.height, background: getComputedStyle(node).backgroundImage };
    });
    expect(glyph).toEqual({ position: 'absolute', width: '11px', height: '11px', background: 'none' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const [name, selector] of [['range', '#noir-group-7'], ['workflow', '#noir-group-8'], ['states', '.demo-state-grid'], ['medallions', '.noir-feature-strip'], ['native', '#native fieldset'], ['rounded', '.demo-utility-shape-grid']]) {
      await page.locator(selector).first().screenshot({ path: path.join(os.tmpdir(), `noir-refinements-${name}-${mode}-${width}.png`) });
    }
  }
});
