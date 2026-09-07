import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Reads the visible material treatment from representative Clay components.
 *
 * @param {import('@playwright/test').Page} page Active demo page.
 * @returns {Promise<Record<string, string>>} Computed Clay material evidence.
 */
async function readClayMaterialEvidence(page) {
  return page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    /**
     * Resolves modern CSS color functions to stable rendered RGB channels.
     *
     * @param {string} value Computed CSS color value.
     * @returns {string} Browser-rendered RGB color.
     */
    const pixelColor = (value) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return `rgb(${red}, ${green}, ${blue})`;
    };
    const body = styleFor('body');
    const panel = styleFor('.clay-panel');
    const button = styleFor('.clay-button');
    const primaryButton = styleFor('.clay-button-primary');
    const pressed = styleFor('.clay-button[aria-pressed="true"]');
    const input = styleFor('.clay-input');
    const nativeButton = styleFor('button:not([class])');
    const semanticCard = styleFor('.ui-card');
    const semanticButton = styleFor('.ui-button');
    const semanticInput = styleFor('.ui-input');

    return {
      bodyBackground: body.backgroundColor,
      panelBackground: panel.backgroundColor,
      panelClip: panel.clipPath,
      panelRadius: panel.borderRadius,
      panelShadow: panel.boxShadow,
      panelFilter: panel.filter,
      buttonClip: button.clipPath,
      buttonMinHeight: button.minHeight,
      buttonFontWeight: button.fontWeight,
      buttonBackgroundImage: button.backgroundImage,
      buttonTextShadow: button.textShadow,
      primaryButtonBackground: pixelColor(primaryButton.backgroundColor),
      pressedShadow: pressed.boxShadow,
      inputClip: input.clipPath,
      inputShadow: input.boxShadow,
      nativeButtonClip: nativeButton.clipPath,
      nativeButtonTextShadow: nativeButton.textShadow,
      semanticCardBackground: semanticCard.backgroundColor,
      semanticCardClip: semanticCard.clipPath,
      semanticButtonClip: semanticButton.clipPath,
      semanticButtonTextShadow: semanticButton.textShadow,
      semanticInputBackground: semanticInput.backgroundColor,
      semanticInputClip: semanticInput.clipPath
    };
  });
}

/** Selects the original mineral fallback independently of the shared color theme. */
async function useReferencePalette(page) {
  await page.locator('#themeSelect').evaluate((node) => node.add(new Option('Preset reference palette', 'reference-palette')));
  await page.selectOption('#themeSelect', 'reference-palette');
}

