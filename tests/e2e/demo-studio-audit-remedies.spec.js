import { test, expect } from '@playwright/test';
import { startStudioServer } from '../../scripts/serve-studio.mjs';

let server;
test.beforeAll(async () => {
  server = await startStudioServer(0);
});
test.afterAll(async () => {
  await server.close();
});

/** Shared operation completion survives presentation replacement and preserves the failure branch. */
test('studio remedies finish pending saves after example navigation', async ({ page }) => {
  await page.goto(server.url + '?example=form');
  const frame = page.frameLocator('#preview-b');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await frame.getByLabel('Full name', { exact: true }).fill('Sample User');
  await frame.getByLabel('Email address', { exact: true }).fill('sample@example.com');
  await frame.locator('[data-save-button]').click();
  await expect(frame.locator('[data-save-button]')).toHaveAttribute('aria-busy', 'true');
  await page.locator('[data-example="dashboard"]').click();
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.waitForTimeout(800);
  await page.locator('[data-example="form"]').click();
  await expect(frame.locator('[data-save-button]')).toBeEnabled();
  await expect(frame.locator('[data-form-message]')).toHaveText(
    'Your changes were saved in this session.',
  );
  await expect(frame.getByLabel('Email address', { exact: true })).toHaveValue(
    'sample@example.com',
  );
  await frame.getByLabel('Email address', { exact: true }).fill('fail@example.com');
  await frame.locator('[data-save-button]').click();
  await expect(frame.locator('[data-form-message]')).toHaveText(
    'Sample save failed. Change the email and try again.',
  );
  await expect(frame.locator('[data-save-button]')).toBeEnabled();
});

/** Replacement preparation and binding failures retain the complete live preview, including paint. */
test('studio remedies retain last good details when replacement preparation fails', async ({
  page,
}) => {
  await page.goto(server.url + '?view=details&ui=clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const frame = page.frameLocator('#preview-b');
  const appearance = () =>
    frame.locator('.clay-sheet').evaluate((node) => ({
      ui: document.body.dataset.ui,
      background: getComputedStyle(node).backgroundColor,
      corners: getComputedStyle(node).borderRadius,
    }));
  const before = await appearance();
  await page.route('**/demo-bento.js*', (route) => route.abort());
  await page.selectOption('#uiSelect', 'bento');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
  expect(await appearance()).toEqual(before);
  await page.unroute('**/demo-bento.js*');
  await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect(frame.locator('body')).toHaveAttribute('data-ui', 'bento');
});

/** A successful transport without registration must remain recoverable through the visible Retry action. */
test('studio remedies retry missing specimen registration with a fresh request', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/demo-clay.js*', (route) => {
    requests++;
    return requests === 1
      ? route.fulfill({
          status: 200,
          contentType: 'text/javascript',
          body: '/* no registration */',
        })
      : route.continue();
  });
  await page.goto(server.url + '?view=details&ui=clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
  await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  expect(requests).toBe(2);
  await expect(page.frameLocator('#preview-b').locator('.clay-sheet')).toBeVisible();
});

/** The presence of another variant cannot satisfy readiness for the requested artwork. */
test('studio remedies retry an icon variant that did not register', async ({ page }) => {
  await page.goto(server.url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.route('**/minimal-saas/themed.js*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: '/* missing requested variant */',
    }),
  );
  await page.locator('#themed-icons').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
  await page.unroute('**/minimal-saas/themed.js*');
  await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect(
    page.frameLocator('#preview-b').locator('[data-copy-option="button-primary"] svg'),
  ).toHaveAttribute('data-icon-variant', 'themed');
  await expect(page.locator('#copy-link svg')).toHaveAttribute('data-icon-variant', 'themed');
  await expect(page.locator('#icon-status')).toHaveText('Minimal SaaS / Themed');
});

