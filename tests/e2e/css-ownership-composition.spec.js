import fs from 'node:fs';

import { expect, test } from '@playwright/test';

const visualCss = fs.readFileSync(new URL('../../dist/ui-style-kit.visual.css', import.meta.url), 'utf8');
const defaultsCss = fs.readFileSync(new URL('../../styles/clean-defaults.css', import.meta.url), 'utf8');
const compositionCss = fs.readFileSync(new URL('../../styles/component-composition.css', import.meta.url), 'utf8');
const presets = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8')).presets;

/**
 * Loads the shipped visual bundle with the candidate shared composition sources.
 *
 * @param {import('@playwright/test').Page} page Browser fixture.
 * @param {string} content Semantic specimen markup.
 * @returns {Promise<void>} Resolves after the specimen is styled.
 */
async function loadSpecimen(page, content) {
  await page.setContent(`<style>${visualCss}\n${defaultsCss}\n${compositionCss}</style>
    <main data-ui="neo-noir" data-mode="dark" data-theme="midnight-gold">${content}</main>`);
}

test('ordinary and explicit inline links preserve text geometry and punctuation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await loadSpecimen(page, `<p>Read <a href="#native" id="native">the guide</a>, then
    <a href="#semantic" class="usk-link" data-link-presentation="inline" id="semantic"><span class="usk-link__label">continue reading this long wrapping link</span></a>.</p>
    <a href="#action" class="usk-link" data-link-presentation="control" id="action">Open workspace</a>`);

  for (const mode of ['light', 'dark', 'contrast']) {
    await page.locator('main').evaluate((element, value) => element.setAttribute('data-mode', value), mode);
    for (const selector of ['#native', '#semantic', '#semantic > span']) {
      const geometry = await page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);
        return { display: style.display, margin: style.margin, padding: style.padding };
      });
      expect(geometry, `${mode}: ${selector}`).toEqual({ display: 'inline', margin: '0px', padding: '0px' });
    }
    expect(await page.locator('#action').evaluate((element) => getComputedStyle(element).display)).toBe('inline-flex');
  }
  await page.locator('#native').focus();
  expect(await page.locator('#native').evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('card spacing is explicit and structural articles do not add another painted inset', async ({ page }) => {
  await loadSpecimen(page, `<div class="usk-card" data-card-spacing="flush" id="flush">Flush</div>
    <div class="ui-card" data-card-spacing="compact" id="legacy-compact">Compatibility namespace</div>
    <div class="usk-card" data-card-spacing="compact" id="compact">Compact</div>
    <div class="usk-card" data-card-spacing="normal" id="normal">Normal</div>
    <div class="usk-card" data-card-spacing="comfortable" id="comfortable"><article data-ui-structure="neutral" id="structural">Structural content</article></div>`);
  for (const [id, padding] of [['flush', '0px'], ['compact', '12px'], ['normal', '16px'], ['legacy-compact', '12px']]) {
    expect(await page.locator(`#${id}`).evaluate((element) => getComputedStyle(element).padding)).toBe(padding);
  }
  expect(await page.locator('#comfortable').evaluate((element) => parseFloat(getComputedStyle(element).padding))).toBeGreaterThanOrEqual(20);
  const structural = await page.locator('#structural').evaluate((element) => {
    const style = getComputedStyle(element);
    return { padding: style.padding, border: style.borderWidth, background: style.backgroundColor, shadow: style.boxShadow };
  });
  expect(structural).toEqual({ padding: '0px', border: '0px', background: 'rgba(0, 0, 0, 0)', shadow: 'none' });
});

