import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Reads the rendered desktop-application material from representative Retro Glass components.
 *
 * @param {import('@playwright/test').Page} page Active demo page.
 * @returns {Promise<Record<string, string>>} Computed material evidence for the active mode.
 */
async function readRetroGlassMaterialEvidence(page) {
  return page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const body = styleFor('body');
    const toolbar = styleFor('.rg-toolbar');
    const nav = styleFor('.rg-nav');
    const activeNav = styleFor('.rg-nav-link[aria-current="page"]');
    const panel = styleFor('.rg-panel');
    const button = styleFor('.rg-button');
    const pressedButton = styleFor('.rg-button[aria-pressed="true"]');
    const input = styleFor('.rg-input');
    const progress = styleFor('.rg-progress');
    const progressBar = styleFor('.rg-progress-bar');
    const tableHeader = styleFor('.rg-table th');
    const dock = styleFor('.rg-callout-bar');

    return {
      bodyBackgroundColor: body.backgroundColor,
      bodyBackgroundImage: body.backgroundImage,
      bodyFontFamily: body.fontFamily,
      toolbarBackgroundImage: toolbar.backgroundImage,
      toolbarShadow: toolbar.boxShadow,
      navBackgroundImage: nav.backgroundImage,
      navRadius: nav.borderRadius,
      activeNavBackgroundImage: activeNav.backgroundImage,
      activeNavShadow: activeNav.boxShadow,
      panelBackgroundImage: panel.backgroundImage,
      panelRadius: panel.borderRadius,
      panelShadow: panel.boxShadow,
      buttonBackgroundImage: button.backgroundImage,
      buttonMinHeight: button.minHeight,
      buttonTextShadow: button.textShadow,
      pressedButtonShadow: pressedButton.boxShadow,
      inputBackgroundImage: input.backgroundImage,
      inputShadow: input.boxShadow,
      progressBackgroundImage: progress.backgroundImage,
      progressBarBackgroundImage: progressBar.backgroundImage,
      tableHeaderBackgroundImage: tableHeader.backgroundImage,
      dockBackgroundImage: dock.backgroundImage,
      dockColor: dock.color
    };
  });
}

test('Retro Glass recreates the brushed chrome application material in light and dark modes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retro-glass');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    const fixture = document.createElement('main');
    fixture.innerHTML = `
      <header class="rg-toolbar">Application chrome</header>
      <nav class="rg-nav" aria-label="Workspace">
        <a class="rg-nav-link" aria-current="page" href="#overview">Overview</a>
        <a class="rg-nav-link" href="#settings">Settings</a>
      </nav>
      <section class="rg-panel">
        <button class="rg-button">Neutral</button>
        <button class="rg-button" aria-pressed="true">Pressed</button>
        <input class="rg-input" value="Coastal Drive.mp4">
        <div class="rg-progress"><div class="rg-progress-bar"></div></div>
        <table class="rg-table"><thead><tr><th>Item</th></tr></thead></table>
      </section>
      <aside class="rg-callout-bar">Dock action</aside>`;
    document.body.replaceChildren(fixture);
  });

  const light = await readRetroGlassMaterialEvidence(page);
  expect(light.bodyBackgroundImage).toContain('repeating-linear-gradient');
  expect(light.bodyBackgroundImage).not.toContain('radial-gradient');
  expect(light.bodyFontFamily).toContain('DejaVu Sans');
  expect(light.toolbarBackgroundImage).toContain('repeating-linear-gradient');
  expect(light.toolbarShadow).toContain('inset');
  expect(light.navBackgroundImage).toBe('none');
  expect(parseFloat(light.navRadius)).toBeLessThanOrEqual(6);
  expect(light.activeNavBackgroundImage).toContain('linear-gradient');
  expect(light.activeNavShadow).toContain('inset');
  expect(light.panelBackgroundImage).toContain('linear-gradient');
  expect(parseFloat(light.panelRadius)).toBe(10);
  expect(light.panelShadow).toContain('inset');
  expect(light.buttonBackgroundImage).toContain('linear-gradient');
  expect(parseFloat(light.buttonMinHeight)).toBe(36);
  expect(light.buttonTextShadow).toBe('none');
  expect(light.pressedButtonShadow).toContain('inset');
  expect(light.inputBackgroundImage).toContain('linear-gradient');
  expect(light.inputShadow).toContain('inset');
  expect(light.progressBackgroundImage).toContain('linear-gradient');
  expect(light.progressBarBackgroundImage).toContain('repeating-linear-gradient');
  expect(light.tableHeaderBackgroundImage).toContain('linear-gradient');
  expect(light.dockBackgroundImage).toContain('linear-gradient');

  await page.locator('body').evaluate((body) => {
    body.dataset.mode = 'dark';
  });
  await expect
    .poll(async () => (await readRetroGlassMaterialEvidence(page)).bodyBackgroundColor)
    .not.toBe(light.bodyBackgroundColor);
  await expect
    .poll(async () => (await readRetroGlassMaterialEvidence(page)).dockColor)
    .not.toBe(light.dockColor);
  const dark = await readRetroGlassMaterialEvidence(page);
  expect(dark.bodyBackgroundImage).toContain('repeating-linear-gradient');
  expect(dark.bodyBackgroundImage).not.toContain('radial-gradient');
  expect(dark.panelBackgroundImage).toContain('linear-gradient');
  expect(dark.panelRadius).toBe(light.panelRadius);
  expect(dark.buttonTextShadow).toBe(light.buttonTextShadow);
  expect(dark.dockBackgroundImage).toContain('linear-gradient');
});

