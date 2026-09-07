import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;
const sourceStyleUrl = pathToFileURL(path.join(rootDir, 'styles', 'neumorphism.css')).href;

/**
 * Loads the editable Neumorphism source after the generated demo bundle.
 *
 * @param {import('@playwright/test').Page} page Active browser page.
 * @returns {Promise<void>} Promise resolved when the stylesheet is ready.
 */
async function loadNeumorphismSource(page) {
  await page.evaluate((href) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error(`Unable to load ${href}`)), { once: true });
    document.head.append(link);
  }), sourceStyleUrl);
}

/**
 * Converts a rendered CSS color into opaque RGB channels.
 *
 * @param {string} value Browser-rendered CSS color.
 * @returns {[number, number, number]} Red, green, and blue channels.
 */
function rgbChannels(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new TypeError(`Expected an RGB color, received: ${value}`);
  return /** @type {[number, number, number]} */ (channels);
}

/**
 * Calculates WCAG contrast for two opaque rendered colors.
 *
 * @param {string} foreground Rendered foreground color.
 * @param {string} background Rendered background color.
 * @returns {number} WCAG contrast ratio.
 */
function contrastRatio(foreground, background) {
  const luminance = (value) => {
    const channels = rgbChannels(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

test('Neumorphism keeps semantic badges and seal copy readable in dark mode', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadNeumorphismSource(page);
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <span class="neo-badge">Neutral</span>
      <span class="neo-badge neo-badge-primary">Primary</span>
      <span class="neo-badge neo-badge-secondary">Secondary</span>
      <span class="neo-badge-seal"><strong>15</strong><small>Years</small></span>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        background: style.backgroundColor,
        color: style.color
      };
    };
    return {
      neutral: read('.neo-badge'),
      primary: read('.neo-badge-primary'),
      secondary: read('.neo-badge-secondary'),
      seal: read('.neo-badge-seal'),
      sealCaption: read('.neo-badge-seal small')
    };
  });

  expect(evidence.primary.background).not.toBe(evidence.neutral.background);
  expect(evidence.secondary.background).not.toBe(evidence.neutral.background);
  expect(contrastRatio(evidence.primary.color, evidence.primary.background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(evidence.secondary.color, evidence.secondary.background)).toBeGreaterThanOrEqual(4.5);
  expect(evidence.sealCaption.color).toBe(evidence.seal.color);
  expect(contrastRatio(evidence.sealCaption.color, evidence.seal.background)).toBeGreaterThanOrEqual(4.5);
});

test('Neumorphism matches the reference light and dark material system', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await loadNeumorphismSource(page);
  await page.evaluate(() => {
    const fixture = document.createElement('section');
    fixture.id = 'neumorphism-reference-fixture';
    fixture.innerHTML = `
      <article class="neo-panel">
        <input class="neo-input" value="Acme Analytics">
        <button class="neo-button">Neutral</button>
        <button class="neo-button neo-button-ghost">Ghost</button>
        <button class="neo-button" aria-pressed="true">Pressed</button>
        <span class="neo-icon-medallion">15</span>
      </article>`;
    document.body.append(fixture);
  });

  const readMaterial = () => page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        background: style.backgroundColor,
        color: style.color,
        shadow: style.boxShadow
      };
    };
    const themeSelect = getComputedStyle(document.querySelector('#themeSelect'));
    return {
      body: read('body'),
      panel: read('#neumorphism-reference-fixture .neo-panel'),
      input: read('#neumorphism-reference-fixture .neo-input'),
      button: read('#neumorphism-reference-fixture .neo-button'),
      ghost: read('#neumorphism-reference-fixture .neo-button-ghost'),
      pressed: read('#neumorphism-reference-fixture [aria-pressed="true"]'),
      medallion: read('#neumorphism-reference-fixture .neo-icon-medallion'),
      themeSelectAppearance: themeSelect.appearance,
      themeSelectBackgroundImage: themeSelect.backgroundImage
    };
  });

  const light = await readMaterial();
  expect(light.body.background).toBe('rgb(241, 238, 236)');
  expect(light.panel.background).toBe(light.body.background);
  expect(light.panel.shadow).not.toBe('none');
  expect(light.panel.shadow).not.toContain('inset');
  expect(light.input.shadow).toContain('inset');
  expect(light.button.background).toBe(light.panel.background);
  expect(light.button.shadow).not.toContain('inset');
  expect(light.ghost.background).toBe(light.panel.background);
  expect(light.ghost.shadow).not.toBe('none');
  expect(light.pressed.shadow).toContain('inset');
  expect(light.medallion.background).toBe(light.panel.background);
  expect(light.medallion.color).not.toBe(light.medallion.background);
  expect(light.medallion.shadow).not.toContain('inset');
  expect(light.themeSelectAppearance).toBe('auto');
  expect(light.themeSelectBackgroundImage).toBe('none');

  await page.locator('body').evaluate((body) => {
    body.dataset.mode = 'dark';
  });
  await expect.poll(async () => (await readMaterial()).panel.background).toBe('rgb(26, 36, 52)');
  const dark = await readMaterial();
  expect(dark.panel.background).toBe(dark.body.background);
  expect(dark.input.background).not.toBe(dark.panel.background);
  expect(dark.panel.shadow).not.toBe(light.panel.shadow);
  expect(dark.input.shadow).toContain('inset');
  expect(dark.button.shadow).not.toContain('inset');
});

