import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = pathToFileURL(path.resolve('index.html')).href;

/** Measures observable work without exposing production-only instrumentation. */
test('studio optimization keeps typing out of shell rendering and export cloning', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.optimizationClones = 0;
    const clone = Node.prototype.cloneNode;
    Node.prototype.cloneNode = function (deep) {
      if (this.id === 'preview-root') window.optimizationClones++;
      return clone.call(this, deep);
    };
  });
  await page.goto(url + '?example=form');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.locator('#compare').click();
  await expect(page.locator('#panel-a')).toHaveAttribute('data-status', 'ready');
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    window.optimizationMutations = 0;
    window.optimizationObserver = new MutationObserver(
      (records) => (window.optimizationMutations += records.length),
    );
    window.optimizationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  for (const frame of page.frames())
    await frame.evaluate(() => {
      window.optimizationClones = 0;
    });
  const preview = page.frameLocator('#preview-b');
  await preview.getByLabel('Full name', { exact: true }).pressSequentially('Sample', { delay: 35 });
  await expect(
    page.frameLocator('#preview-a').getByLabel('Full name', { exact: true }),
  ).toHaveValue('Sample');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.optimizationMutations)).toBe(0);
  for (const frame of page.frames())
    expect(await frame.evaluate(() => window.optimizationClones)).toBe(0);
  await page.evaluate(() => window.optimizationObserver.disconnect());
});

/** Filtering must keep existing controls and entered values rather than rebuilding the catalog. */
test('studio optimization filters the mounted catalog without replacing component nodes', async ({
  page,
}) => {
  await page.goto(url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const frame = page.frameLocator('#preview-b');
  const input = frame.locator('[data-component-option="input-email"] input');
  await input.fill('catalog@example.com');
  await input.evaluate((node) => {
    node.dataset.identity = 'retained';
  });
  await page.locator('#component-search').fill('indeterminate');
  await expect(frame.locator('[data-component-option]:visible')).toHaveCount(1);
  await page.locator('#component-search').fill('');
  await expect(input).toHaveValue('catalog@example.com');
  await expect(input).toHaveAttribute('data-identity', 'retained');
});

/** The public tool needs one preset per document and one requested icon treatment. */
test('studio optimization loads focused preset CSS and only the selected icon variant', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));
  await page.goto(url + '?view=components&ui=clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  expect(requests.some((name) => name.endsWith('/ui-style-kit.visual.css'))).toBe(false);
  expect(requests.some((name) => name.endsWith('/visual/minimal-saas.css'))).toBe(true);
  expect(requests.some((name) => name.endsWith('/visual/clay.css'))).toBe(true);
  await expect(
    page.frameLocator('#preview-b').locator('link[rel="stylesheet"]').first(),
  ).toHaveAttribute('data-studio-preset', 'clay');
  expect(
    requests
      .filter((name) => name.includes('/icon-packs/'))
      .every((name) => name.endsWith('/minimal-saas/monochrome.js')),
  ).toBe(true);
  await page.locator('#themed-icons').focus();
  await page.keyboard.press('Space');
  await expect(
    page.frameLocator('#preview-b').locator('[data-copy-option="button-primary"] svg'),
  ).toHaveAttribute('data-icon-variant', 'themed');
  expect(requests.some((name) => name.endsWith('/minimal-saas/themed.js'))).toBe(true);
});

/** A failed replacement stylesheet must not repaint the last good preview or poison retry. */
test('studio optimization retains the last good style during CSS failure and retries', async ({
  page,
}) => {
  const { startStudioServer } = await import('../../scripts/serve-studio.mjs');
  const server = await startStudioServer(0);
  try {
    let blocked = true;
    await page.route('**/dist/visual/clay.css*', (route) =>
      blocked ? route.abort() : route.continue(),
    );
    await page.goto(server.url + '?example=form');
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await page.selectOption('#uiSelect', 'clay');
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
    await expect(page.frameLocator('#preview-b').locator('body')).toHaveAttribute(
      'data-ui',
      'minimal-saas',
    );
    await page
      .frameLocator('#preview-b')
      .getByLabel('Full name', { exact: true })
      .fill('Preserved');
    await page.waitForTimeout(100);
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
    blocked = false;
    await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await expect(page.frameLocator('#preview-b').locator('body')).toHaveAttribute(
      'data-ui',
      'clay',
    );
    expect(await page.frameLocator('#preview-b').locator('link[data-studio-preset]').count()).toBe(
      1,
    );
  } finally {
    await server.close();
  }
});

/** Detached sample controls must lose both property handlers and registered listeners. */
test('studio optimization disposes old specimen handlers after changing styles', async ({
  page,
}) => {
  await page.goto(url + '?view=details&ui=bento');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const frame = page.frameLocator('#preview-b');
  await frame.locator('[data-bento-mode]').evaluate((node) => {
    window.retiredModeControl = node;
  });
  await page.selectOption('#uiSelect', 'clay');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await expect(frame.locator('body')).toHaveAttribute('data-ui', 'clay');
  await frame.locator('body').evaluate(() => window.retiredModeControl.click());
  await page.waitForTimeout(100);
  await expect(page.locator('#modeSelect')).toHaveValue('light');
});

