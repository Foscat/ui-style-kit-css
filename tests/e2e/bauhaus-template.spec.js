import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';

/** @param {import('@playwright/test').Page} page Demo browser. @returns {Promise<void>} */
async function open(page) {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'bauhaus');
  await page.selectOption('#modeSelect', 'light');
}

test('Bauhaus existing API uses flat workshop geometry and matching loaders', async ({ page }) => {
  await open(page);
  await expect(page.locator('#overview')).toHaveCSS('border-radius', '0px');
  await expect(page.locator('#overview')).toHaveCSS('background-image', 'none');
  await expect(page.locator('.demo-control-card .bau-button').first()).toHaveCSS('box-shadow', 'none');
  await expect(page.locator('.bau-spinner').first()).toHaveCSS('border-radius', '50%');
  const busy = page.locator('#native button[aria-busy="true"]').first();
  expect(await busy.evaluate(node => getComputedStyle(node, '::after').borderRadius)).toBe('50%');
  expect(await busy.evaluate(node => getComputedStyle(node, '::after').backgroundImage)).toBe('none');
  await expect(page.locator('body')).toHaveCSS('font-family', /Bauhaus Barlow/);
});

test('Bauhaus full surface inherits all library themes without changing geometry', async ({ page }) => {
  test.setTimeout(90000);
  await open(page);
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const theme of manifest.themes) {
    await page.selectOption('#themeSelect', theme);
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.selectOption('#modeSelect', mode);
      const facts = await page.evaluate(() => {
        const root = getComputedStyle(document.body);
        const probe = document.createElement('span');
        document.body.append(probe);
        const rgb = role => { probe.style.color = `rgb(${root.getPropertyValue(`--usk-${role}-rgb`)})`; return getComputedStyle(probe).color; };
        const checks = [
          ['.bau-sheet .bau-actions', 'backgroundColor', 'surface'],
          ['.bau-sheet .bau-actions', 'color', 'text'],
          ['.bau-system', 'backgroundColor', 'primary'],
          ['.bau-system', 'color', 'primary-text'],
          ['.bau-usage', 'backgroundColor', 'warning'],
          ['.bau-usage', 'color', 'warning-text'],
          ['.bau-quota', 'backgroundColor', 'danger'],
          ['.bau-quota', 'color', 'danger-text'],
          ['.bau-sidebar', 'backgroundColor', 'surface-strong'],
          ['.bau-sidebar', 'color', 'text']
        ].map(([selector, property, role]) => [selector, getComputedStyle(document.querySelector(selector))[property], rgb(role)]);
        probe.remove(); return checks;
      });
      for (const [selector, actual, expected] of facts) expect(actual, `${theme}/${mode} ${selector}`).toBe(expected);
      await expect(page.locator('.bau-sheet .bau-panel').first()).toHaveCSS('border-radius', '0px');
    }
  }
});

test('Bauhaus fallback modes, nested inheritance and responsive specimen work', async ({ page }) => {
  await open(page);
  await page.locator('[data-bau-reference]').click();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(238, 233, 221)');
  await expect(page.locator('.bau-sidebar')).toHaveCSS('background-color', 'rgb(5, 5, 5)');
  await page.locator('[data-bau-password]').click();
  await expect(page.locator('.bau-sheet input[name="password"]')).toHaveAttribute('type', 'text');
  await page.locator('[data-bau-range]').fill('84');
  await expect(page.locator('[data-bau-range-value]')).toHaveText('84');
  await page.locator('.bau-sheet button[role="switch"]').first().click();
  await expect(page.locator('.bau-sheet button[role="switch"]').first()).toHaveAttribute('aria-checked', 'false');
  await page.locator('[data-bau-confirm]').click();
  await expect(page.locator('.bau-sheet dialog')).not.toBeVisible();
  await page.locator('[data-bau-show]').first().click();
  await expect(page.locator('.bau-sheet dialog')).toBeVisible();
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    for (const width of [1536, 1012, 768, 390]) {
      await page.setViewportSize({ width, height: 1024 });
      expect(await page.locator('.bau-sheet').evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
      await page.locator('.bau-sheet').screenshot({ path: `.tmp/bauhaus-${mode}-${width}.png`, style: '.demo-controls{visibility:hidden}' });
    }
  }
  await page.selectOption('#modeSelect', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 5, 5)');
  await page.evaluate(() => {
    const host = document.createElement('section');
    host.style.setProperty('--usk-primary-rgb', '12 123 87');
    host.innerHTML = '<div data-ui="bauhaus" data-mode="light"><button class="bau-button bau-button-primary" id="inherited-bau">Inherited</button></div>';
    document.body.append(host);
  });
  await expect(page.locator('#inherited-bau')).toHaveCSS('background-color', 'rgb(12, 123, 87)');
});

for (const mode of ['light', 'dark', 'contrast']) {
  test(`Bauhaus accessible controls and reference contrast: ${mode}`, async ({ page }) => {
    await open(page);
    await page.locator('[data-bau-reference]').click();
    await page.selectOption('#modeSelect', mode);
    await page.locator('.bau-sheet').screenshot({ path: `.tmp/bauhaus-reviewed-${mode}.png`, style: '.demo-controls{visibility:hidden}' });
    const result = await new AxeBuilder({ page }).include('.bau-sheet').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
    const switchButton = page.locator('.bau-sheet button[role="switch"]').first();
    await expect(switchButton).toHaveCSS('height', '24px');
    await switchButton.focus();
    await page.keyboard.press('Space');
    await expect(switchButton).toHaveAttribute('aria-checked', 'false');
    const tabs = page.locator('.bau-tabs [role="tab"]');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.bau-sheet .bau-spinner')).toHaveCSS('animation-name', 'none');
  });
}

test('Bauhaus semantic switches and native checkmarks preserve the control contract', async ({ page }) => {
  await open(page);
  await page.setViewportSize({ width: 1012, height: 792 });
  const switchLabel = page.locator('label.ui-switch').first();
  expect(await switchLabel.evaluate(node => node.getBoundingClientRect().width)).toBeGreaterThan(70);
  const control = switchLabel.locator('input');
  const checked = await control.isChecked();
  await switchLabel.click();
  await expect(control).toBeChecked({ checked: !checked });
  const native = page.locator('.bau-sheet input[type="checkbox"]').first();
  await expect(native).toHaveCSS('background-image', 'none');
  expect(await native.evaluate(node => getComputedStyle(node, '::after').borderBottomWidth)).toBe('2px');
  await page.locator('#components').screenshot({ path: '.tmp/bauhaus-generic-components.png', style: '.demo-controls{visibility:hidden}' });
});