test('Neumorphism callout arrow has CTA-scale visual weight', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadNeumorphismSource(page);
  await page.locator('main').evaluate((main) => {
    main.replaceChildren();
    main.insertAdjacentHTML(
      'beforeend',
      `<aside class="neo-callout-bar">
        <span class="neo-icon-medallion" aria-hidden="true">→</span>
        <div><p class="neo-eyebrow">Call to action</p><strong>Give important next steps a dedicated visual lane.</strong></div>
        <a class="neo-button neo-button-outline-heavy" href="#usage">View Usage</a>
      </aside>`
    );
  });

  const arrow = page.locator('.neo-callout-bar > .neo-icon-medallion');
  const evidence = await arrow.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      box: element.getBoundingClientRect().toJSON(),
      fontSize: Number.parseFloat(style.fontSize),
      fontWeight: Number.parseInt(style.fontWeight, 10)
    };
  });

  expect(evidence.box.width).toBeGreaterThanOrEqual(76);
  expect(evidence.box.height).toBeGreaterThanOrEqual(76);
  expect(Math.abs(evidence.box.width - evidence.box.height)).toBeLessThanOrEqual(1);
  expect(evidence.fontSize).toBeGreaterThanOrEqual(32);
  expect(evidence.fontWeight).toBeGreaterThanOrEqual(700);
});

/**
 * Protects the compact surface utility from collapsing into the standard well recipe.
 */
test('Neumorphism compact inset is visibly smaller and shallower than the standard well', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadNeumorphismSource(page);

  const surfaces = page.locator('[data-testid="utility-surface-grid"] .demo-utility-surface.neo-well');
  await expect(surfaces).toHaveCount(2);
  const standard = surfaces.nth(0);
  const compact = surfaces.nth(1);

  const readSurface = (locator) => locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      height: box.height,
      paddingBlockStart: Number.parseFloat(style.paddingBlockStart),
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow
    };
  });
  const standardSurface = await readSurface(standard);
  const compactSurface = await readSurface(compact);

  expect(compactSurface.height).toBeLessThanOrEqual(standardSurface.height - 12);
  expect(compactSurface.paddingBlockStart).toBeLessThan(standardSurface.paddingBlockStart);
  expect(Number.parseFloat(compactSurface.borderRadius)).toBeLessThan(Number.parseFloat(standardSurface.borderRadius));
  expect(compactSurface.boxShadow).not.toBe(standardSurface.boxShadow);
});

test('Neumorphism light controls keep a visible three-to-one boundary', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await loadNeumorphismSource(page);
  await page.locator('main').evaluate((main) => {
    main.insertAdjacentHTML(
      'afterbegin',
      '<section id="neumorphism-edge-fixture"><button class="neo-button neo-button-ghost">Neutral</button><input class="neo-input" value="Visible field"></section>'
    );
  });

  await expect.poll(async () => page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)).toBe(
    'rgb(241, 238, 236)'
  );

  for (const selector of ['#neumorphism-edge-fixture .neo-button-ghost', '#neumorphism-edge-fixture .neo-input']) {
    const evidence = await page.locator(selector).evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        background: style.backgroundColor,
        border: style.borderTopColor,
        borderStyle: style.borderTopStyle
      };
    });

    expect(evidence.borderStyle).toBe('solid');
    expect(evidence.border).not.toBe('rgba(0, 0, 0, 0)');
    expect(contrastRatio(evidence.border, evidence.background)).toBeGreaterThanOrEqual(3);
  }
});

