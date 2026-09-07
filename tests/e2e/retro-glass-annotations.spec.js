import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const demoUrl = pathToFileURL(path.resolve('index.html')).href + '?view=reference';
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const evidenceDir = path.join(os.tmpdir(), 'usk-retro-glass-annotations');
fs.mkdirSync(evidenceDir, { recursive: true });

/** Opens the annotated preset/theme/viewport against the actual generated bundle. */
async function openAnnotations(page, mode = 'light') {
  await page.setViewportSize({ width: 857, height: 610 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retro-glass');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', mode);
}

/** Captures an annotation region without the sticky toolbar covering its contents. */
async function capture(locator, name) {
  await locator.screenshot({ path: path.join(evidenceDir, `${name}.png`),
    style: '.demo-controls { visibility: hidden; }' });
}

test('Retro Glass annotation loaders share circular tracks across all APIs', async ({ page }) => {
  await openAnnotations(page);
  const evidence = await page.evaluate(() => {
    const standalone = [...document.querySelectorAll('.rg-spinner, .rg-loading-spinner, .ui-spinner, .loading-spinner, [data-loading-spinner]')];
    const busy = [...document.querySelectorAll('.rg-button[aria-busy="true"], [data-testid="native-buttons"] button[aria-busy="true"]')];
    return [...standalone.map((node) => [node, null]), ...busy.map((node) => [node, '::after'])].map(([node, pseudo]) => {
      const css = getComputedStyle(node, pseudo);
      return { label: node.getAttribute('aria-label') || node.textContent.trim() || node.className,
        width: css.width, height: css.height, radius: css.borderRadius, paint: css.backgroundImage,
        shadow: css.boxShadow, top: css.borderTopColor, right: css.borderRightColor,
        bottom: css.borderBottomColor, shrink: css.flexShrink, animation: css.animationName };
    });
  });
  expect(evidence.length).toBeGreaterThan(10);
  for (const item of evidence) {
    expect.soft(item.width, item.label).toBe(item.height);
    expect.soft(item.radius, item.label).toBe('50%');
    expect.soft(item.paint, item.label).toBe('none');
    expect.soft(item.shadow, item.label).toBe('none');
    expect.soft(item.right, item.label).not.toBe('rgba(0, 0, 0, 0)');
    expect.soft(item.bottom, item.label).not.toBe('rgba(0, 0, 0, 0)');
    expect.soft(item.shrink, item.label).toBe('0');
    expect.soft(item.animation, item.label).toBe('rg-spin');
  }
  await capture(page.getByTestId('retro-glass-specimen-action-states'), 'loaders');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.ui-spinner').first()).toHaveCSS('animation-name', 'none');
});

for (const mode of ['light', 'dark', 'contrast']) {
  test(`Retro Glass ${mode} annotated CTA and seal keep readable foregrounds`, async ({ page }) => {
    await openAnnotations(page, mode);
    const cta = page.getByTestId('marketing-primary-cta');
    const seal = page.locator('.rg-badge-seal').first();
    const inspect = async () => {
      const evidence = await page.evaluate(() => {
        const cta = document.querySelector('[data-testid="marketing-primary-cta"]');
        const seal = document.querySelector('.rg-badge-seal');
        const button = document.querySelector('.rg-button-primary:not(a)');
        return { cta: getComputedStyle(cta).color, button: getComputedStyle(button).color,
          seal: getComputedStyle(seal).color, children: [...seal.children].map((node) => getComputedStyle(node).color) };
      });
      expect(evidence.cta).toBe(evidence.button);
      expect(evidence.children).toEqual([evidence.seal, evidence.seal]);
      const audit = await new AxeBuilder({ page }).include('[data-testid="marketing-primary-cta"]').include('.rg-badge-seal').analyze();
      expect(audit.violations).toEqual([]);
    };
    await inspect();
    await cta.hover();
    await inspect();
    await cta.focus();
    await expect(cta).toHaveCSS('outline-style', 'solid');
    await capture(cta, `cta-${mode}`);
    await capture(seal, `seal-${mode}`);
    await page.getByRole('button', { name: 'Use reference palette' }).click();
    await inspect();
  });
}

test('Retro Glass disabled choices remain visible and unambiguously off', async ({ page }) => {
  await openAnnotations(page);
  const disabled = page.getByTestId('retro-glass-specimen-choices-tags').locator('.rg-choice').filter({ hasText: 'Disabled off' });
  await expect(disabled).toHaveCSS('opacity', '1');
  await expect(disabled.locator('input')).toHaveCSS('opacity', '1');
  await expect(disabled.locator('input')).toHaveCSS('border-style', 'dashed');
  await expect(disabled.locator('input')).not.toBeChecked();
  await expect(disabled.locator('input')).toBeDisabled();
  await capture(page.getByTestId('retro-glass-specimen-choices-tags'), 'disabled-choices');
});

test('Retro Glass native samples do not leave a tall empty neighboring column', async ({ page }) => {
  await openAnnotations(page);
  const grid = page.locator('.demo-native-grid');
  const gaps = await grid.evaluate((root) => [...root.children].slice(1).map((node, index) => {
    const previous = root.children[index].getBoundingClientRect();
    const next = node.getBoundingClientRect();
    return { gap: next.top - previous.bottom, width: next.width, gridWidth: root.getBoundingClientRect().width };
  }));
  for (const item of gaps) {
    expect.soft(item.gap).toBeGreaterThanOrEqual(0);
    expect.soft(item.gap).toBeLessThanOrEqual(32);
    expect.soft(item.width / item.gridWidth).toBeGreaterThan(.95);
  }
  await capture(page.getByTestId('native-forms'), 'native-forms');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('all preset semantic settings icons have a stable legible size', async ({ page }) => {
  await page.goto(demoUrl);
  for (const { id } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    const control = page.getByRole('button', { name: 'Semantic settings', exact: true });
    const icon = control.locator('svg');
    await expect(icon, id).toBeVisible();
    const [bounds, glyph] = await Promise.all([control.boundingBox(), icon.boundingBox()]);
    expect(glyph.width, id).toBeGreaterThanOrEqual(24);
    expect(glyph.height, id).toBeGreaterThanOrEqual(23.9);
    expect(glyph.width, id).toBeLessThan(bounds.width);
    expect(glyph.height, id).toBeLessThan(bounds.height);
    expect(Math.abs(glyph.x + glyph.width / 2 - bounds.x - bounds.width / 2), id).toBeLessThanOrEqual(1);
  }
});

test('Retro Glass marketing icons have stronger visual weight', async ({ page }) => {
  await openAnnotations(page);
  const star = page.locator('.rg-card-service > .rg-icon-medallion');
  expect(await star.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(32);
  const check = page.locator('.rg-feature-item > .rg-icon-medallion').first().locator('svg');
  await expect(check).toBeVisible();
  expect(await check.evaluate((node) => parseFloat(getComputedStyle(node).strokeWidth))).toBeGreaterThanOrEqual(3);
  await capture(page.locator('.rg-feature-strip'), 'feature-icons');
});

test('Retro Glass badges use saturated glossy material instead of pastel washes', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const badges = page.locator([
    '[data-semantic-node="badge-success"]',
    '[data-semantic-node="badge-warning"]',
    '.demo-rg-data-footer .rg-badge-primary',
    '.demo-rg-data-footer .rg-badge-success',
    '.demo-rg-data-footer .rg-badge-warning',
    '.demo-rg-data-footer .rg-badge-danger'
  ].join(','));
  await expect(badges).toHaveCount(6);
  const materials = await badges.evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return {
      label: node.textContent.trim(),
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow
    };
  }));
  for (const material of materials) {
    expect.soft(material.backgroundColor, material.label).toBe(material.borderColor);
    expect.soft(material.backgroundImage, material.label).toContain('linear-gradient');
    expect.soft(material.boxShadow, material.label).toContain('inset');
  }
});

