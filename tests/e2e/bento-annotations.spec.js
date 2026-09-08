import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Page} page Browser page. @returns {Promise<void>} */
async function openBento(page) {
  await page.setViewportSize({ width: 1012, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'bento');
  await page.selectOption('#modeSelect', 'light');
}

test('Bento labeled switches keep readable labels and operable tracks', async ({ page }) => {
  await openBento(page);
  for (const selector of ['label.ui-switch', 'label.bento-switch']) {
    const label = page.locator(selector).first();
    const text = label.locator(':scope > span').last();
    const facts = await text.evaluate(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(node).lineHeight) }));
    expect(facts.width).toBeGreaterThan(35);
    expect(facts.height).toBeLessThanOrEqual(facts.lineHeight + 1);
    const input = label.locator('input');
    const before = await input.isChecked();
    await label.click();
    expect(await input.isChecked()).toBe(!before);
    const track = label.locator('[class$="switch-track"]');
    await expect(track).toHaveCSS('width', '37px');
    await expect(track).toHaveCSS('height', '20px');
    await label.screenshot({ path: `.tmp/bento-${selector.includes('ui-') ? 'semantic' : 'classed'}-switch.png` });
  }
  const compact = page.locator('.bento-sheet button.bento-switch').first();
  await expect(compact).toHaveCSS('width', '37px');
  const state = await compact.getAttribute('aria-checked');
  await compact.click();
  await expect(compact).toHaveAttribute('aria-checked', state === 'true' ? 'false' : 'true');
});

test('Bento spinner sizes retain circular geometry and busy rings match', async ({ page }) => {
  await openBento(page);
  for (const [suffix, size] of [['-sm', 16], ['', 28], ['-lg', 40]]) {
    const spinner = page.locator(`.demo-control-panel .bento-spinner${suffix || ':not(.bento-spinner-sm):not(.bento-spinner-lg)'}`).first();
    if (!suffix) await expect(spinner).toHaveClass('bento-spinner');
    const facts = await spinner.evaluate(node => {
      const style = getComputedStyle(node);
      return { width: parseFloat(style.width), height: parseFloat(style.height), radius: style.borderRadius, background: style.backgroundImage, timing: style.animationTimingFunction };
    });
    expect(facts.width).toBe(size);
    expect(facts.height).toBe(size);
    expect(facts.radius).toBe('50%');
    expect(facts.background).toBe('none');
    expect(facts.timing).toBe('linear');
  }
  for (const selector of ['.bento-actions .is-busy', '.demo-state-grid .bento-button[aria-busy="true"]']) {
    const facts = await page.locator(selector).first().evaluate(node => {
      const style = getComputedStyle(node, '::after');
      return [style.width, style.height, style.borderRadius, style.backgroundImage, style.clipPath];
    });
    expect(facts[0]).toBe(facts[1]);
    expect(facts.slice(2)).toEqual(['50%', 'none', 'none']);
  }
  await page.locator('.demo-control-panel').filter({ has: page.locator('.bento-spinner-lg') }).screenshot({ path: '.tmp/bento-loader-sizes.png' });
});

test('Bento alerts wrap at spaces and service icons have readable scale', async ({ page }) => {
  await openBento(page);
  for (const width of [1012, 390]) {
    await page.setViewportSize({ width, height: 792 });
    for (const title of await page.locator('.bento-alert-title').all()) {
      const facts = await title.evaluate(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        return { lines: range.getClientRects().length, wrap: getComputedStyle(node).overflowWrap, wordBreak: getComputedStyle(node).wordBreak, overflow: node.scrollWidth - node.clientWidth };
      });
      expect(facts.lines).toBe(1);
      expect(facts.wrap).toBe('normal');
      expect(facts.wordBreak).toBe('normal');
      expect(facts.overflow).toBeLessThanOrEqual(1);
    }
  }
  const icon = page.locator('.bento-card-service > .bento-icon-medallion').first();
  expect(await icon.evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(32);
  await icon.screenshot({ path: '.tmp/bento-service-icon.png' });
});

test('Bento native spinner aliases share the reference ring in every mode', async ({ page }) => {
  await openBento(page);
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    const spinner = page.getByRole('status', { name: 'Native loading spinner', exact: true });
    const facts = await spinner.evaluate(node => {
      const style = getComputedStyle(node);
      return [style.backgroundImage, style.borderRadius, style.width, style.height, style.boxShadow];
    });
    expect(facts).toEqual(['none', '50%', '28px', '28px', 'none']);
  }
  await page.selectOption('#modeSelect', 'light');
  await page.locator('.demo-control-panel').filter({ has: page.locator('.bento-spinner-lg') }).screenshot({ path: '.tmp/bento-loader-aliases.png' });
});

test('Bento native samples flow without row-height gaps on desktop and mobile', async ({ page }) => {
  await openBento(page);
  for (const width of [1012, 390]) {
    await page.setViewportSize({ width, height: 792 });
    const facts = await page.locator('.demo-native-grid').evaluate(grid => {
      const rects = [...grid.children].map(node => { const r = node.getBoundingClientRect(); return { x: Math.round(r.x), top: r.top, bottom: r.bottom }; });
      const columns = new Map();
      for (const rect of rects) { if (!columns.has(rect.x)) columns.set(rect.x, []); columns.get(rect.x).push(rect); }
      const gaps = [...columns.values()].flatMap(column => column.sort((a, b) => a.top - b.top).slice(1).map((rect, i) => rect.top - column[i].bottom));
      const bottoms = [...columns.values()].map(column => Math.max(...column.map(rect => rect.bottom)));
      return { columns: columns.size, gaps, bottomGap: Math.max(...bottoms) - Math.min(...bottoms), overflow: grid.scrollWidth - grid.clientWidth };
    });
    expect(facts.columns).toBe(width > 800 ? 2 : 1);
    expect(facts.bottomGap).toBeLessThan(700);
    for (const gap of facts.gaps) expect(gap).toBeLessThanOrEqual(24);
    expect(facts.overflow).toBeLessThanOrEqual(1);
    await page.locator('.demo-native-grid').screenshot({ path: `.tmp/bento-native-columns-${width}.png`, style: '.demo-controls { visibility: hidden; }' });
  }
});
