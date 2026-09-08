import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const demoUrl = pathToFileURL(path.resolve('index.html')).href + '?view=reference';

/**
 * Opens the generated Industrial Utility demo in the annotated light-mode
 * configuration so each review correction is measured against the real bundle.
 *
 * @param {import('@playwright/test').Page} page Playwright page under test.
 * @returns {Promise<void>}
 */
async function openIndustrialUtility(page) {
  await page.setViewportSize({ width: 645, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'industrial-utility');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
}

test('Industrial native fallback surfaces keep copy away from their borders', async ({ page }) => {
  await openIndustrialUtility(page);

  const evidence = await page.evaluate(() => {
    const dialogForm = document.querySelector('.demo-inline-dialog > form');
    const object = document.querySelector('.demo-object');
    const dialogStyle = getComputedStyle(dialogForm);
    const objectStyle = getComputedStyle(object);
    return {
      dialogBlock: Number.parseFloat(dialogStyle.paddingBlockStart),
      dialogInline: Number.parseFloat(dialogStyle.paddingInlineStart),
      objectBlock: Number.parseFloat(objectStyle.paddingBlockStart),
      objectInline: Number.parseFloat(objectStyle.paddingInlineStart),
      objectSizing: objectStyle.boxSizing
    };
  });

  expect(evidence.dialogBlock).toBeGreaterThanOrEqual(12);
  expect(evidence.dialogInline).toBeGreaterThanOrEqual(12);
  expect(evidence.objectBlock).toBeGreaterThanOrEqual(12);
  expect(evidence.objectInline).toBeGreaterThanOrEqual(12);
  expect(evidence.objectSizing).toBe('border-box');
});

test('Industrial marketing call to action uses the machine-control plate treatment', async ({ page }) => {
  await openIndustrialUtility(page);
  const cta = page.getByTestId('marketing-secondary-cta');

  await expect(cta).toHaveCSS('clip-path', 'none');
  await expect(cta).toHaveCSS('border-radius', '2px');
  await expect(cta).toHaveCSS('background-image', /linear-gradient/);
  await expect(cta).toHaveCSS('box-shadow', /rgb/);
});

test('Industrial demo selectors use the platform dropdown indicator', async ({ page }) => {
  await openIndustrialUtility(page);
  const select = page.locator('#uiSelect');

  await expect(select).toHaveCSS('appearance', 'auto');
  await expect(select).toHaveCSS('background-image', 'none');
});

test('Industrial warning badge remains prominent and motion-safe', async ({ page }) => {
  await openIndustrialUtility(page);
  const warning = page.locator('header#overview .utility-badge-warning');
  const active = await warning.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationName: style.animationName,
      borderColor: style.borderTopColor,
      backgroundColor: style.backgroundColor,
      fontSize: Number.parseFloat(style.fontSize)
    };
  });

  expect(active.animationName).toBe('utility-warning-signal');
  expect(active.borderColor).not.toBe('rgb(64, 94, 184)');
  expect(active.fontSize).toBeGreaterThanOrEqual(10);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(warning).toHaveCSS('animation-name', 'none');
});

test('Industrial tooltip arrows identify top, right, and bottom directions', async ({ page }) => {
  await openIndustrialUtility(page);

  const arrows = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element, '::before');
      return {
        top: style.top,
        right: style.right,
        bottom: style.bottom,
        left: style.left,
        transform: style.transform
      };
    };
    return {
      top: read('.utility-tooltip-top'),
      right: read('.utility-tooltip-right'),
      bottom: read('.utility-tooltip-bottom')
    };
  });

  expect(arrows.top.bottom).toBe('-5px');
  expect(arrows.right.left).toBe('-5px');
  expect(arrows.right.transform).not.toBe(arrows.top.transform);
  expect(arrows.bottom.top).toBe('-5px');
});

test('Industrial trust seal enlarges its type without changing the plate', async ({ page }) => {
  await openIndustrialUtility(page);
  const seal = page.locator('.utility-badge-seal');
  const evidence = await seal.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      valueSize: Number.parseFloat(getComputedStyle(element.querySelector('strong')).fontSize),
      labelSize: Number.parseFloat(getComputedStyle(element.querySelector('small')).fontSize)
    };
  });

  expect(evidence.width).toBe(80);
  expect(evidence.height).toBe(80);
  expect(evidence.valueSize).toBeGreaterThanOrEqual(13);
  expect(evidence.labelSize).toBeGreaterThanOrEqual(11);
});

test('Industrial callout arrow uses explicit two-axis centering', async ({ page }) => {
  await openIndustrialUtility(page);
  const arrow = page.locator('.utility-callout-bar > .utility-icon-medallion');

  await expect(arrow).toHaveCSS('display', 'flex');
  await expect(arrow).toHaveCSS('align-items', 'center');
  await expect(arrow).toHaveCSS('justify-content', 'center');
});

test('Industrial time inputs use a restrained light-metal surface', async ({ page }) => {
  await openIndustrialUtility(page);
  const time = page.locator('[data-testid="native-forms"] input[type="time"]');

  await expect(time).toHaveCSS('background-image', /linear-gradient/);
});

test('Industrial checked native checkboxes retain a solid contrast field', async ({ page }) => {
  await openIndustrialUtility(page);
  const checked = page.locator('[data-testid="native-forms"] input[type="checkbox"]:checked');
  const evidence = await checked.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor
    };
  });

  expect(evidence.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.borderColor).not.toBe('rgb(113, 123, 150)');
});

test('Industrial native range reserves the full centered thumb lane', async ({ page }) => {
  await openIndustrialUtility(page);
  const range = page.getByTestId('native-range-enabled');
  const evidence = await range.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage
    };
  });

  expect(evidence.height).toBeGreaterThanOrEqual(24);
  expect(evidence.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(evidence.backgroundImage).toBe('none');
});