test('Retro Glass semantic alert copy is vertically centered', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const centers = await page.locator('[data-semantic-node="alert"]').evaluate((alert) => {
    const body = alert.querySelector('[data-semantic-node="alert-body"]');
    const alertBounds = alert.getBoundingClientRect();
    const bodyBounds = body.getBoundingClientRect();
    return {
      alert: alertBounds.top + alertBounds.height / 2,
      body: bodyBounds.top + bodyBounds.height / 2
    };
  });
  expect(Math.abs(centers.alert - centers.body)).toBeLessThanOrEqual(1);
});

test('Retro Glass icon and text example presents a concrete settings action', async ({ page }) => {
  await openAnnotations(page);
  const action = page.getByTestId('retro-glass-specimen-action-states')
    .getByRole('button', { name: 'Open settings', exact: true });
  await expect(action).toContainText('Settings');
  await expect(action.locator('svg')).toBeVisible();
  await expect(action.locator('[aria-hidden="true"]')).toHaveAttribute('class', /demo-rg-icon/);
});

test('Retro Glass density choices explain distinct selected, available, focus and disabled states', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const group = page.getByRole('radiogroup', { name: 'Workspace density' });
  await expect(group).toContainText('Workspace density');
  const selected = group.getByRole('radio', { name: 'Compact', exact: true });
  const available = group.getByRole('radio', { name: 'Comfortable', exact: true });
  const focusExample = group.getByRole('radio', { name: 'Spacious', exact: true });
  await expect(selected).toBeChecked();
  await expect(selected.locator('..')).toContainText('Compact — selected');
  await expect(available).not.toBeChecked();
  await expect(available.locator('..')).toContainText('Comfortable — available');
  await expect(focusExample).toHaveCSS('outline-style', 'solid');
  await expect(focusExample.locator('..')).toContainText('Spacious — keyboard focus');
  const disabled = group.getByRole('radio', { name: 'Locked', exact: true });
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator('..')).toContainText('Locked — disabled');
});