test('Neumorphism role controls stay readable across every theme and mode', async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await loadNeumorphismSource(page);
  const themes = await page.locator('#themeSelect option').evaluateAll((options) => options.map((option) => option.value));
  await page.evaluate(() => {
    const stableStyles = document.createElement('style');
    stableStyles.textContent = '#neumorphism-role-fixture * { transition: none !important; }';
    document.head.append(stableStyles);
    const fixture = document.createElement('main');
    fixture.id = 'neumorphism-role-fixture';
    fixture.innerHTML = `
      <button class="neo-button">Neutral</button>
      <button class="neo-button neo-button-primary">Primary</button>
      <button class="neo-button neo-button-secondary">Secondary</button>
      <button class="neo-button neo-button-danger">Danger</button>
      <button class="neo-button neo-button-ghost">Ghost</button>
      <span class="neo-badge">Neutral</span>
      <span class="neo-badge neo-badge-primary">Primary</span>
      <span class="neo-badge neo-badge-secondary">Secondary</span>
      <span class="neo-badge neo-badge-success">Success</span>
      <span class="neo-badge neo-badge-warning">Warning</span>
      <span class="neo-badge neo-badge-danger">Danger</span>`;
    document.body.append(fixture);
  });

  for (const theme of themes) {
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.locator('body').evaluate((body, state) => {
        if (state.theme) body.dataset.theme = state.theme;
        else body.removeAttribute('data-theme');
        body.dataset.mode = state.mode;
      }, { theme, mode });
      const evidence = await page.locator('#neumorphism-role-fixture').evaluate((fixture) =>
        [...fixture.children].map((element) => {
          const style = getComputedStyle(element);
          return {
            label: element.textContent.trim(),
            classes: element.className,
            background: style.backgroundColor,
            color: style.color
          };
        })
      );

      for (const item of evidence) {
        expect(
          contrastRatio(item.color, item.background),
          `${theme}/${mode} ${item.classes} (${item.label}) foreground ${item.color} background ${item.background}`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test('Neumorphism applies the reference relief across component and native families', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await loadNeumorphismSource(page);
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.id = 'neumorphism-family-fixture';
    fixture.innerHTML = `
      <section class="neo-panel">
        <h2 class="neo-heading">Launch workspace</h2>
        <button class="neo-button neo-button-primary">Launch</button>
        <button class="neo-button neo-button-secondary">Save draft</button>
        <div class="neo-progress"><div class="neo-progress-bar"></div></div>
        <span class="neo-tooltip" role="tooltip">Configuration ready</span>
        <table class="neo-table"><tbody><tr><td>Region availability</td></tr></tbody></table>
        <fieldset>
          <legend>Native controls</legend>
          <input value="Acme Analytics">
          <button type="button">Validate</button>
          <input type="range" min="0" max="100" value="65">
          <progress value="65" max="100">65%</progress>
        </fieldset>
      </section>`;
    document.body.append(fixture);
  });

  const evidence = await page.locator('#neumorphism-family-fixture').evaluate((fixture) => {
    const read = (selector) => {
      const style = getComputedStyle(fixture.querySelector(selector));
      return {
        background: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        color: style.color,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        radius: style.borderRadius,
        shadow: style.boxShadow
      };
    };
    const range = getComputedStyle(fixture.querySelector('input[type="range"]'));
    const progress = getComputedStyle(fixture.querySelector('progress'));
    return {
      body: read('.neo-panel'),
      heading: read('.neo-heading'),
      primary: read('.neo-button-primary'),
      secondary: read('.neo-button-secondary'),
      progressTrack: read('.neo-progress'),
      progressValue: read('.neo-progress-bar'),
      tooltip: read('.neo-tooltip'),
      tableCell: read('.neo-table td'),
      fieldset: read('fieldset'),
      nativeInput: read('input:not([type])'),
      nativeButton: read('button:not([class])'),
      rangeTrackShadow: range.getPropertyValue('--usk-native-range-track-shadow').trim(),
      rangeThumbShadow: range.getPropertyValue('--usk-native-range-thumb-shadow').trim(),
      nativeProgressShadow: progress.getPropertyValue('--usk-native-progress-track-shadow').trim()
    };
  });

  expect(evidence.heading.fontFamily).toMatch(/^"?Trebuchet MS"?/);
  expect(Number(evidence.heading.fontWeight)).toBeLessThanOrEqual(700);
  expect(evidence.primary.backgroundImage).toContain('linear-gradient');
  expect(evidence.secondary.backgroundImage).toContain('linear-gradient');
  expect(evidence.primary.shadow).not.toContain('inset');
  expect(evidence.secondary.shadow).not.toContain('inset');
  expect(evidence.progressTrack.shadow).toContain('inset');
  expect(evidence.progressValue.shadow).not.toBe('none');
  expect(evidence.tooltip.shadow).not.toContain('inset');
  expect(evidence.tableCell.shadow).toContain('inset');
  expect(evidence.fieldset.shadow).not.toContain('inset');
  expect(evidence.nativeInput.shadow).toContain('inset');
  expect(evidence.nativeButton.background).toBe(evidence.body.background);
  expect(evidence.nativeButton.shadow).not.toContain('inset');
  expect(evidence.rangeTrackShadow).toContain('inset');
  expect(evidence.rangeThumbShadow).not.toContain('inset');
  expect(evidence.nativeProgressShadow).toContain('inset');
});

test('Neumorphism generated aliases preserve authored and native material behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await page.locator('main').evaluate((main) => {
    main.insertAdjacentHTML(
      'afterbegin',
      `<section id="neumorphism-alias-fixture">
        <article class="neo-card"><button class="neo-button neo-button-primary">Authored</button></article>
        <article class="ui-card"><button class="ui-button" data-ui-variant="primary">Generated</button></article>
        <span class="ui-badge" data-ui-variant="success">Ready</span>
        <input class="ui-input" value="Generated field">
        <input value="Native field">
      </section>`
    );
  });

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        background: style.backgroundColor,
        color: style.color,
        shadow: style.boxShadow
      };
    };
    return {
      body: read('body'),
      authoredCard: read('#neumorphism-alias-fixture .neo-card'),
      generatedCard: read('#neumorphism-alias-fixture .ui-card'),
      authoredButton: read('#neumorphism-alias-fixture .neo-button-primary'),
      generatedButton: read('#neumorphism-alias-fixture .ui-button'),
      generatedBadge: read('#neumorphism-alias-fixture .ui-badge'),
      generatedInput: read('#neumorphism-alias-fixture .ui-input'),
      nativeInput: read('#neumorphism-alias-fixture input:not([class])')
    };
  });

  expect(evidence.authoredCard.background).toBe(evidence.body.background);
  expect(evidence.generatedCard.background).toBe(evidence.authoredCard.background);
  expect(evidence.generatedCard.shadow).not.toContain('inset');
  expect(evidence.generatedButton.background).toBe(evidence.authoredButton.background);
  expect(contrastRatio(evidence.generatedButton.color, evidence.generatedButton.background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(evidence.generatedBadge.color, evidence.generatedBadge.background)).toBeGreaterThanOrEqual(4.5);
  expect(evidence.generatedInput.shadow).toContain('inset');
  expect(evidence.nativeInput.shadow).toContain('inset');
});

