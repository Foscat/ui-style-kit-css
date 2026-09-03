import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { comparePngSnapshots } from '../scripts/visual-snapshot-comparator.mjs';
import { PRESET_IDENTITIES } from '../scripts/preset-identities.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '../demo/index.html')).href;

const styles = [
  'minimal-saas', 'bento', 'maximalist', 'bauhaus', 'tactile', 'neumorphism', 'retrofuturism',
  'brutalism', 'cyberpunk', 'y2k', 'retro-glass', 'editorial-luxe', 'organic-modern',
  'industrial-utility', 'technical-blueprint', 'art-deco', 'clay', 'data-terminal',
  'paper-editorial', 'neo-noir'
];
const modes = ['light', 'dark', 'contrast'];
const nativeIdentityViewports = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'mobile', width: 390, height: 844 }
];
const identityProfiles = Object.freeze(
  PRESET_IDENTITIES.map(({ id, prefix }) => Object.freeze({ id, prefix }))
);
const identityThemes = ['arctic-indigo', 'sunset-ember'];

/**
 * Creates a compact visual probe from the full native-control demo specimen.
 *
 * @param {import('@playwright/test').Page} page Playwright page rendering the demo.
 * @returns {Promise<import('@playwright/test').Locator>} Locator for the focused probe.
 */
async function createNativeIdentityProbe(page) {
  await page.evaluate(() => {
    const probe = document.createElement('div');
    const forms = document.querySelector('[data-testid="native-forms"]');
    const status = document.querySelector('[data-testid="native-meter-progress"]');

    probe.id = 'native-identity-visual-probe';
    probe.className = 'demo-native-grid';
    probe.style.padding = '1rem';
    probe.append(forms.cloneNode(true), status.cloneNode(true));
    document.body.replaceChildren(probe);
  });

  return page.locator('#native-identity-visual-probe');
}

/**
 * Replaces the demo with a fixed-viewport specimen spanning the shared component vocabulary.
 *
 * @param {import('@playwright/test').Page} page Playwright page rendering the demo.
 * @param {{prefix: string}} profile Preset-specific class profile.
 * @returns {Promise<void>} Resolves after the specimen is attached.
 */
async function createStyleIdentityProbe(page, profile) {
  await page.evaluate(({ prefix }) => {
    const probe = document.createElement('main');
    const className = (suffix) => `${prefix}-${suffix}`;

    probe.id = 'style-identity-visual-probe';
    probe.className = className('page');
    probe.style.cssText = [
      'box-sizing:border-box',
      'display:grid',
      'grid-template-columns:repeat(2,minmax(0,1fr))',
      'gap:1rem',
      'inline-size:100vw',
      'min-block-size:100vh',
      'padding:1rem',
      'overflow:hidden'
    ].join(';');
    probe.innerHTML = `
      <section class="${className('panel')} ${className('stack')}">
        <nav class="${className('nav')}" aria-label="Workspace">
          <a class="${className('nav-link')} is-active" aria-current="page" href="#">Overview</a>
          <a class="${className('nav-link')}" href="#">Settings</a>
        </nav>
        <h2 class="${className('heading')}">Workspace controls</h2>
        <label class="${className('field')}">
          <span class="${className('label')}">Workspace name</span>
          <input class="${className('input')}" value="Northfield Studio">
        </label>
        <label class="${className('field')}">
          <span class="${className('label')}">Invalid workspace</span>
          <input class="${className('input')}" value="Unavailable" aria-invalid="true">
        </label>
        <label class="${className('field')}">
          <span class="${className('label')}">Workspace identifier</span>
          <input class="${className('input')}" value="northfield-studio" readonly>
        </label>
        <label class="${className('field')}">
          <span class="${className('label')}">Region</span>
          <select class="${className('select')}"><option>North America</option></select>
        </label>
        <div class="${className('cluster')}">
          <button class="${className('button')} ${className('button-primary')}">Save workspace</button>
          <button class="${className('button')} ${className('button-secondary')}">Preview</button>
          <button class="${className('button')}">Neutral</button>
          <button class="${className('button')}" aria-pressed="true">Pressed</button>
          <button class="${className('button')}" aria-busy="true">Sync</button>
          <button class="${className('button')}" disabled>Disabled</button>
        </div>
        <div class="${className('cluster')}">
          <span class="${className('badge')} ${className('badge-success')}">Operational</span>
          <span class="${className('badge')} ${className('badge-warning')}">Review</span>
        </div>
        <div class="${className('progress')}"><div class="${className('progress-bar')}" style="width:68%"></div></div>
      </section>
      <section class="${className('panel')} ${className('stack')}">
        <div class="${className('card-service')}">
          <span class="${className('label')}">Monthly usage</span>
          <strong class="${className('heading')}">12.4K</strong>
        </div>
        <div class="${className('alert')} ${className('alert-danger')}">
          <strong class="${className('alert-title')}">Payment failed</strong>
          <p class="${className('alert-body')}">Choose another payment method.</p>
        </div>
        <div class="${className('table-wrap')}">
          <table class="${className('table')}">
            <thead><tr><th>Service</th><th>Status</th></tr></thead>
            <tbody><tr><td>API gateway</td><td>Active</td></tr><tr><td>Analytics</td><td>Review</td></tr></tbody>
          </table>
        </div>
        <fieldset>
          <legend>Native controls</legend>
          <label>Capacity <input type="range" min="0" max="100" value="72"></label>
          <label>Access <select><option>Team only</option></select></label>
          <progress max="100" value="68">68%</progress>
        </fieldset>
      </section>
      <section class="${className('feature-strip')}" style="grid-column:1/-1">
        <article class="${className('feature-item')}"><strong>Realtime</strong><small>Operational</small></article>
        <article class="${className('feature-item')}"><strong>Backups</strong><small>Protected</small></article>
        <article class="${className('feature-item')}"><strong>Regions</strong><small>Three active</small></article>
      </section>
      <aside class="${className('callout-bar')}" style="grid-column:1/-1">
        <strong>Launch readiness</strong><span>Six of eight checks complete.</span>
        <button class="${className('button')} ${className('button-primary')}">Review checks</button>
      </aside>`;

    const mediaQuery = window.matchMedia('(max-width: 600px)');
    if (mediaQuery.matches) probe.style.gridTemplateColumns = '1fr';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.replaceChildren(probe);
  }, profile);
}