test('Neo Noir current navigation uses its paired foreground across modes and shared themes', async ({ page }) => {
  await loadSpecimen(page, '<a class="usk-nav-link" href="#current" aria-current="page"><span class="usk-nav-link__label">Current page</span></a>');
  for (const mode of ['light', 'dark', 'contrast']) {
    for (const theme of ['', 'midnight-gold', 'ocean-steel']) {
      await page.locator('main').evaluate((element, state) => {
        element.setAttribute('data-mode', state.mode);
        if (state.theme) element.setAttribute('data-theme', state.theme);
        else element.removeAttribute('data-theme');
      }, { mode, theme });
      await page.locator('a').evaluate(async (element) => {
        getComputedStyle(element).color;
        await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
      });
      const colors = await page.locator('a').evaluate((element) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--usk-native-on-primary)';
        element.append(probe);
        const expected = getComputedStyle(probe).color;
        const actual = getComputedStyle(element).color;
        const label = getComputedStyle(element.querySelector('.usk-nav-link__label')).color;
        probe.remove();
        return { actual, expected, label };
      });
      expect(colors.actual, `${mode}/${theme || 'reference'} root`).toBe(colors.expected);
      expect(colors.label, `${mode}/${theme || 'reference'} label`).toBe(colors.expected);
    }
  }
});

test('component labels and decorative icons do not acquire independent spacing floors', async ({ page }) => {
  await loadSpecimen(page, '<button class="usk-button"><span class="usk-button__icon">+</span><span class="usk-button__label">Create item</span></button><a class="usk-nav-link" href="#nav"><span class="usk-nav-link__label">Navigation</span></a><a class="usk-link" href="#link"><span class="usk-link__label">Link</span></a>');
  for (const selector of ['.usk-button__icon', '.usk-button__label', '.usk-nav-link__label', '.usk-link__label']) {
    const spacing = await page.locator(selector).evaluate((element) => ({ margin: getComputedStyle(element).margin, padding: getComputedStyle(element).padding }));
    expect(spacing, selector).toEqual({ margin: '0px', padding: '0px' });
  }
});

test('modal auto margins survive the shared spacing floor', async ({ page }) => {
  await loadSpecimen(page, '<dialog class="usk-modal" aria-label="Details">Dialog content</dialog>');
  await page.locator('dialog').evaluate((element) => element.showModal());
  const geometry = await page.locator('dialog').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2, viewportX: innerWidth / 2, viewportY: innerHeight / 2 };
  });
  expect(Math.abs(geometry.centerX - geometry.viewportX)).toBeLessThan(1);
  expect(Math.abs(geometry.centerY - geometry.viewportY)).toBeLessThan(1);
});

test('avatar fallback geometry is centered without a font-relative offset across presets', async ({ page }) => {
  await loadSpecimen(page, '<span class="usk-avatar" role="img" aria-label="Alex Smith"><span class="usk-avatar__fallback" aria-hidden="true">AS</span></span>');
  for (const { id } of presets) {
    await page.locator('main').evaluate((element, value) => element.setAttribute('data-ui', value), id);
    const offset = await page.locator('.usk-avatar').evaluate((element) => {
      const outer = element.getBoundingClientRect();
      const inner = element.querySelector('.usk-avatar__fallback').getBoundingClientRect();
      return { x: inner.left + inner.width / 2 - outer.left - outer.width / 2, y: inner.top + inner.height / 2 - outer.top - outer.height / 2 };
    });
    expect(Math.abs(offset.x), `${id} horizontal`).toBeLessThan(.75);
    expect(Math.abs(offset.y), `${id} vertical`).toBeLessThan(.75);
  }
});

test('long chip labels wrap inside a constrained shared chip', async ({ page }) => {
  await loadSpecimen(page, '<span class="usk-chip" style="max-inline-size: 9rem"><span class="usk-chip__label">VeryLongInventoryClassificationWithoutSpaces</span><button aria-label="Remove filter">×</button></span>');
  expect(await page.locator('.usk-chip').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test('explicit neutral shell boundaries opt out of element insets without resetting ordinary content', async ({ page }) => {
  await loadSpecimen(page, '<header data-ui-structure="neutral" id="shell-header">Brand</header><div data-ui-structure="neutral" id="route-boundary">Route</div><section id="ordinary-section">Content</section>');
  for (const id of ['shell-header', 'route-boundary']) {
    const spacing = await page.locator(`#${id}`).evaluate((element) => ({ margin: getComputedStyle(element).margin, padding: getComputedStyle(element).padding }));
    expect(spacing, id).toEqual({ margin: '0px', padding: '0px' });
  }
  expect(await page.locator('#ordinary-section').evaluate((element) => getComputedStyle(element).padding)).toBe('2px');
});