/** Focused public entrypoints must paint exactly like the complete library across themes and modes. */
test('studio optimization focused styles preserve every preset component paint', async ({
  page,
}) => {
  test.setTimeout(120000);
  const { readFileSync } = await import('node:fs');
  const presets = JSON.parse(readFileSync('manifest.json', 'utf8')).presets;
  await page.goto(url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const frame = page.frameLocator('#preview-b');
  await frame.locator('body').evaluate(async () => {
    const style = document.createElement('style');
    style.textContent = '* { transition: none !important; }';
    document.head.append(style);
    const full = document.createElement('link');
    full.rel = 'stylesheet';
    full.href = '../dist/ui-style-kit.visual.css';
    full.dataset.parityFull = '';
    full.media = 'not all';
    await new Promise((resolve, reject) => {
      full.onload = resolve;
      full.onerror = reject;
      document.head.insertBefore(full, document.querySelector('link[rel="stylesheet"]'));
    });
  });
  const failures = [];
  for (const { id } of presets) {
    await page.selectOption('#uiSelect', id);
    await expect(frame.locator('body')).toHaveAttribute('data-ui', id);
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    failures.push(
      ...(await frame.locator('body').evaluate((body, id) => {
        const focused = document.querySelector('link[data-studio-preset]');
        const full = document.querySelector('[data-parity-full]');
        const selectors = [
          '[data-component-option="button-primary"] [data-ui-variant="primary"]',
          '[data-component-option="button-danger"] [data-ui-variant="danger"]',
          '[data-component-option="input-text"] input',
          '[data-component-option="checkbox-checked"] .usk-check-control',
          '[data-component-option="metric"] .usk-metric',
          '[data-component-option="table"] table',
        ];
        const properties = [
          'color',
          'backgroundColor',
          'backgroundImage',
          'borderRadius',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'padding',
          'boxShadow',
        ];
        const sample = () =>
          selectors.map((selector) => {
            const style = getComputedStyle(document.querySelector(selector));
            return properties.map((property) => style[property]);
          });
        const failures = [];
        for (const theme of ['', 'arctic-indigo'])
          for (const mode of ['light', 'dark', 'contrast']) {
            if (theme) body.dataset.theme = theme;
            else delete body.dataset.theme;
            body.dataset.mode = mode;
            focused.media = 'all';
            full.media = 'not all';
            const expected = sample();
            focused.media = 'not all';
            full.media = 'all';
            const actual = sample();
            for (let i = 0; i < selectors.length; i++)
              for (let j = 0; j < properties.length; j++)
                if (expected[i][j] !== actual[i][j])
                  failures.push({
                    id,
                    theme,
                    mode,
                    selector: selectors[i],
                    property: properties[j],
                    focused: expected[i][j],
                    full: actual[i][j],
                  });
          }
        focused.media = 'all';
        full.media = 'not all';
        body.dataset.mode = 'light';
        delete body.dataset.theme;
        return failures;
      }, id)),
    );
  }
  expect(failures).toEqual([]);
});

/** Code consumption coalesces revisions and interaction feedback follows the selected plan. */
test('studio optimization coalesces markup requests and keeps selected interaction feedback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.markupRequests = [];
    addEventListener('message', (event) => {
      if (event.data?.type === 'request-markup') window.markupRequests.push(event.data.revision);
    });
  });
  await page.goto(url + '?example=content&bridge=on');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await page.getByRole('tab', { name: 'Code & export', exact: true }).click();
  await expect(page.locator('#markup-code')).toContainText('usk-');
  const frame = page.frameLocator('#preview-b');
  await frame.locator('body').evaluate(() => {
    window.markupRequests = [];
  });
  // The inspector is modal; invoke the native callback to inspect protocol work while Code consumes it.
  await frame.locator('[data-action="plan-solo"]').evaluate((node) => node.click());
  await expect(frame.locator('[data-action="plan-solo"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(frame.locator('[data-action="plan-solo"]')).toHaveAttribute(
    'data-surface-level',
    '3',
  );
  await expect(page.locator('#markup-code')).toContainText('A focused workspace');
  const requests = await frame.locator('body').evaluate(() => window.markupRequests);
  expect(requests.length).toBe(1);
});