/**
 * Captures the same fixed specimen for a preset at the active viewport.
 *
 * @param {import('@playwright/test').Page} page Playwright page used for the capture.
 * @param {{id: string, prefix: string}} profile Preset identity profile.
 * @returns {Promise<Buffer>} Viewport screenshot buffer.
 */
async function captureStyleIdentity(page, profile) {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', profile.id);
  await page.selectOption('#modeSelect', 'light');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await createStyleIdentityProbe(page, profile);
  return page.screenshot({ animations: 'disabled', caret: 'hide' });
}

/**
 * Captures the native-control specimen inside a stable viewport canvas.
 *
 * @param {import('@playwright/test').Page} page Playwright page used for the capture.
 * @param {{id: string}} profile Preset identity profile.
 * @returns {Promise<Buffer>} Viewport screenshot buffer.
 */
async function captureNativeIdentity(page, profile) {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', profile.id);
  await page.selectOption('#modeSelect', 'light');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await createNativeIdentityProbe(page);
  return page.screenshot({ animations: 'disabled', caret: 'hide' });
}

/**
 * Capture the computed component identity for one theme and accessibility mode.
 *
 * @param {import('@playwright/test').Page} page Playwright page used for the inspection.
 * @param {{id: string, prefix: string}} profile Preset identity profile.
 * @param {string} theme Public theme identifier.
 * @param {string} mode Public mode identifier.
 * @returns {Promise<Record<string, string>>} Stable rendered identity fingerprint.
 */
async function computedStyleIdentity(page, profile, theme, mode) {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', profile.id);
  await page.selectOption('#modeSelect', mode);
  await page.selectOption('#themeSelect', theme);
  await createStyleIdentityProbe(page, profile);

  return page.evaluate(({ prefix }) => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const panel = styleFor(`.${prefix}-panel`);
    const button = styleFor(`.${prefix}-button-primary`);
    const input = styleFor(`.${prefix}-input`);
    const alert = styleFor(`.${prefix}-alert`);
    const title = styleFor(`.${prefix}-heading`);
    const label = styleFor(`.${prefix}-label`);
    const progress = styleFor(`.${prefix}-progress`);
    const tableHeader = styleFor(`.${prefix}-table th`);
    const fieldset = styleFor('fieldset');

    return {
      panelBackground: panel.backgroundImage,
      panelRadius: panel.borderRadius,
      panelShadow: panel.boxShadow,
      titleFont: title.fontFamily,
      titleWeight: title.fontWeight,
      labelTransform: label.textTransform,
      labelTracking: label.letterSpacing,
      buttonHeight: button.minHeight,
      buttonFont: button.fontFamily,
      buttonWeight: button.fontWeight,
      buttonPaint: `${button.backgroundColor}|${button.backgroundImage}`,
      inputHeight: input.minHeight,
      inputRadius: input.borderRadius,
      inputShadow: input.boxShadow,
      alertBackground: alert.backgroundImage,
      alertRadius: alert.borderRadius,
      alertBorder: alert.borderLeftWidth,
      progressHeight: progress.height,
      progressShadow: progress.boxShadow,
      tableHeaderBackground: tableHeader.backgroundColor,
      tableHeaderShadow: tableHeader.boxShadow,
      tableCellPadding: tableHeader.padding,
      nativeRadius: fieldset.borderRadius,
      nativeShadow: fieldset.boxShadow
    };
  }, profile);
}

