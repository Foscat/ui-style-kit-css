import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.visual.css');
const buttonVariants = [null, 'primary', 'secondary', 'danger', 'ghost'];

const buttonProperties = [
  'alignItems',
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'cursor',
  'display',
  'fontFamily',
  'fontWeight',
  'justifyContent',
  'minHeight',
  'opacity',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop'
];
const cardProperties = [
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop'
];

function buttonMarkup(prefix, variant, kind) {
  const variantAttribute = variant ? ` data-ui-variant="${variant}"` : '';
  const prefixedVariant = variant ? ` ${prefix}-button-${variant}` : '';
  const disabled = kind === 'disabled' ? ' disabled' : '';

  return `
    <button id="semantic-${kind}" class="ui-button"${variantAttribute}${disabled}>Semantic ${kind}</button>
    <button id="prefixed-${kind}" class="${prefix}-button${prefixedVariant}"${disabled}>Prefixed ${kind}</button>`;
}

function groupOneFixture(preset) {
  const variantMarkup = buttonVariants.map((variant) => {
    const kind = variant ?? 'neutral';
    return buttonMarkup(preset.prefix, variant, kind);
  }).join('');

  return `<!doctype html>
    <html lang="en">
      <head>
        <style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>
      </head>
      <body data-ui="${preset.id}" data-theme="arctic-indigo" data-mode="light">
        <main>
          ${variantMarkup}
          ${buttonMarkup(preset.prefix, null, 'disabled')}
          <button id="semantic-icon" class="ui-icon-button" aria-label="Semantic settings">S</button>
          <button id="prefixed-icon" class="${preset.prefix}-icon-button" aria-label="Prefixed settings">P</button>
          <article id="semantic-card" class="ui-card">Semantic card</article>
          <article id="prefixed-card" class="${preset.prefix}-card">Prefixed card</article>
        </main>
      </body>
    </html>`;
}

async function computedSnapshot(page, selector, properties) {
  return page.locator(selector).evaluate((element, propertyNames) => {
    const styles = getComputedStyle(element);
    return Object.fromEntries(propertyNames.map((property) => [property, styles[property]]));
  }, properties);
}

test('semantic buttons and cards match prefixed twins across every preset', async ({ page }) => {
  for (const preset of manifest.presets) {
    await page.setContent(groupOneFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });

    for (const variant of buttonVariants) {
      const kind = variant ?? 'neutral';
      const semantic = await computedSnapshot(page, `#semantic-${kind}`, buttonProperties);
      const prefixed = await computedSnapshot(page, `#prefixed-${kind}`, buttonProperties);
      expect(semantic, `${preset.id} ${kind} button`).toEqual(prefixed);
    }

    expect(
      await computedSnapshot(page, '#semantic-disabled', buttonProperties),
      `${preset.id} disabled button`
    ).toEqual(await computedSnapshot(page, '#prefixed-disabled', buttonProperties));
    expect(
      await computedSnapshot(page, '#semantic-icon', buttonProperties),
      `${preset.id} icon button`
    ).toEqual(await computedSnapshot(page, '#prefixed-icon', buttonProperties));
    expect(
      await computedSnapshot(page, '#semantic-card', cardProperties),
      `${preset.id} card`
    ).toEqual(await computedSnapshot(page, '#prefixed-card', cardProperties));

    await expect(page.locator('#semantic-neutral')).toHaveRole('button');
    await expect(page.locator('#semantic-disabled')).toBeDisabled();
    const neutralOpacity = Number.parseFloat((await computedSnapshot(
      page,
      '#semantic-neutral',
      ['opacity']
    )).opacity);
    const disabledOpacity = Number.parseFloat((await computedSnapshot(
      page,
      '#semantic-disabled',
      ['opacity']
    )).opacity);
    expect(disabledOpacity, `${preset.id} disabled opacity`).toBeLessThan(neutralOpacity);
  }
});

test('changing only data-ui restyles stable semantic button and card nodes', async ({ page }) => {
  await page.setContent(groupOneFixture(manifest.presets[0]));
  await page.addStyleTag({ path: visualBundlePath });

  const initialIdentity = await page.evaluate(() => {
    const button = document.querySelector('#semantic-primary');
    const card = document.querySelector('#semantic-card');
    button.dataset.identity = 'stable-button';
    card.dataset.identity = 'stable-card';
    return { buttonClass: button.className, cardClass: card.className };
  });
  const fingerprints = [];

  for (const preset of manifest.presets) {
    await page.evaluate(({ id, prefix }) => {
      document.body.dataset.ui = id;
      document.querySelector('#prefixed-primary').className = `${prefix}-button ${prefix}-button-primary`;
      document.querySelector('#prefixed-card').className = `${prefix}-card`;
    }, preset);

    const semanticButton = await computedSnapshot(page, '#semantic-primary', buttonProperties);
    const prefixedButton = await computedSnapshot(page, '#prefixed-primary', buttonProperties);
    const semanticCard = await computedSnapshot(page, '#semantic-card', cardProperties);
    const prefixedCard = await computedSnapshot(page, '#prefixed-card', cardProperties);
    expect(semanticButton, `${preset.id} stable primary button`).toEqual(prefixedButton);
    expect(semanticCard, `${preset.id} stable card`).toEqual(prefixedCard);
    fingerprints.push(JSON.stringify({ semanticButton, semanticCard }));

    const identity = await page.evaluate(() => ({
      buttonClass: document.querySelector('[data-identity="stable-button"]').className,
      cardClass: document.querySelector('[data-identity="stable-card"]').className
    }));
    expect(identity).toEqual(initialIdentity);
  }

  expect(new Set(fingerprints).size, 'preset switching must visibly restyle semantic nodes').toBeGreaterThan(1);
});

test('semantic buttons retain keyboard focus and forced-colors behavior', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the forced-colors emulation used by this contract.');

  for (const preset of manifest.presets) {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.setContent(groupOneFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });
    await page.locator('body').press('Tab');
    await expect(page.locator('#semantic-neutral')).toBeFocused();

    const focusStyles = await computedSnapshot(page, '#semantic-neutral', [
      'boxShadow',
      'forcedColorAdjust',
      'outlineColor',
      'outlineStyle',
      'outlineWidth'
    ]);
    expect(focusStyles.forcedColorAdjust, `${preset.id} forced-color adjustment`).toBe('auto');
    expect(focusStyles.outlineStyle, `${preset.id} focus outline`).not.toBe('none');
    expect(Number.parseFloat(focusStyles.outlineWidth), `${preset.id} focus width`).toBeGreaterThanOrEqual(2);

    // Axe evaluates authored colors accurately after leaving the emulated system-color palette.
    await page.emulateMedia({ forcedColors: 'none' });
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // The repository contrast gate owns preset palette ratios; this scan targets native semantics.
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations, `${preset.id} semantic group one axe scan`).toEqual([]);
  }
});
