import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';

/** @param {import('@playwright/test').Page} page Local bundle. @returns {Promise<void>} */
async function open(page) {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'bento');
  await page.selectOption('#modeSelect', 'light');
}

test('Bento source components and fallback palettes are public and isolated', async ({ page }) => {
  await open(page);
  const sheet = page.locator('.bento-sheet');
  await expect(sheet).toHaveCount(1);
  await sheet.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 249, 253)');
  await expect(sheet.locator('.bento-panel').first()).toHaveCSS('border-radius', '17px');
  await expect(sheet.locator('.bento-button').first()).toHaveCSS('border-radius', '8px');
  await expect(sheet).toHaveCSS('font-family', /Bento Manrope/);
  for (const name of ['sidebar', 'hero', 'system', 'usage', 'quota', 'form-grid', 'choices', 'sliders', 'segment', 'status', 'toast', 'loading', 'table-panel', 'listbox', 'dialog-zone']) await expect(sheet.locator(`.bento-${name}`).first()).toBeVisible();
  await page.selectOption('#modeSelect', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 17, 31)');
  await page.selectOption('#uiSelect', 'organic-modern');
  await expect(sheet).toHaveCount(0);
});

test('Bento whole-surface paint follows every theme while geometry remains stable', async ({ page }) => {
  test.setTimeout(90000);
  await open(page);
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const theme of manifest.themes) {
    await page.selectOption('#themeSelect', theme);
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.selectOption('#modeSelect', mode);
      const facts = await page.evaluate(() => {
        const read = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
        const probe = document.createElement('div'); probe.style.cssText = 'background:rgb(var(--usk-surface-rgb));color:rgb(var(--usk-text-rgb))'; document.body.append(probe);
        const expected = getComputedStyle(probe); const result = [read('.bento-sheet .bento-actions','backgroundColor'),expected.backgroundColor,read('.bento-sheet .bento-actions','color'),expected.color,read('.bento-sheet .bento-actions','borderRadius')]; probe.remove(); return result;
      });
      expect(facts[0], `${theme}/${mode}`).toBe(facts[1]); expect(facts[2]).toBe(facts[3]); expect(facts[4]).toBe('17px');
    }
  }
});

test('Bento specimen controls and responsive compositions operate', async ({ page }) => {
  await open(page);
  const sheet = page.locator('.bento-sheet');
  await sheet.getByLabel('Show password').click();
  await expect(sheet.locator('input[name="password"]')).toHaveAttribute('type','text');
  await sheet.locator('[data-bento-range]').fill('84');
  await expect(sheet.locator('[data-bento-range-value]')).toHaveText('84');
  await sheet.getByRole('option', {name:'Staging'}).click();
  await expect(sheet.getByRole('option', {name:'Staging'})).toHaveAttribute('aria-selected','true');
  await sheet.getByRole('button', {name:'Confirm',exact:true}).click();
  await expect(sheet.locator('dialog')).not.toBeVisible();
  await sheet.getByRole('button', {name:'Show dialog',exact:true}).click();
  await expect(sheet.locator('dialog')).toBeVisible();
  for (const mode of ['light','dark']) {
    await page.selectOption('#modeSelect',mode);
    for (const width of [1600,768,390]) {
      await page.setViewportSize({width,height:1000});
      expect(await sheet.evaluate(node=>node.scrollWidth-node.clientWidth)).toBeLessThanOrEqual(2);
      await sheet.screenshot({path:`.tmp/bento-${mode}-${width}.png`,style:'.demo-controls{visibility:hidden}'});
    }
  }
});

test('Bento source controls retain their treatment over native fallbacks', async ({ page }) => {
  await open(page);
  const sheet = page.locator('.bento-sheet');
  const foreground = await sheet.locator('.bento-system').evaluate(node => getComputedStyle(node).color);
  await expect(sheet.locator('.bento-system > p')).toHaveCSS('color', foreground);
  await expect(sheet.locator('.bento-choices fieldset').first()).toHaveCSS('border-top-width', '0px');
  await expect(sheet.locator('.bento-spinner').first()).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(sheet.locator('.bento-spinner').first()).toHaveCSS('border-radius', '50%');
  await expect(sheet.locator('.bento-input-icon button')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

for (const reference of [false, true]) {
  for (const mode of ['light', 'dark', 'contrast']) {
    test(`Bento accessible contrast: ${reference ? 'fallback' : 'theme'}/${mode}`, async ({ page }) => {
      await open(page);
      if (reference) await page.locator('[data-bento-reference]').click();
      await page.selectOption('#modeSelect', mode);
      await page.locator('.bento-sheet').screenshot({ path: `.tmp/bento-${reference ? 'fallback' : 'theme'}-${mode}.png`, style: '.demo-controls{visibility:hidden}' });
      const result = await new AxeBuilder({ page }).include('.bento-sheet').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })), `${reference ? 'fallback' : 'theme'}/${mode}`).toEqual([]);
    });
  }
}