test.describe('UI Style Kit visual smoke renders', () => {
  for (const ui of styles) {
    for (const mode of modes) {
      test(`${ui} / ${mode}`, async ({ page }) => {
        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', ui);
        await page.selectOption('#modeSelect', mode);
        await page.selectOption('#themeSelect', 'arctic-indigo');

        await expect(page.locator('body')).toHaveAttribute('data-ui', ui);
        await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
        await expect(page.locator('main')).toBeVisible();

        const mainBox = await page.locator('main').boundingBox();
        expect(mainBox?.width ?? 0).toBeGreaterThan(300);
        expect(mainBox?.height ?? 0).toBeGreaterThan(300);

        const screenshot = await page.locator('main').screenshot();
        expect(screenshot.byteLength).toBeGreaterThan(10_000);
      });
    }
  }
});

/**
 * Compares two equal-size captures using the identity color threshold.
 *
 * @param {Buffer} actual First rendered specimen.
 * @param {Buffer} expected Second rendered specimen.
 * @returns {ReturnType<typeof comparePngSnapshots>} Pixel comparison result.
 */
function compareIdentityCaptures(actual, expected) {
  return comparePngSnapshots(actual, expected, {
    colorThreshold: 0.05,
    includeAntialiasing: false,
    maxDiffPixels: 0,
    maxDiffPixelRatio: 1
  });
}