/** Overlapping document/subtree work must respect the latest global icon selection. */
test('studio remedies prevent stale subtree icons from replacing newer artwork', async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/minimal-saas/monochrome.js*', async (route) => {
    if (route.request().frame() === page.mainFrame()) await gate;
    await route.continue();
  });
  try {
    await page.goto(server.url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await page.locator('#tokens [data-studio-icon]').first().waitFor({ state: 'attached' });
    await page.locator('#themed-icons').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#copy-link svg')).toHaveAttribute('data-icon-variant', 'themed');
    release();
    await page.waitForFunction(
      () => !!window.UI_STYLE_KIT_ICON_ASSETS?.['minimal-saas']?.monochrome,
    );
    await expect(page.locator('#tokens svg').first()).toHaveAttribute(
      'data-icon-variant',
      'themed',
    );
    expect(
      await page
        .locator('#tokens svg')
        .evaluateAll((nodes) => [...new Set(nodes.map((node) => node.dataset.iconVariant))]),
    ).toEqual(['themed']);
  } finally {
    release();
  }
});

/** Comparison context belongs to rendered landmarks while copied blocks keep reusable labels. */
test('studio remedies distinguish comparison landmarks without polluting copied markup', async ({
  page,
}) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copiedBlock = text;
        },
      },
    }),
  );
  await page.goto(server.url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.getByRole('button', { name: 'Compare styles', exact: true }).click();
  await expect(page.locator('#panel-a')).toHaveAttribute('data-status', 'ready');
  const scan = await new AxeBuilder({ page }).withRules(['landmark-unique']).analyze();
  expect(scan.violations).toEqual([]);
  await page.frameLocator('#preview-b').locator('[data-copy-option="navigation"]').click();
  await expect
    .poll(() => page.evaluate(() => window.copiedBlock))
    .toContain('aria-label="Sample navigation"');
  expect(await page.evaluate(() => window.copiedBlock)).not.toMatch(/Editable|Pinned|data-studio/);
});

/** Default Clay material pairs must retain normal-text contrast on the rendered catalog surfaces. */
test('studio remedies keep Clay default muted text readable', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(server.url + '?view=components&ui=clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.screenshot({ animations: 'disabled' });
  const scan = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(
    scan.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })),
  ).toEqual([]);
});

/** The browser fetches only the texture selected by the active Paper mode. */
test('studio remedies load Paper texture assets on demand by mode', async ({ page }) => {
  const textures = [];
  page.on('request', (request) => {
    if (/paper-sheet-(?:light|dark)\.png/.test(request.url()))
      textures.push(new URL(request.url()).pathname);
  });
  await page.goto(server.url + '?view=details&ui=paper-editorial&mode=light');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect
    .poll(() => textures.filter((name) => name.endsWith('paper-sheet-light.png')).length)
    .toBe(1);
  expect(textures.some((name) => name.endsWith('paper-sheet-dark.png'))).toBe(false);
  await page.selectOption('#modeSelect', 'dark');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect
    .poll(() => textures.filter((name) => name.endsWith('paper-sheet-dark.png')).length)
    .toBe(1);
});

/** A binder can fail after registration; rollback must preserve the live board and its field values. */
test('studio remedies roll back a replacement whose binder throws', async ({ page }) => {
  await page.goto(server.url + '?view=details&ui=clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const frame = page.frameLocator('#preview-b');
  await frame.locator('.clay-sheet').evaluate((node) => {
    node.dataset.retained = 'original';
  });
  const retainedField = frame
    .locator('.clay-sheet input[type="text"]:not([readonly]):not([disabled])')
    .first();
  await retainedField.fill('Preserved note');
  await page.route('**/demo-bento.js*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({
      response,
      body:
        body +
        '\n{ const original = window.StudioAuthored.bento.bind; window.StudioAuthored.bento.bind = (...args) => { window.StudioAuthored.bento.bind = original; throw new Error("Sample binder failed"); }; }',
    });
  });
  await page.selectOption('#uiSelect', 'bento');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
  await expect(frame.locator('.clay-sheet[data-retained="original"]')).toBeVisible();
  await expect(retainedField).toHaveValue('Preserved note');
  await expect(frame.locator('body')).toHaveAttribute('data-ui', 'clay');
  await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect(frame.locator('body')).toHaveAttribute('data-ui', 'bento');
});