test('Clay recreates the reference material in light and dark modes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await useReferencePalette(page);
  await page.selectOption('#modeSelect', 'light');
  const demoSemanticCard = await page.locator('.ui-card').first().evaluate((card) => {
    const style = getComputedStyle(card);
    return {
      background: style.backgroundColor,
      clip: style.clipPath
    };
  });
  expect(demoSemanticCard.background).toBe('rgb(233, 226, 217)');
  expect(demoSemanticCard.clip).toContain('polygon(');
  await page.selectOption('#modeSelect', 'dark');
  await expect
    .poll(async () => page.locator('.ui-card').first().evaluate((card) => getComputedStyle(card).backgroundColor))
    .toBe('rgb(32, 35, 36)');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <section class="clay-panel">
        <button class="clay-button clay-button-primary">Button</button>
        <button class="clay-button" aria-pressed="true">Pressed</button>
        <input class="clay-input" value="Sculpted product studio">
        <button type="button">Native button</button>
      </section>
      <article class="ui-card">
        <button class="ui-button" data-ui-variant="primary">Semantic button</button>
        <input class="ui-input" value="Semantic field">
      </article>`;
    document.body.replaceChildren(fixture);
  });

  const light = await readClayMaterialEvidence(page);
  expect(light.bodyBackground).toBe('rgb(235, 228, 219)');
  expect(light.panelBackground).toBe('rgb(233, 226, 217)');
  expect(light.panelClip).toContain('polygon(');
  expect(light.panelRadius).toBe('10px 13px 11px 12px');
  expect(light.panelShadow).toContain('inset');
  expect(light.panelFilter).toBe('none');
  expect(light.panelClip.split(',')).toHaveLength(12);
  expect(light.buttonClip).toContain('polygon(');
  expect(light.buttonClip.split(',')).toHaveLength(18);
  expect(light.buttonMinHeight).toBe('32px');
  expect(light.buttonFontWeight).toBe('500');
  expect(light.buttonBackgroundImage).toContain('clay-grain.png');
  expect(light.buttonTextShadow).toContain('0px 1px 0px');
  expect(light.primaryButtonBackground).toBe('rgb(142, 113, 75)');
  expect(light.pressedShadow).toContain('inset');
  expect(light.inputClip).toContain('polygon(');
  expect(light.inputShadow).toContain('inset');
  expect(light.nativeButtonClip).toContain('polygon(');
  expect(light.nativeButtonTextShadow).not.toBe('none');
  expect(light.semanticCardBackground).toBe('rgb(233, 226, 217)');
  expect(light.semanticCardClip).toContain('polygon(');
  expect(light.semanticButtonClip).toContain('polygon(');
  expect(light.semanticButtonTextShadow).not.toBe('none');
  expect(light.semanticInputBackground).toBe('rgb(229, 222, 213)');
  expect(light.semanticInputClip).toContain('polygon(');

  await page.locator('body').evaluate((body) => {
    body.dataset.mode = 'dark';
  });
  await expect
    .poll(async () => (await readClayMaterialEvidence(page)).panelBackground)
    .toBe('rgb(32, 35, 36)');
  const dark = await readClayMaterialEvidence(page);
  expect(dark.bodyBackground).toBe('rgb(28, 30, 31)');
  expect(dark.panelBackground).toBe('rgb(32, 35, 36)');
  expect(dark.semanticCardBackground).toBe('rgb(32, 35, 36)');
  expect(dark.semanticInputBackground).toBe('rgb(24, 26, 27)');
  expect(dark.panelClip).toBe(light.panelClip);
  expect(dark.buttonTextShadow).not.toBe(light.buttonTextShadow);
});

/**
 * Reads the edge and foreground relief applied across the Clay component families.
 *
 * @param {import('@playwright/test').Page} page Active demo page.
 * @returns {Promise<Record<string, string>>} Computed molded-material evidence.
 */
async function readMoldedMaterialEvidence(page) {
  return page.evaluate(() => {
    const styleFor = (selector, pseudoElement) => {
      const element = document.querySelector(selector);
      return getComputedStyle(element, pseudoElement);
    };
    const tokenFor = (selector, propertyName) => styleFor(selector).getPropertyValue(propertyName).trim();

    return {
      headingTextShadow: styleFor('.clay-heading').textShadow,
      copyTextShadow: styleFor('.clay-copy').textShadow,
      labelTextShadow: styleFor('.clay-field > span').textShadow,
      inputTextShadow: styleFor('.clay-input').textShadow,
      badgeClip: styleFor('.clay-badge').clipPath,
      badgeShadow: styleFor('.clay-badge').boxShadow,
      progressClip: styleFor('.clay-progress').clipPath,
      progressShadow: styleFor('.clay-progress').boxShadow,
      progressValueClip: styleFor('.clay-progress-bar').clipPath,
      progressValueShadow: styleFor('.clay-progress-bar').boxShadow,
      tableCellClip: styleFor('.clay-table td').clipPath,
      tableCellShadow: styleFor('.clay-table td').boxShadow,
      tableCellTextShadow: styleFor('.clay-table td').textShadow,
      nativeFieldsetClip: styleFor('fieldset').clipPath,
      nativeFieldsetShadow: styleFor('fieldset').boxShadow,
      rangeTrackRadius: tokenFor('input[type="range"]', '--usk-native-range-track-radius'),
      rangeTrackShadow: tokenFor('input[type="range"]', '--usk-native-range-track-shadow'),
      rangeThumbMaterial: tokenFor('input[type="range"]', '--clay-thumb-material'),
      rangeThumbRadius: tokenFor('input[type="range"]', '--usk-native-range-thumb-radius'),
      rangeThumbShadow: tokenFor('input[type="range"]', '--usk-native-range-thumb-shadow'),
      nativeProgressRadius: tokenFor('progress', '--usk-native-progress-track-radius'),
      nativeProgressShadow: tokenFor('progress', '--usk-native-progress-track-shadow'),
      nativeProgressValueRadius: tokenFor('progress', '--usk-native-progress-value-radius'),
      nativeProgressValueShadow: tokenFor('progress', '--usk-native-progress-value-shadow')
    };
  });
}

test('Clay molds representative edges while keeping reading surfaces crisp', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await useReferencePalette(page);
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <section class="clay-panel">
        <h2 class="clay-heading">Hand-molded system</h2>
        <p class="clay-copy">Every foreground mark is pressed into its clay surface.</p>
        <label class="clay-field"><span>Studio name</span><input class="clay-input" value="Morrow Clay"></label>
        <span class="clay-badge clay-badge-primary">Formed badge</span>
        <div class="clay-progress" role="progressbar" aria-label="Molding progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72"><div class="clay-progress-bar"></div></div>
        <table class="clay-table"><tbody><tr><td>Pressed table content</td></tr></tbody></table>
        <fieldset>
          <legend>Native clay controls</legend>
          <label>Pressure <input type="range" min="0" max="100" value="58"></label>
          <progress value="72" max="100">72%</progress>
        </fieldset>
      </section>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await readMoldedMaterialEvidence(page);
  expect(evidence.headingTextShadow).not.toBe('none');
  expect(evidence.copyTextShadow).toBe('none');
  expect(evidence.labelTextShadow).toBe('none');
  expect(evidence.inputTextShadow).toBe('none');
  expect(evidence.badgeClip).toContain('polygon(');
  expect(evidence.badgeShadow).toContain('inset');
  expect(evidence.progressClip).toContain('polygon(');
  expect(evidence.progressShadow).toContain('inset');
  expect(evidence.progressValueClip).toContain('polygon(');
  expect(evidence.progressValueShadow).toContain('inset');
  expect(evidence.tableCellClip).toBe('none');
  expect(evidence.tableCellShadow).toContain('inset');
  expect(evidence.tableCellTextShadow).toBe('none');
  expect(evidence.nativeFieldsetClip).toContain('polygon(');
  expect(evidence.nativeFieldsetShadow).toContain('inset');
  expect(evidence.rangeTrackRadius.split(' ')).toHaveLength(4);
  expect(evidence.rangeTrackShadow).toContain('inset');
  expect(evidence.rangeThumbMaterial).toBe('#cec2b5');
  expect(evidence.rangeThumbRadius).toContain('/');
  expect(evidence.rangeThumbShadow).toContain('inset');
  expect(evidence.nativeProgressRadius.split(' ')).toHaveLength(4);
  expect(evidence.nativeProgressShadow).toContain('inset');
  expect(evidence.nativeProgressValueRadius.split(' ')).toHaveLength(4);
  expect(evidence.nativeProgressValueShadow).toContain('inset');
});

test('Clay loader is assembled from distinct mineral-colored beads', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = '<span class="clay-spinner" aria-label="Loading"></span>';
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.locator('.clay-spinner').evaluate((spinner) => {
    const spinnerStyle = getComputedStyle(spinner);
    const beadStyle = getComputedStyle(spinner, '::before');
    const beadShadow = beadStyle.boxShadow;
    let shadowDepth = 0;
    let beadShadowCount = beadShadow === 'none' ? 0 : 1;
    for (const character of beadShadow) {
      if (character === '(') shadowDepth += 1;
      if (character === ')') shadowDepth -= 1;
      if (character === ',' && shadowDepth === 0) beadShadowCount += 1;
    }
    return {
      spinnerBackground: spinnerStyle.backgroundImage,
      spinnerBorderWidth: spinnerStyle.borderWidth,
      beadContent: beadStyle.content,
      beadInlineSize: beadStyle.inlineSize,
      beadBlockSize: beadStyle.blockSize,
      beadRadius: beadStyle.borderRadius,
      beadShadow,
      beadShadowCount
    };
  });

  expect(evidence.spinnerBackground).toBe('none');
  expect(evidence.spinnerBorderWidth).toBe('0px');
  expect(evidence.beadContent).not.toBe('none');
  expect(parseFloat(evidence.beadInlineSize)).toBeGreaterThan(0);
  expect(evidence.beadInlineSize).toBe(evidence.beadBlockSize);
  expect(evidence.beadRadius).toContain('%');
  expect(evidence.beadShadowCount).toBeGreaterThanOrEqual(8);
});

test('Clay uses soft type and sculpted identity surfaces from the reference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await useReferencePalette(page);
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <section class="clay-panel">
        <button class="clay-button clay-button-primary">Button</button>
        <p class="clay-copy">Thoughtful tools for building products with clarity and craft.</p>
        <input class="clay-input" value="Sculpted product studio">
        <span class="clay-tooltip" role="tooltip">Every edge, depth, and seam serves a purpose.</span>
        <span class="clay-icon-medallion" aria-hidden="true">SP</span>
        <span class="clay-badge-seal">Sculpted product studio</span>
      </section>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const styleFor = (selector, pseudoElement) => getComputedStyle(document.querySelector(selector), pseudoElement);
    const body = styleFor('body');
    const button = styleFor('.clay-button');
    const copy = styleFor('.clay-copy');
    const input = styleFor('.clay-input');
    const tooltip = styleFor('.clay-tooltip');
    const medallion = styleFor('.clay-icon-medallion');
    const seal = styleFor('.clay-badge-seal');
    const sealRing = styleFor('.clay-badge-seal', '::before');
    return {
      bodyFont: body.fontFamily,
      bodyColor: body.color,
      buttonFont: button.fontFamily,
      copyColor: copy.color,
      inputBackground: input.backgroundColor,
      tooltipBackgroundImage: tooltip.backgroundImage,
      tooltipShadow: tooltip.boxShadow,
      tooltipFilter: tooltip.filter,
      tooltipTextShadow: tooltip.textShadow,
      medallionRadius: medallion.borderRadius,
      medallionClip: medallion.clipPath,
      medallionShadow: medallion.boxShadow,
      sealRadius: seal.borderRadius,
      sealTextShadow: seal.textShadow,
      sealRingContent: sealRing.content,
      sealRingBorder: sealRing.borderStyle
    };
  });

  expect(evidence.bodyFont).toContain('Segoe UI');
  expect(evidence.bodyColor).toBe('rgb(52, 49, 47)');
  expect(evidence.buttonFont).toMatch(/^"?Segoe UI"?/);
  expect(evidence.copyColor).toBe('rgb(110, 103, 95)');
  expect(evidence.inputBackground).toBe('rgb(229, 222, 213)');
  expect(evidence.tooltipBackgroundImage).toContain('radial-gradient');
  expect(evidence.tooltipShadow).toContain('inset');
  expect(evidence.tooltipFilter).toBe('none');
  expect(evidence.tooltipTextShadow).toBe('none');
  expect(evidence.medallionRadius).toContain('/');
  expect(evidence.medallionClip).toContain('ellipse(');
  expect(evidence.medallionShadow).toContain('inset');
  expect(evidence.sealRadius).toContain('%');
  expect(evidence.sealTextShadow).not.toBe('none');
  expect(evidence.sealRingContent).not.toBe('none');
  expect(evidence.sealRingBorder).toBe('solid');
});

test('Clay loading buttons use a compact ring of inset beads', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = '<button class="clay-button clay-button-primary" aria-busy="true">Loading</button>';
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.locator('.clay-button').evaluate((button) => {
    const spinner = getComputedStyle(button, '::after');
    return {
      content: spinner.content,
      backgroundImage: spinner.backgroundImage,
      borderWidth: spinner.borderWidth,
      inlineSize: spinner.inlineSize,
      blockSize: spinner.blockSize,
      filter: spinner.filter
    };
  });

  expect(evidence.content).not.toBe('none');
  expect(evidence.backgroundImage.match(/radial-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(8);
  expect(evidence.borderWidth).toBe('0px');
  expect(parseFloat(evidence.inlineSize)).toBeGreaterThan(0);
  expect(evidence.inlineSize).toBe(evidence.blockSize);
  expect(evidence.filter).toContain('drop-shadow');
});

test('Clay native tracks, fills, and knobs share the molded material recipe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <label>Pressure <input type="range" min="0" max="100" value="68"></label>
      <progress value="72" max="100">72%</progress>
      <meter min="0" max="100" value="64">64%</meter>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const tokens = getComputedStyle(document.querySelector('input[type="range"]'));
    return {
      track: tokens.getPropertyValue('--usk-native-range-track-background').trim(),
      thumb: tokens.getPropertyValue('--usk-native-range-thumb-background').trim(),
      progressTrack: tokens.getPropertyValue('--usk-native-progress-track-background').trim(),
      progressValue: tokens.getPropertyValue('--usk-native-progress-value-background').trim(),
      optimumValue: tokens.getPropertyValue('--usk-native-meter-optimum-background').trim()
    };
  });

  expect(evidence.track).toContain('clay-grain.png');
  expect(evidence.track).toContain('linear-gradient');
  expect(evidence.thumb).toContain('radial-gradient');
  expect(evidence.progressTrack).toContain('clay-grain.png');
  expect(evidence.progressValue).toContain('linear-gradient');
  expect(evidence.optimumValue).toContain('linear-gradient');
});

test('Clay painted controls retain grain, highlight, and lower-edge relief', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <span class="clay-badge clay-badge-primary">In progress</span>
      <nav class="clay-nav"><a class="clay-nav-link is-active" href="#active">Overview</a></nav>
      <label class="clay-check"><input type="checkbox" checked><span class="clay-check-control"></span>Checked</label>
      <label class="clay-switch"><input type="checkbox" checked><span class="clay-switch-track"><span class="clay-switch-thumb"></span></span></label>
      <span class="clay-icon-medallion">SP</span>
      <div class="clay-alert clay-alert-success">Saved</div>
      <div class="clay-progress"><div class="clay-progress-bar"></div></div>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const materialFor = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        image: style.backgroundImage,
        shadow: style.boxShadow,
        clip: style.clipPath
      };
    };
    return {
      badge: materialFor('.clay-badge'),
      activeNav: materialFor('.clay-nav-link'),
      check: materialFor('.clay-check-control'),
      switchTrack: materialFor('.clay-switch-track'),
      switchThumb: materialFor('.clay-switch-thumb'),
      medallion: materialFor('.clay-icon-medallion'),
      alert: materialFor('.clay-alert'),
      progressTrack: materialFor('.clay-progress'),
      progressValue: materialFor('.clay-progress-bar')
    };
  });

  for (const [name, material] of Object.entries(evidence)) {
    expect(material.image, `${name} grain and highlight`).toContain('clay-grain.png');
    expect(material.image, `${name} directional light`).toContain('linear-gradient');
    expect(material.shadow, `${name} relief`).not.toBe('none');
    expect(material.clip, `${name} molded edge`).toContain('polygon(');
  }
});

test('Clay form adornments remain visible while sharing the pressed material treatment', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <label>Selection <select class="clay-select"><option>Design systems</option></select></label>
      <label>Date <input type="date" value="2025-05-24"></label>
      <label>Number <input type="number" value="42"></label>
      <label>File <input type="file"></label>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const select = getComputedStyle(document.querySelector('select'));
    const date = getComputedStyle(document.querySelector('input[type="date"]'));
    return {
      selectBackgroundImage: select.backgroundImage,
      selectBackgroundPosition: select.backgroundPosition,
      selectTextShadow: select.textShadow,
      indicatorFilter: date.getPropertyValue('--usk-native-indicator-filter').trim()
    };
  });

  expect(evidence.selectBackgroundImage).toContain('clay-grain.png');
  expect(evidence.selectBackgroundImage.match(/linear-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  expect(evidence.selectBackgroundPosition).toContain('calc(100%');
  expect(evidence.selectTextShadow).toBe('none');
  expect(evidence.indicatorFilter).toBe('none');
});

test('Clay media, table, and tooltip edges carry the reference depth', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <div class="clay-card-media" aria-label="Clay media tile"></div>
      <div class="clay-table-wrap"><table class="clay-table"><tbody><tr><td>Research user needs</td><td><span class="clay-badge clay-badge-primary">In progress</span></td></tr></tbody></table></div>
      <span class="clay-tooltip" role="tooltip">Clay is intentional.<span class="clay-tooltip-arrow" aria-hidden="true"></span></span>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const media = styleFor('.clay-card-media');
    const tableWrap = styleFor('.clay-table-wrap');
    const cell = styleFor('.clay-table td');
    const tooltip = styleFor('.clay-tooltip');
    const arrow = styleFor('.clay-tooltip-arrow');
    return {
      mediaShadow: media.boxShadow,
      mediaFilter: media.filter,
      mediaClip: media.clipPath,
      tableShadow: tableWrap.boxShadow,
      cellBackgroundImage: cell.backgroundImage,
      cellTextShadow: cell.textShadow,
      tooltipBackground: tooltip.backgroundColor,
      arrowBackground: arrow.backgroundColor,
      arrowShadow: arrow.boxShadow,
      arrowClip: arrow.clipPath
    };
  });

  expect(evidence.mediaShadow).toContain('inset');
  expect(evidence.mediaFilter).toBe('none');
  expect(evidence.mediaClip).toContain('polygon(');
  expect(evidence.tableShadow).toContain('inset');
  expect(evidence.cellBackgroundImage).toContain('clay-grain.png');
  expect(evidence.cellTextShadow).toBe('none');
  expect(evidence.arrowBackground).toBe(evidence.tooltipBackground);
  expect(evidence.arrowShadow).not.toBe('none');
  expect(evidence.arrowClip).toContain('polygon(');
});

test('Clay vendor control rules survive browser parsing as separate molded parts', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  const clayBundle = await readFile(path.join(rootDir, 'dist', 'visual', 'clay.css'), 'utf8');
  await page.addStyleTag({ content: clayBundle });

  const evidence = await page.evaluate(() => {
    const rules = [];
    const visit = (ruleList) => {
      for (const rule of ruleList) {
        if ('cssRules' in rule) visit(rule.cssRules);
        if ('selectorText' in rule) rules.push(rule);
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        visit(sheet.cssRules);
      } catch {
        // Cross-origin demo dependencies are irrelevant to the local Clay bundle.
      }
    }
    const declarationsFor = (fragment) => rules
      .filter((rule) => rule.selectorText.includes(fragment))
      .map((rule) => ({
        selector: rule.selectorText,
        background: rule.style.background,
        clipPath: rule.style.clipPath,
        backgroundColor: rule.style.backgroundColor,
        backgroundImage: rule.style.backgroundImage,
        borderRadius: rule.style.borderRadius,
        boxShadow: rule.style.boxShadow,
        cssText: rule.style.cssText
      }));
    return {
      webkitTrack: declarationsFor('::-webkit-slider-runnable-track'),
      webkitThumb: declarationsFor('::-webkit-slider-thumb'),
      webkitProgressValue: declarationsFor('::-webkit-progress-value')
    };
  });

  const moldedRule = (rules) => rules.find(({ selector }) => selector.includes('[data-ui="clay"]'));
  expect(moldedRule(evidence.webkitTrack)?.clipPath).toContain('--clay-track-clip');
  const webkitThumb = evidence.webkitThumb.find(({ selector, backgroundColor }) =>
    selector.includes('[data-ui="clay"]') && backgroundColor.includes('--clay-thumb-material')
  );
  expect(webkitThumb?.backgroundColor).toContain('--clay-thumb-material');
  expect(webkitThumb?.backgroundImage).toContain('--clay-grain-image');
  expect(webkitThumb?.borderRadius).toContain('%');
  expect(webkitThumb?.boxShadow).toContain('--clay-filled-shadow');
  expect(moldedRule(evidence.webkitProgressValue)?.clipPath).toContain('--clay-value-clip');
});

/**
 * Protects the utility specimens and status indicators highlighted by the Clay reference crops.
 * These demo-only wrappers must inherit the same formed material as public Clay components.
 */
test('Clay utility specimens and status indicators use the complete molded material', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const materialFor = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        image: style.backgroundImage,
        shadow: style.boxShadow,
        clip: style.clipPath,
        filter: style.filter,
        radius: style.borderRadius
      };
    };
    const statusDot = getComputedStyle(document.querySelector('.clay-badge-success'), '::before');
    const swatch = getComputedStyle(document.querySelector('.demo-color-swatch'));
    const shapeLabel = getComputedStyle(document.querySelector('.demo-utility-shape span'));
    return {
      colorChip: materialFor('.demo-color-chip'),
      insetSurface: materialFor('.demo-utility-surface'),
      primarySurface: materialFor('.demo-utility-surface.clay-bg-primary'),
      shape: materialFor('.demo-utility-shape'),
      swatch: {
        image: swatch.backgroundImage,
        shadow: swatch.boxShadow,
        clip: swatch.clipPath
      },
      statusDot: {
        content: statusDot.content,
        image: statusDot.backgroundImage,
        shadow: statusDot.boxShadow,
        inlineSize: statusDot.inlineSize
      },
      shapeLabelWeight: shapeLabel.fontWeight
    };
  });

  for (const [name, material] of Object.entries({
    colorChip: evidence.colorChip,
    insetSurface: evidence.insetSurface,
    primarySurface: evidence.primarySurface,
    shape: evidence.shape
  })) {
    expect(material.image, `${name} clay grain`).toContain('clay-grain.png');
    expect(material.image, `${name} top light`).toContain('linear-gradient');
    expect(material.shadow, `${name} lower depth`).toContain('inset');
    expect(material.clip, `${name} imperfect edge`).toContain('polygon(');
    expect(material.filter, `${name} no stacked contact shadow`).toBe('none');
    expect(material.radius.split(' '), `${name} asymmetric corners`).toHaveLength(4);
  }
  expect(evidence.swatch.image).toContain('radial-gradient');
  expect(evidence.swatch.shadow).toContain('inset');
  expect(evidence.swatch.clip).toContain('polygon(');
  expect(evidence.statusDot.content).not.toBe('none');
  expect(evidence.statusDot.image).toContain('radial-gradient');
  expect(evidence.statusDot.shadow).toContain('inset');
  expect(parseFloat(evidence.statusDot.inlineSize)).toBeGreaterThan(0);
  expect(evidence.shapeLabelWeight).toBe('600');
});

/**
 * Keeps one readable type family with restrained weights and selectively impressed headings.
 */
test('Clay typography pairs rounded headings with readable system text', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <h2>Native rounded heading</h2>
      <h3 class="clay-heading">Classed rounded heading</h3>
      <label>Studio <input class="clay-input" value="Sculpted product studio"></label>
      <strong>Supporting emphasis</strong>
      <div class="clay-alert"><p class="clay-alert-title">Success</p></div>`;
    document.body.replaceChildren(fixture);
  });

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        family: style.fontFamily,
        weight: style.fontWeight,
        shadow: style.textShadow
      };
    };
    return {
      nativeHeading: read('h2'),
      classedHeading: read('.clay-heading'),
      label: read('label'),
      input: read('.clay-input'),
      strong: read('strong'),
      alertTitle: read('.clay-alert-title')
    };
  });

  expect(evidence.nativeHeading.family).toContain('Clay Rounded');
  expect(evidence.nativeHeading.weight).toBe('600');
  expect(evidence.classedHeading.family).toContain('Clay Rounded');
  expect(evidence.classedHeading.weight).toBe('600');
  expect(evidence.label.weight).toBe('500');
  expect(evidence.input.weight).toBe('400');
  expect(evidence.input.family).toContain('Segoe UI');
  expect(evidence.strong.weight).toBe('600');
  expect(evidence.alertTitle.weight).toBe('600');
  expect(evidence.nativeHeading.shadow).not.toBe('none');
  expect(evidence.classedHeading.shadow).not.toBe('none');
  for (const key of ['label', 'input', 'strong', 'alertTitle']) expect(evidence[key].shadow).toBe('none');
});
