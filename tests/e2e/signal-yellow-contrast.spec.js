import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));
const css = fs.readFileSync(new URL('../../dist/ui-style-kit.css', import.meta.url), 'utf8');

/**
 * Renders text treatments against the palette surface alongside filled controls.
 * @param {{id: string, prefix: string}} preset Public preset identity.
 * @returns {string} Scoped prefixed and semantic component specimens.
 */
function renderSpecimen({ id, prefix }) {
  return `<section data-ui="${id}" data-theme="signal-yellow" data-mode="light"
    style="background: rgb(var(--usk-surface-rgb)); padding: 24px; margin: 16px">
    <h2>${id}</h2>
    <p class="${prefix}-kicker">Primary heading</p>
    <p class="${prefix}-text-primary">Primary text</p>
    <p class="${prefix}-text-accent">Accent text</p>
    <button class="${prefix}-button ${prefix}-button-primary">Primary action</button>
    <button class="${prefix}-button ${prefix}-button-secondary">Secondary action</button>
    <button class="${prefix}-button ${prefix}-button-ghost">Ghost action</button>
    <button class="ui-button" data-ui-variant="secondary">Semantic secondary</button>
    <button class="ui-button" data-ui-variant="ghost">Semantic ghost</button>
  </section>`;
}

test('Signal Yellow light text stays readable across presets while retaining vivid fills', async ({ page }) => {
  await page.setContent(`<main id="specimens">${manifest.presets.map(renderSpecimen).join('')}</main>`);
  await page.addStyleTag({ content: css });
  const results = await new AxeBuilder({ page }).include('#specimens').withRules(['color-contrast']).analyze();
  expect(results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
  }))).toEqual([]);
  for (const { id } of manifest.presets) {
    await expect(page.locator(`section[data-ui="${id}"]`)).toHaveCSS('--usk-primary-rgb', '255 204 0');
  }
});

test('theme ink overrides stay scoped and preserve other palette text colors', async ({ page }) => {
  await page.setContent(`<div data-ui="minimal-saas" data-theme="signal-yellow" data-mode="light">
    <span id="yellow" class="saas-text-primary">Yellow theme text</span>
    <div data-ui="minimal-saas" data-theme="cobalt-electric" data-mode="light">
      <span id="cobalt" class="saas-text-primary">Nested cobalt text</span>
    </div>
  </div>`);
  await page.addStyleTag({ content: css });
  await expect(page.locator('#yellow')).toHaveCSS('color', 'rgb(112, 79, 0)');
  await expect(page.locator('#cobalt')).toHaveCSS('color', 'rgb(0, 64, 163)');
  await page.locator('[data-ui]').first().evaluate(element => { element.dataset.mode = 'dark'; });
  await expect(page.locator('#yellow')).toHaveCSS('color', 'rgb(255, 216, 59)');
  await page.locator('[data-ui]').first().evaluate(element => {
    element.dataset.mode = 'light';
    element.dataset.theme = 'arctic-indigo';
  });
  await expect(page.locator('#yellow')).toHaveCSS('color', 'rgb(49, 72, 148)');
});
