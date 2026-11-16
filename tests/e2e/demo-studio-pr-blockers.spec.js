import { test, expect, chromium } from '@playwright/test';
import { startStudioServer } from '../../scripts/serve-studio.mjs';

let server;

/** Uses normal static-page caching so persisted navigation is tested rather than a fresh reload. */
test.beforeAll(async () => {
  server = await startStudioServer(0);
  const handlers = server.server.listeners('request');
  server.server.removeAllListeners('request');
  server.server.on('request', (request, response) => {
    const writeHead = response.writeHead.bind(response);
    response.writeHead = (status, headers) =>
      writeHead(status, { ...headers, 'cache-control': 'public, max-age=600' });
    for (const handler of handlers) handler(request, response);
  });
});
test.afterAll(async () => {
  await server.close();
});

/** Native fields describe the actual material palette; edits must paint both Studio and copied CSS consumers. */
test('studio Clay native material edits paint and export across every mode', async ({
  page,
  context,
}) => {
  const defaults = {
    light: {
      bg: '235 228 219',
      surface: '233 226 217',
      'surface-strong': '229 221 211',
      'surface-soft': '229 222 213',
      text: '52 49 47',
      'text-muted': '101 94 87',
      border: '175 164 152',
      primary: '128 96 59',
      'primary-hover': '126 100 68',
      'primary-text': '248 244 238',
    },
    dark: {
      bg: '28 30 31',
      surface: '32 35 36',
      'surface-strong': '41 44 45',
      'surface-soft': '24 26 27',
      text: '222 218 211',
      'text-muted': '166 162 155',
      border: '12 13 14',
      primary: '115 102 74',
      'primary-hover': '106 93 62',
      'primary-text': '242 239 234',
    },
    contrast: {
      bg: '0 0 0',
      surface: '17 17 17',
      'surface-strong': '28 28 28',
      'surface-soft': '0 0 0',
      text: '255 255 255',
      'text-muted': '255 255 255',
      border: '255 255 255',
      primary: '255 209 102',
      'primary-hover': '255 255 255',
      'primary-text': '0 0 0',
    },
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [mode, palette] of Object.entries(defaults)) {
    await page.goto(server.url + '?view=components&ui=clay&mode=' + mode);
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
    await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
    for (const [role, value] of Object.entries(palette))
      await expect(page.locator('[data-rgb="' + role + '"]'), mode + ' ' + role).toHaveValue(value);
    const frame = page.frameLocator('#preview-b');
    for (const [role, value, selector, property, expected] of [
      ['bg', '18 52 86', 'body', 'background-color', 'rgb(18, 52, 86)'],
      ['surface', '221 207 191', '.usk-card', 'background-color', 'rgb(221, 207, 191)'],
      ['text-muted', '56 62 74', '.usk-help-text', 'color', 'rgb(56, 62, 74)'],
      [
        'primary',
        '32 64 96',
        '.usk-button[data-ui-variant="primary"]',
        'background-color',
        'rgb(32, 64, 96)',
      ],
      [
        'primary-text',
        '255 255 255',
        '.usk-button[data-ui-variant="primary"]',
        'color',
        'rgb(255, 255, 255)',
      ],
    ]) {
      await page.locator('[data-rgb="' + role + '"]').fill(value);
      await expect(frame.locator(selector).first(), mode + ' painted ' + role).toHaveCSS(
        property,
        expected,
      );
    }
    await page.locator('#code-tab').click();
    await expect(page.locator('#download-css')).toBeEnabled();
    const exported = await page.locator('#css-code').textContent();
    const standalone = await context.newPage();
    try {
      await standalone.route('**/standalone.html', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body:
            '<!doctype html><html><head><link rel="stylesheet" href="' +
            server.url +
            'dist/ui-style-kit.visual.css"><link rel="stylesheet" href="' +
            server.url +
            'styles/component-composition.css"><style>' +
            exported +
            '</style></head><body data-ui="clay" data-mode="' +
            mode +
            '"><article class="usk-card"><button class="usk-button" data-ui-variant="primary">Run</button><p class="usk-help-text">Help</p></article></body></html>',
        }),
      );
      await standalone.goto(server.url + 'standalone.html');
      await expect(standalone.locator('body')).toHaveCSS('background-color', 'rgb(18, 52, 86)');
      await expect(standalone.locator('.usk-card')).toHaveCSS(
        'background-color',
        'rgb(221, 207, 191)',
      );
      await expect(standalone.locator('.usk-help-text')).toHaveCSS('color', 'rgb(56, 62, 74)');
      await expect(standalone.locator('.usk-button')).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(standalone.locator('.usk-button')).toHaveCSS(
        'background-color',
        'rgb(32, 64, 96)',
      );
    } finally {
      await standalone.close();
    }
  }
});