test('Neumorphism demo utilities and marketing surfaces share the reference material', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'neumorphism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await loadNeumorphismSource(page);
  await expect(page.getByTestId('utility-classes')).toBeVisible();
  await page.waitForTimeout(20);

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        background: style.backgroundColor,
        color: style.color,
        border: style.borderStyle,
        shadow: style.boxShadow,
        transition: style.transition,
        materialToken: style.getPropertyValue('--neo-material-raised').trim(),
        surfaceToken: style.getPropertyValue('--neo-surface').trim()
      };
    };
    return {
      body: read('body'),
      colorChip: read('.demo-color-chip'),
      shape: read('.demo-utility-shape'),
      insetSurface: read('.demo-utility-surface.neo-well'),
      primarySurface: read('.demo-utility-surface.neo-bg-primary'),
      featureStrip: read('.neo-feature-strip'),
      featureItem: read('.neo-feature-item'),
      callout: read('.neo-callout-bar'),
      seal: read('.neo-badge-seal')
    };
  });

  expect(
    evidence.colorChip.background,
    `material ${evidence.colorChip.materialToken}; surface ${evidence.colorChip.surfaceToken}`
  ).toBe(evidence.body.background);
  expect(evidence.colorChip.shadow).not.toBe('none');
  expect(evidence.colorChip.shadow).not.toContain('inset');
  expect(evidence.shape.background).toBe(evidence.body.background);
  expect(evidence.shape.shadow).not.toContain('inset');
  expect(evidence.insetSurface.background).not.toBe(evidence.body.background);
  expect(evidence.insetSurface.shadow).toContain('inset');
  expect(evidence.primarySurface.background).not.toBe(evidence.body.background);
  expect(contrastRatio(evidence.primarySurface.color, evidence.primarySurface.background)).toBeGreaterThanOrEqual(4.5);
  expect(evidence.featureStrip.background).toBe(evidence.body.background);
  expect(evidence.featureStrip.shadow).not.toContain('inset');
  expect(evidence.featureItem.background).not.toBe(evidence.body.background);
  expect(evidence.featureItem.shadow).toContain('inset');
  expect(evidence.callout.background).toBe(evidence.body.background);
  expect(evidence.callout.shadow).not.toContain('inset');
  expect(evidence.seal.background).toBe(evidence.body.background);
  expect(evidence.seal.shadow).not.toContain('inset');
});