test('Retro Glass switch examples distinguish enabled on from disabled on', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const board = page.getByTestId('retro-glass-specimen-choices-tags');
  const enabledOn = board.getByRole('switch', { name: 'Wi-Fi', exact: true });
  const disabledOn = board.getByRole('switch', { name: 'Auto sync', exact: true });
  await expect(enabledOn).toBeChecked();
  await expect(enabledOn).toBeEnabled();
  await expect(disabledOn).toBeChecked();
  await expect(disabledOn).toBeDisabled();
  await expect(enabledOn.locator('..')).toContainText('Wi-Fi — on');
  await expect(disabledOn.locator('..')).toContainText('Auto sync — disabled on');
  const [enabledMaterial, disabledMaterial] = await Promise.all([enabledOn, disabledOn].map((control) =>
    control.locator('xpath=following-sibling::*[contains(@class,"rg-switch-track")]').evaluate((track) => {
      const style = getComputedStyle(track);
      return { background: style.background, borderStyle: style.borderStyle };
    })));
  expect(disabledMaterial.borderStyle).toBe('dashed');
  expect(disabledMaterial.background).not.toBe(enabledMaterial.background);
});

test('Retro Glass stepper connector crosses the center of every status circle', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const alignment = await page.locator('.rg-stepper').evaluate((stepper) => {
    const root = stepper.getBoundingClientRect();
    const connector = getComputedStyle(stepper, '::before');
    const connectorCenter = parseFloat(connector.top) + parseFloat(connector.height) / 2;
    const circleCenters = [...stepper.querySelectorAll('.rg-step b')].map((circle) => {
      const bounds = circle.getBoundingClientRect();
      return bounds.top - root.top + bounds.height / 2;
    });
    return { connectorCenter, circleCenters };
  });
  for (const circleCenter of alignment.circleCenters) {
    expect.soft(Math.abs(alignment.connectorCenter - circleCenter)).toBeLessThanOrEqual(1);
  }
});