/** Opens the full browser because normal automation disables back-forward caching by default.
 * @param {string} query Initial Studio configuration.
 * @returns {Promise<Object>} Isolated browser and page, owned by the calling test.
 */
async function openCachedStudio(query) {
  const browser = await chromium.launch({
    channel: 'chromium',
    ignoreDefaultArgs: ['--disable-back-forward-cache'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
    addEventListener('pageshow', (event) => {
      window.restoredFromCache = event.persisted;
    });
  });
  await page.goto(server.url + query);
  await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  await page.evaluate(() => {
    window.cachedDocumentMarker = 'original-document';
    document.querySelector('#preview-b').contentWindow.cachedFrameMarker = 'original-preview';
  });
  return { browser, page };
}

/** Requires a retained document so a fresh reload cannot falsely prove lifecycle recovery.
 * @param {Object} page Full Chromium page.
 * @returns {Promise<void>} Resolves only after a real persisted restoration.
 */
async function restoreCachedStudio(page) {
  await page.goto('about:blank');
  await page.goBack({ waitUntil: 'commit' });
  await expect
    .poll(() => page.evaluate(() => window.cachedDocumentMarker))
    .toBe('original-document');
  await expect.poll(() => page.evaluate(() => window.restoredFromCache)).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => document.querySelector('#preview-b').contentWindow.cachedFrameMarker),
    )
    .toBe('original-preview');
}

/** Persisted page transitions retain authored DOM and its local field state. */
test('studio cached Back retains authored details and local input state', async ({
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'This regression explicitly tests full Chromium cache restoration.',
  );
  const { browser, page } = await openCachedStudio('?view=details&ui=clay');
  try {
    const frame = page.frameLocator('#preview-b');
    const field = frame
      .locator('.clay-sheet input[type="text"]:not([readonly]):not([disabled])')
      .first();
    await field.fill('Cached draft');
    await restoreCachedStudio(page);
    // Cached child realms can outlive their automation frame handles; inspect the actual retained document.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const iframe = document.querySelector('#preview-b');
          const documentView = iframe.contentWindow;
          const board = iframe.contentDocument.querySelector('.clay-sheet');
          const rectangle = board?.getBoundingClientRect();
          return {
            visible:
              !!rectangle &&
              rectangle.width > 0 &&
              rectangle.height > 0 &&
              iframe.clientWidth > 0 &&
              documentView.getComputedStyle(board).display !== 'none',
            value: board?.querySelector('input[type="text"]:not([readonly]):not([disabled])')
              ?.value,
          };
        }),
      )
      .toEqual({ visible: true, value: 'Cached draft' });
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  } finally {
    await browser.close();
  }
});

/** A frozen page preserves its shared operation timer and resumes functional interaction wiring. */
test('studio cached Back completes a pending save and keeps form actions working', async ({
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'This regression explicitly tests full Chromium cache restoration.',
  );
  const { browser, page } = await openCachedStudio('?example=form');
  try {
    const frame = page.frameLocator('#preview-b');
    await frame.getByLabel('Full name', { exact: true }).fill('Cached user');
    await frame.getByLabel('Email address', { exact: true }).fill('cache@example.com');
    await frame.locator('[data-save-button]').click();
    await expect(frame.locator('[data-save-button]')).toHaveAttribute('aria-busy', 'true');
    await restoreCachedStudio(page);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const documentView = document.querySelector('#preview-b').contentDocument;
          const save = documentView.querySelector('[data-save-button]');
          return {
            enabled: !!save && !save.disabled,
            message: documentView.querySelector('[data-form-message]')?.textContent,
            name: documentView.querySelector('[data-action="profile-name"]')?.value,
          };
        }),
      )
      .toEqual({
        enabled: true,
        message: 'Your changes were saved in this session.',
        name: 'Cached user',
      });
    // A trusted pointer event proves that the cached document's delegated actions remain connected.
    const point = await page.evaluate(() => {
      const iframe = document.querySelector('#preview-b');
      const reset = iframe.contentDocument.querySelector('[data-action="profile-reset"]');
      iframe.scrollIntoView({ block: 'start' });
      reset.scrollIntoView({ block: 'center' });
      const outer = iframe.getBoundingClientRect();
      const inner = reset.getBoundingClientRect();
      return {
        x: outer.left + iframe.clientLeft + inner.left + inner.width / 2,
        y: outer.top + iframe.clientTop + inner.top + inner.height / 2,
      };
    });
    await page.mouse.click(point.x, point.y);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const documentView = document.querySelector('#preview-b').contentDocument;
          return ['profile-name', 'profile-email'].map(
            (name) => documentView.querySelector('[data-action="' + name + '"]').value,
          );
        }),
      )
      .toEqual(['', '']);
  } finally {
    await browser.close();
  }
});
