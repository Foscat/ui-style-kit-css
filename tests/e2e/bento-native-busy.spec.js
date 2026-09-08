import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Locator} button Busy control. @returns {Promise<object>} Rendered loader facts. */
async function loaderFacts(button) {
  return button.evaluate(node => {
    const style = getComputedStyle(node, '::after');
    return {
      radius: style.borderRadius,
      background: style.backgroundImage,
      clip: style.clipPath,
      shadow: style.boxShadow,
      top: style.borderTopColor,
      right: style.borderRightColor,
      foreground: getComputedStyle(node).color,
      timing: style.animationTimingFunction,
      width: style.width,
      height: style.height,
    };
  });
}

test('Bento native busy buttons use the same ring as classed and semantic controls', async ({ page }) => {
  await page.setViewportSize({ width: 1012, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.selectOption('#uiSelect', 'bento');
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    const native = page.getByRole('button', { name: 'Busy native', exact: true });
    const authored = page.locator('.demo-state-grid .bento-button[aria-busy="true"]').first();
    const semantic = page.locator('.ui-button').first();
    await semantic.evaluate(node => node.setAttribute('aria-busy', 'true'));
    for (const button of [native, authored, semantic]) {
      const facts = await loaderFacts(button);
      expect(facts.radius, `${mode}: circular loader`).toBe('50%');
      expect(facts.background).toBe('none');
      expect(facts.clip).toBe('none');
      expect(facts.shadow).toBe('none');
      expect(facts.top).toBe('rgba(0, 0, 0, 0)');
      expect(facts.right).toBe(facts.foreground);
      expect(facts.timing).toBe('linear');
      expect(facts.width).toBe(facts.height);
    }
  }
  await page.selectOption('#modeSelect', 'light');
  await page.getByRole('button', { name: 'Busy native', exact: true }).screenshot({ path: '.tmp/bento-native-busy.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const iterations = await page.getByRole('button', { name: 'Busy native', exact: true }).evaluate(node => getComputedStyle(node, '::after').animationIterationCount);
  expect(iterations).toBe('1');
});