test.describe('all-preset fixed identity baselines', () => {
  for (const profile of identityProfiles) {
    for (const viewport of nativeIdentityViewports) {
      test(`${profile.id} / ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', profile.id);
        await page.selectOption('#modeSelect', 'light');
        await page.selectOption('#themeSelect', 'arctic-indigo');

        const probe = await createNativeIdentityProbe(page);
        await expect(probe).toHaveScreenshot(`native-controls-${profile.id}-${viewport.name}.png`, {
          animations: 'disabled',
          caret: 'hide'
        });

        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', profile.id);
        await page.selectOption('#modeSelect', 'light');
        await page.selectOption('#themeSelect', 'arctic-indigo');
        await createStyleIdentityProbe(page, profile);
        await expect(page.locator('#style-identity-visual-probe')).toHaveScreenshot(
          `component-identity-${profile.id}-${viewport.name}.png`,
          { animations: 'disabled', caret: 'hide' }
        );
      });
    }
  }
});

test.describe('all-preset cross-preset visual separation', () => {
  for (const viewport of nativeIdentityViewports) {
    for (let leftIndex = 0; leftIndex < identityProfiles.length; leftIndex += 1) {
      const left = identityProfiles[leftIndex];

      for (const right of identityProfiles.slice(leftIndex + 1)) {
        test(`${viewport.name} component / ${left.id} vs ${right.id}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          const leftCapture = await captureStyleIdentity(page, left);
          const rightCapture = await captureStyleIdentity(page, right);
          const comparison = compareIdentityCaptures(leftCapture, rightCapture);

          expect(comparison.reason, `${left.id} and ${right.id}`).not.toBe('dimension-mismatch');
          expect(comparison.diffRatio, `${left.id} and ${right.id}`).toBeGreaterThanOrEqual(0.2);
        });

        test(`${viewport.name} native / ${left.id} vs ${right.id}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          const leftCapture = await captureNativeIdentity(page, left);
          const rightCapture = await captureNativeIdentity(page, right);
          const comparison = compareIdentityCaptures(leftCapture, rightCapture);

          expect(comparison.reason, `${left.id} and ${right.id}`).not.toBe('dimension-mismatch');
          expect(comparison.diffRatio, `${left.id} and ${right.id}`).toBeGreaterThanOrEqual(0.1);
        });
      }
    }
  }
});

test.describe('all-preset identity stability and interaction states', () => {
  for (const profile of identityProfiles) {
    test(`${profile.id} keeps stable geometry while semantic paint switches`, async ({ page }) => {
      const paint = new Map();
      const stableGeometry = new Map();

      for (const mode of modes) {
        for (const theme of identityThemes) {
          const identity = await computedStyleIdentity(page, profile, theme, mode);

          paint.set(`${mode}-${theme}`, identity.buttonPaint);
          stableGeometry.set(`${mode}-${theme}`, [
            identity.panelRadius,
            identity.titleFont,
            identity.titleWeight,
            identity.labelTransform,
            identity.labelTracking,
            identity.inputRadius,
            identity.alertRadius,
            identity.progressHeight,
            identity.tableCellPadding,
            identity.nativeRadius
          ]);
        }
      }

      for (const mode of modes) {
        expect(paint.get(`${mode}-arctic-indigo`), `${profile.id} ${mode} button paint must follow the semantic theme`)
          .not.toBe(paint.get(`${mode}-sunset-ember`));
        expect(stableGeometry.get(`${mode}-arctic-indigo`), `${profile.id} ${mode} geometry must remain stable across themes`)
          .toEqual(stableGeometry.get(`${mode}-sunset-ember`));
      }
    });

    for (const viewport of nativeIdentityViewports) {
      test(`${profile.id} / ${viewport.name} states remain accessible and contained`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', profile.id);
        await page.selectOption('#modeSelect', 'light');
        await page.selectOption('#themeSelect', 'arctic-indigo');
        await createStyleIdentityProbe(page, profile);
        await page.mouse.move(0, 0);

        const primary = page.locator(`.${profile.prefix}-button-primary`).first();
        const input = page.locator(`.${profile.prefix}-input`).first();
        const invalid = page.locator(`.${profile.prefix}-input[aria-invalid="true"]`);
        const readOnly = page.locator(`.${profile.prefix}-input[readonly]`);
        const disabled = page.locator(`.${profile.prefix}-button:disabled`);
        const busy = page.locator(`.${profile.prefix}-button[aria-busy="true"]`);
        const neutral = page.getByRole('button', { name: 'Neutral' });
        const pressed = page.locator(`.${profile.prefix}-button[aria-pressed="true"]`);
        const restingPrimary = await primary.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.boxShadow, style.transform];
        });
        const restingInputShadow = await input.evaluate((element) => getComputedStyle(element).boxShadow);
        const restingInputSurface = await input.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.backgroundImage, style.borderColor, style.opacity];
        });
        const restingPressedShadow = await neutral.evaluate((element) => getComputedStyle(element).boxShadow);

        if (viewport.name === 'desktop') {
          await primary.hover();
          await page.waitForTimeout(20);
          expect(await primary.evaluate((element) => {
            const style = getComputedStyle(element);
            return [style.backgroundColor, style.boxShadow, style.transform];
          }), `${profile.id} / ${viewport.name} hover state`).not.toEqual(restingPrimary);
        }
        await input.focus();
        expect(await input.evaluate((element) => getComputedStyle(element).boxShadow), `${profile.id} / ${viewport.name} focus state`).not.toBe(restingInputShadow);
        expect(await pressed.evaluate((element) => getComputedStyle(element).boxShadow), `${profile.id} / ${viewport.name} pressed state`).not.toBe(restingPressedShadow);
        expect(Number(await disabled.evaluate((element) => getComputedStyle(element).opacity)), `${profile.id} / ${viewport.name} disabled state`).toBeLessThan(1);
        expect(await invalid.evaluate((element) => getComputedStyle(element).borderColor), `${profile.id} / ${viewport.name} invalid state`)
          .not.toBe(restingInputSurface[2]);
        expect(await readOnly.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.backgroundImage, style.borderColor, style.opacity];
        }), `${profile.id} / ${viewport.name} read-only state`).not.toEqual(restingInputSurface);
        expect(await busy.evaluate((element) => getComputedStyle(element, '::after').content), `${profile.id} / ${viewport.name} busy state`).not.toBe('none');
        expect(await primary.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)), `${profile.id} / ${viewport.name} reduced-motion state`).toBeLessThanOrEqual(0.001);

        const overflow = await page.locator('#style-identity-visual-probe').evaluate((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
      });
    }

    test(`${profile.id} remains usable in RTL forced colors at two-hundred-percent zoom`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      await page.goto(demoUrl);
      await page.selectOption('#uiSelect', profile.id);
      await page.selectOption('#modeSelect', 'contrast');
      await page.selectOption('#themeSelect', 'sunset-ember');
      await createStyleIdentityProbe(page, profile);
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl';
        document.documentElement.style.fontSize = '200%';
      });

      await expect(page.locator(`.${profile.prefix}-button-primary`).first()).toBeVisible();
      await expect(page.locator(`.${profile.prefix}-input`).first()).toBeVisible();

      const overflow = await page.locator('#style-identity-visual-probe').evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const overflowers = [...element.querySelectorAll('*')]
          .map((candidate) => ({
            className: candidate.className,
            tag: candidate.tagName.toLowerCase(),
            rect: candidate.getBoundingClientRect().toJSON(),
            clientWidth: candidate.clientWidth,
            scrollWidth: candidate.scrollWidth
          }))
          .filter(({ rect, clientWidth, scrollWidth }) => (
            rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || scrollWidth > clientWidth + 1
          ))
          .slice(0, 8);

        return {
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          overflowers
        };
      });
      expect(
        overflow.scrollWidth,
        `${profile.id} should remain horizontally contained in RTL forced-colors at 200% text zoom: ${JSON.stringify(overflow, null, 2)}`
      ).toBeLessThanOrEqual(overflow.clientWidth);
    });
  }
});