/** A stale stylesheet completion must not replace newer visual intent or discard entered text. */
test('studio optimization ignores delayed styles after a newer selection', async ({ page }) => {
  const { startStudioServer } = await import('../../scripts/serve-studio.mjs');
  const server = await startStudioServer(0);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const held = new Promise((resolve) => {
    started = resolve;
  });
  try {
    await page.route('**/dist/visual/clay.css*', async (route) => {
      started();
      await gate;
      await route.continue();
    });
    await page.goto(server.url + '?example=form');
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await page.selectOption('#uiSelect', 'clay');
    await held;
    await page
      .frameLocator('#preview-b')
      .getByLabel('Full name', { exact: true })
      .fill('Retained while loading');
    await page.selectOption('#uiSelect', 'bento');
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    release();
    const frame = page.frameLocator('#preview-b');
    await expect(frame.locator('body')).toHaveAttribute('data-ui', 'bento');
    await expect(frame.getByLabel('Full name', { exact: true })).toHaveValue(
      'Retained while loading',
    );
    await expect(frame.locator('link[data-studio-preset]')).toHaveCount(1);
    await expect(frame.locator('link[data-studio-preset]')).toHaveAttribute(
      'data-studio-preset',
      'bento',
    );
  } finally {
    release();
    await server.close();
  }
});

/** Returning to cached artwork must restore its status without redundant hydration. */
test('studio optimization restores icon status after reverting a failed icon treatment', async ({
  page,
}) => {
  const { startStudioServer } = await import('../../scripts/serve-studio.mjs');
  const server = await startStudioServer(0);
  try {
    await page.route('**/icon-packs/minimal-saas/themed.js*', (route) => route.abort());
    await page.goto(server.url);
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await expect(page.locator('#icon-status')).toHaveText('Minimal SaaS / Monochrome');
    await page.locator('#themed-icons').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#icon-status')).toContainText('could not load');
    await page.locator('#themed-icons').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await expect(page.locator('#icon-status')).toHaveText('Minimal SaaS / Monochrome');
  } finally {
    await server.close();
  }
});

/** Reverting to a cached treatment must invalidate an earlier asynchronous artwork request. */
test('studio optimization ignores delayed icon artwork after reverting defaults', async ({
  page,
}) => {
  const { startStudioServer } = await import('../../scripts/serve-studio.mjs');
  const server = await startStudioServer(0);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const held = new Promise((resolve) => {
    started = resolve;
  });
  try {
    await page.addInitScript(() => {
      window.themedLoads = 0;
      document.addEventListener(
        'load',
        (event) => {
          if (
            event.target.tagName === 'SCRIPT' &&
            event.target.src.includes('/minimal-saas/themed.js')
          )
            window.themedLoads++;
        },
        true,
      );
    });
    await page.route('**/icon-packs/minimal-saas/themed.js*', async (route) => {
      started();
      await gate;
      await route.continue();
    });
    await page.goto(server.url);
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await page.locator('#themed-icons').focus();
    await page.keyboard.press('Space');
    await held;
    await page.locator('#themed-icons').focus();
    await page.keyboard.press('Space');
    release();
    await expect.poll(() => page.evaluate(() => window.themedLoads)).toBe(1);
    await expect(page.locator('#icon-status')).toHaveText('Minimal SaaS / Monochrome');
    await expect(page.locator('#copy-link svg')).toHaveAttribute('data-icon-variant', 'monochrome');
    await expect(page.locator('[data-studio-icon-key*="themed"]')).toHaveCount(0);
  } finally {
    release();
    await server.close();
  }
});

/** Shared authored CSS preserves each document's Layout density without duplicate assets. */
test('studio shared stylesheet preserves shell preview and reference layouts', async ({ page }) => {
  await page.goto(url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  const preview = page.frameLocator('#preview-b');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page
        .locator('body')
        .evaluate((node) => getComputedStyle(node).getPropertyValue('--ly-grid-min').trim()),
    ).toBe('15rem');
    expect(
      await preview
        .locator('body')
        .evaluate((node) => getComputedStyle(node).getPropertyValue('--ly-grid-min').trim()),
    ).toBe('15rem');
    expect(
      await preview
        .locator('body')
        .evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBe(true);
  }
  await page.goto(
    pathToFileURL(path.resolve('demo/reference.html')).href + '?ui=bento&view=reference',
  );
  await expect(page.locator('#demoContent')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.bento-sheet')).toBeVisible();
  expect(
    await page
      .locator('body')
      .evaluate((node) => getComputedStyle(node).getPropertyValue('--ly-grid-min').trim()),
  ).toBe('18rem');
  await expect(page.locator('link[href*="demo.css"]')).toHaveCount(1);
  await expect(page.locator('link[href*="preview.css"]')).toHaveCount(0);
});

/** Default Layout spacing must adapt to viewport height without demo-level gap overrides. */
test('studio inherits Layout responsive spacing for normal and short screens', async ({ page }) => {
  await page.goto(url + '?view=components');
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  for (const [height, grid, stack, cluster] of [
    [900, '24px', '16px', '12px'],
    [400, '12px', '12px', '8px'],
  ]) {
    await page.setViewportSize({ width: 1440, height });
    await expect(page.locator('.studio-fields')).toHaveCSS('gap', grid);
    await expect(page.locator('#workspace')).toHaveCSS('gap', stack);
    await expect(page.locator('.studio-header-actions')).toHaveCSS('gap', cluster);
  }
});