test('Retro Glass carries the application material through semantic and native controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retro-glass');
  await page.selectOption('#themeSelect', 'sunset-ember');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const materialFor = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        backgroundImage: style.backgroundImage,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        minHeight: style.minHeight,
        textShadow: style.textShadow
      };
    };

    return {
      prefixedCard: materialFor('.rg-card'),
      semanticCard: materialFor('.ui-card'),
      semanticToolbar: materialFor('.ui-toolbar'),
      semanticButton: materialFor('.ui-button'),
      semanticInput: materialFor('.ui-input'),
      semanticProgress: materialFor('.ui-progress'),
      semanticProgressBar: materialFor('.ui-progress-bar'),
      semanticTableHeader: materialFor('.ui-table th'),
      nativeFieldset: materialFor('[data-testid="native-forms"] fieldset'),
      nativeButton: materialFor('[data-testid="native-buttons"] button:not([class])'),
      nativeInput: materialFor('[data-testid="native-forms"] input[type="text"]'),
      nativeSelect: materialFor('[data-testid="native-forms"] select'),
      switchTrack: materialFor('.ui-switch-track'),
      switchThumb: materialFor('.ui-switch-thumb')
    };
  });

  expect(evidence.semanticCard.backgroundImage).toBe(evidence.prefixedCard.backgroundImage);
  expect(evidence.semanticCard.borderRadius).toBe(evidence.prefixedCard.borderRadius);
  expect(evidence.semanticCard.boxShadow).toContain('inset');
  expect(evidence.semanticToolbar.backgroundImage).toContain('repeating-linear-gradient');
  expect(evidence.semanticButton.backgroundImage).toContain('linear-gradient');
  expect(evidence.semanticButton.textShadow).toBe('none');
  expect(evidence.semanticInput.backgroundImage).toContain('linear-gradient');
  expect(evidence.semanticInput.boxShadow).toContain('inset');
  expect(evidence.semanticProgress.backgroundImage).toContain('linear-gradient');
  expect(evidence.semanticProgressBar.backgroundImage).toContain('repeating-linear-gradient');
  expect(evidence.semanticTableHeader.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeFieldset.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeFieldset.boxShadow).toContain('inset');
  expect(evidence.nativeButton.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeButton.textShadow).not.toBe('none');
  expect(parseFloat(evidence.nativeButton.minHeight)).toBeGreaterThanOrEqual(36);
  expect(evidence.nativeInput.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeInput.boxShadow).toContain('inset');
  expect(evidence.nativeSelect.backgroundImage).toContain('linear-gradient');
  expect(evidence.switchTrack.backgroundImage).toContain('linear-gradient');
  expect(evidence.switchTrack.boxShadow).toContain('inset');
  expect(evidence.switchThumb.backgroundImage).toContain('gradient');
  expect(evidence.switchThumb.boxShadow).toContain('inset');
});