test('Retro Glass alert icons use their semantic status color', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const colors = await page.getByTestId('retro-glass-specimen-alerts-loading')
    .locator('.rg-alert').evaluateAll((alerts) => alerts.map((alert) => ({
      label: alert.textContent.trim(),
      border: getComputedStyle(alert).borderColor,
      icon: getComputedStyle(alert.querySelector('[aria-hidden="true"]')).color
    })));
  expect(colors).toHaveLength(4);
  for (const color of colors) {
    expect.soft(color.icon, color.label).toBe(color.border);
  }
});

test('Retro Glass toast icon is vertically centered with the message surface', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const centers = await page.locator('.rg-toast').evaluate((toast) => {
    const icon = toast.querySelector('[aria-hidden="true"]');
    const toastBounds = toast.getBoundingClientRect();
    const iconBounds = icon.getBoundingClientRect();
    return {
      toast: toastBounds.top + toastBounds.height / 2,
      icon: iconBounds.top + iconBounds.height / 2
    };
  });
  expect(Math.abs(centers.toast - centers.icon)).toBeLessThanOrEqual(1);
});

test('Retro Glass trust seal uses readable compact display type', async ({ page }) => {
  await openAnnotations(page);
  await page.setViewportSize({ width: 602, height: 792 });
  const sizes = await page.locator('.rg-badge-seal').first().evaluate((seal) => ({
    value: parseFloat(getComputedStyle(seal.querySelector('strong')).fontSize),
    unit: parseFloat(getComputedStyle(seal.querySelector('small')).fontSize)
  }));
  expect(sizes.value).toBeGreaterThanOrEqual(12);
  expect(sizes.unit).toBeGreaterThanOrEqual(10);
});

test('Retro Glass annotated surfaces stay usable after theme and viewport changes', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  let scanningAccessibility = false;
  /** Identifies delayed axe stylesheet diagnostics that WebKit emits for local file URLs. */
  const isScannerCorsDiagnostic = (text) => text.includes('access control checks') ||
    text.includes('Origin null is not allowed by Access-Control-Allow-Origin');
  page.on('pageerror', (error) => {
    if (!isScannerCorsDiagnostic(error.message)) errors.push(error.message);
  });
  // Axe probes file: stylesheets through XHR; those scanner-only CORS diagnostics are not app failures.
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !scanningAccessibility && !isScannerCorsDiagnostic(text)) errors.push(text);
  });
  await openAnnotations(page);
  await expect(page).toHaveTitle(/UI Style Kit CSS/);
  await expect(page.getByTestId('retro-glass-template-specimen')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const mode of ['light', 'dark']) {
    await page.selectOption('#modeSelect', mode);
    let audit;
    scanningAccessibility = true;
    try {
      audit = await new AxeBuilder({ page }).include('.demo-control-showcase')
        .include('.demo-semantic-section').include('.rg-card-service').include('.rg-feature-strip').analyze();
    } finally {
      scanningAccessibility = false;
    }
    expect(audit.violations).toEqual([]);
    await capture(page.locator('.demo-control-showcase'), `controls-${mode}`);
    await capture(page.locator('.rg-card-service'), `marketing-${mode}`);
    await capture(page.locator('[data-semantic-node="toolbar"]'), `semantic-icons-${mode}`);
    await capture(page.getByTestId('native-buttons'), `native-buttons-${mode}`);
  }
  const check = page.getByTestId('native-forms').locator('input[type="checkbox"]').first();
  await check.focus();
  await page.keyboard.press('Space');
  await expect(check).not.toBeChecked();
  await page.selectOption('#themeSelect', 'sunset-ember');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'sunset-ember');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const busy of await page.getByTestId('retro-glass-specimen-action-states').locator('[aria-busy="true"]').all()) {
    expect(await busy.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await capture(page.getByTestId('retro-glass-specimen-choices-tags'), 'choices-mobile');
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await capture(page.getByTestId('retro-glass-template-specimen'), 'specimen-desktop');
  expect(errors).toEqual([]);
});
