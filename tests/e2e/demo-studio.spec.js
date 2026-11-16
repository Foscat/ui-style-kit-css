import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { startStudioServer } from '../../scripts/serve-studio.mjs';

const url = pathToFileURL(path.resolve('index.html')).href;
const presets = JSON.parse(readFileSync('manifest.json', 'utf8')).presets;

/** Waits for a configured, visible preview rather than a merely loaded frame. */
async function ready(page, id = 'b') {
  await expect(page.locator('#panel-' + id)).toHaveAttribute('data-status', 'ready');
  return page.frameLocator('#preview-' + id);
}

test('studio presents one workspace and preserves its neutral shell across styles', async ({
  page,
}) => {
  await page.goto(url);
  const preview = await ready(page);
  await expect(page.getByRole('heading', { name: 'See your next interface.' })).toBeVisible();
  await expect(preview.getByRole('heading', { name: 'Good work, in view.' })).toBeVisible();
  await expect(page.locator('#semantic-runtime')).toHaveCount(0);
  await page.selectOption('#uiSelect', 'tactile');
  await expect(preview.locator('body')).toHaveAttribute('data-ui', 'tactile');
  await expect(page.locator('body')).toHaveAttribute('data-ui', 'minimal-saas');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('studio retains real form values and DOM identity through every preset and palette switch', async ({
  page,
}) => {
  await page.goto(url + '?example=form');
  const preview = await ready(page);
  const name = preview.getByLabel('Full name', { exact: true });
  await name.fill('Alex Example');
  await preview.getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await name.evaluate((node) => {
    node.dataset.identity = 'retained';
  });
  for (const { id } of presets) {
    await page.selectOption('#uiSelect', id);
    await expect(preview.locator('body')).toHaveAttribute('data-ui', id);
    await expect(name).toHaveAttribute('data-identity', 'retained');
    await expect(name).toHaveValue('Alex Example');
  }
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await expect(preview.locator('body')).toHaveAttribute('data-theme', 'arctic-indigo');
  await expect(name).toHaveValue('Alex Example');
  await preview.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(preview.getByRole('button', { name: 'Saving…', exact: true })).toBeDisabled();
  await expect(preview.getByRole('status')).toHaveText('Your changes were saved in this session.');
});

test('studio comparison pins colors independently and shares search and empty results', async ({
  page,
}) => {
  await page.goto(url + '?ui=tactile');
  const active = await ready(page);
  await page.getByRole('button', { name: 'Compare styles', exact: true }).click();
  const baseline = await ready(page, 'a');
  await page.selectOption('#uiSelect', 'bento');
  await expect(active.locator('body')).toHaveAttribute('data-ui', 'bento');
  await expect(baseline.locator('body')).toHaveAttribute('data-ui', 'tactile');
  await active.getByLabel('Search projects', { exact: true }).fill('Morgan');
  await expect(baseline.getByLabel('Search projects', { exact: true })).toHaveValue('Morgan');
  await expect(active.locator('[data-record]:visible')).toHaveCount(1);
  await active.getByLabel('Search projects', { exact: true }).fill('no possible record');
  await expect(active.locator('[data-project-empty]')).toBeVisible();
  await expect(baseline.locator('[data-project-empty]')).toBeVisible();
});

test('studio token edits export their public namespace and reproduce through a share URL', async ({
  page,
}) => {
  await page.goto(url + '?ui=tactile&mode=dark');
  const preview = await ready(page);
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  const field = page.getByLabel('primary RGB', { exact: true });
  await field.fill('18 52 86');
  await field.press('Tab');
  await expect(preview.locator('body')).toHaveCSS('--tactile-primary-rgb', '18 52 86');
  await page.getByRole('tab', { name: 'Code & export', exact: true }).click();
  await expect(page.locator('#css-code')).toContainText('--tactile-primary-rgb: 18 52 86');
  const shared = await page.locator('#share-url').inputValue();
  await page.keyboard.press('Escape');
  await page.goto(shared);
  const restored = await ready(page);
  await expect(restored.locator('body')).toHaveCSS('--tactile-primary-rgb', '18 52 86');
});

test('studio component explorer uses one markup model and functional keyboard tabs and dialogs', async ({
  page,
}) => {
  await page.goto(url + '?view=components&component=navigation');
  const preview = await ready(page);
  await preview.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(preview.getByRole('tab', { name: 'Activity', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.selectOption('#markupSelect', 'native');
  await expect(preview.locator('.usk-tab')).toHaveCount(0);
  await page.getByRole('button', { name: 'Dialogs & disclosure', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Dialogs & disclosure', exact: true }),
  ).toBeFocused();
  await expect(
    preview.getByRole('button', { name: 'Open confirmation', exact: true }),
  ).toBeVisible();
  await preview.getByRole('button', { name: 'Open confirmation', exact: true }).click();
  await expect(preview.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    preview.getByRole('button', { name: 'Open confirmation', exact: true }),
  ).toBeFocused();
});

test('studio supports narrow comparison without page overflow or hidden primary controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await ready(page);
  await page.getByRole('button', { name: 'Compare styles', exact: true }).click();
  await ready(page, 'a');
  await expect(page.locator('#comparison-switch')).toBeVisible();
  await page.getByRole('button', { name: 'A · Pinned', exact: true }).click();
  await expect(page.locator('#panel-a')).toBeVisible();
  await expect(page.locator('#panel-b')).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await expect(page.locator('#appearance-controls > summary')).toBeVisible();
  await expect(page.locator('#uiSelect')).toBeHidden();
  await page.locator('#appearance-controls > summary').click();
  await expect(page.locator('#uiSelect')).toBeVisible();
});

test('studio reports failed specimen loads and retries without losing the last working preview', async ({
  page,
}) => {
  const server = await startStudioServer(0);
  try {
    await page.goto(server.url);
    await ready(page);
    let blocked = true;
    await page.route('**/studio-specimens.js*', (route) =>
      blocked ? route.abort() : route.continue(),
    );
    await page.getByRole('link', { name: 'Style details', exact: true }).click();
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'error');
    await expect(page.getByRole('button', { name: 'Retry preview', exact: true })).toBeVisible();
    blocked = false;
    await page.getByRole('button', { name: 'Retry preview', exact: true }).click();
    await ready(page);
    await expect(page.frameLocator('#preview-b').locator('#preview-root')).not.toBeEmpty();
  } finally {
    await server.close();
  }
});

test('studio retains native palette aliases reference links and accessible primary controls', async ({
  page,
}) => {
  await page.goto(url + '?personality=tactile&theme=None&mode=dark');
  const preview = await ready(page);
  await expect(preview.locator('body')).not.toHaveAttribute('data-theme');
  await expect(page.locator('#uiSelect')).toHaveValue('tactile');
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});

test('studio mounts each authored style detail without loading unrelated boards', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url + '?view=details');
  const preview = await ready(page);
  for (const { id } of presets) {
    await page.selectOption('#uiSelect', id);
    await expect(preview.locator('body')).toHaveAttribute('data-ui', id);
    await ready(page);
    await expect(preview.locator('#preview-root')).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});

test('studio ignores an obsolete failed specimen request after returning to examples', async ({
  page,
}) => {
  const server = await startStudioServer(0);
  let release;
  let requested;
  const observed = new Promise((resolve) => {
    requested = resolve;
  });
  try {
    await page.goto(server.url);
    await ready(page);
    await page.route('**/studio-specimens.js*', async (route) => {
      requested();
      await new Promise((resolve) => {
        release = resolve;
      });
      await route.abort();
    });
    await page.getByRole('link', { name: 'Style details', exact: true }).click();
    await observed;
    await page.getByRole('link', { name: 'Examples', exact: true }).click();
    await ready(page);
    const failed = page.waitForEvent('requestfailed', {
      predicate: (request) => new URL(request.url()).pathname.endsWith('/studio-specimens.js'),
    });
    release();
    await failed;
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await expect(
      page.frameLocator('#preview-b').getByRole('heading', { name: 'Good work, in view.' }),
    ).toBeVisible();
    await expect(page.locator('#panel-b')).toHaveAttribute('data-status', 'ready');
  } finally {
    release?.();
    await server.close();
  }
});

test('studio history retains form drafts and independent palette experiments', async ({ page }) => {
  await page.goto(url + '?example=form');
  const preview = await ready(page);
  await preview.getByLabel('Full name', { exact: true }).fill('A preserved draft');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await page.getByLabel('primary RGB', { exact: true }).fill('18 52 86');
  await page.keyboard.press('Escape');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await page.getByLabel('primary RGB', { exact: true }).fill('25 75 125');
  await page.keyboard.press('Escape');
  await page.goBack();
  await expect(page.locator('#themeSelect')).toHaveValue('');
  await expect(preview.getByLabel('Full name', { exact: true })).toHaveValue('A preserved draft');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await expect(page.getByLabel('primary RGB', { exact: true })).toHaveValue('25 75 125');
});

test('studio provides a manual clipboard fallback and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Permission denied')) },
      configurable: true,
    }),
  );
  await page.goto(url);
  await ready(page);
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Copy this text', exact: true })).toBeVisible();
  await expect(page.getByLabel('Text to copy', { exact: true })).toHaveValue(/ui=minimal-saas/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await expect(page.locator('#inspector-motion')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('dialog', { name: 'Customize & export', exact: true })).toBeVisible();
});

test('studio interaction feedback uses canonical hooks and stays independent in comparison', async ({
  page,
}) => {
  await page.goto(url + '?view=components&component=buttons');
  const preview = await ready(page);
  await expect(preview.locator('.interactive-surface')).toHaveCount(0);
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await expect(page.locator('.studio-feedback-toggle .usk-check-control')).toBeVisible();
  await page.locator('.studio-feedback-toggle').click();
  await expect(page.getByLabel('Enable interaction feedback', { exact: true })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(preview.locator('button[data-action="component-save"]')).toHaveClass(
    /interactive-surface/,
  );
  await expect(preview.locator('button[data-action="component-save"]')).toHaveAttribute(
    'data-surface-variant',
    'primary',
  );
  await page.getByRole('button', { name: 'Compare styles', exact: true }).click();
  const baseline = await ready(page, 'a');
  await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
  await page.locator('.studio-feedback-toggle').click();
  await expect(page.getByLabel('Enable interaction feedback', { exact: true })).not.toBeChecked();
  await expect(preview.locator('.interactive-surface')).toHaveCount(0);
  await expect(baseline.locator('button[data-action="component-save"]')).toHaveClass(
    /interactive-surface/,
  );
});

test('studio waits for the active preview before enabling palette exports', async ({ page }) => {
  const server = await startStudioServer(0);
  let release;
  try {
    await page.route(/\/preview\.js(?:\?.*)?$/, async (route) => {
      await new Promise((resolve) => {
        release = resolve;
      });
      await route.continue();
    });
    await page.goto(server.url, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Customize & export', exact: true }).click();
    await page.getByRole('tab', { name: 'Code & export', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Download CSS', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Copy CSS', exact: true })).toBeDisabled();
    release();
    await ready(page);
    await expect(page.getByRole('button', { name: 'Download CSS', exact: true })).toBeEnabled();
    await expect(page.locator('#css-code')).toContainText('--saas-primary-rgb:');
  } finally {
    release?.();
    await server.close();
  }
});
/** Theme demonstrations must match the library with every local demo sheet disabled. */
test('studio palette examples retain unmodified library paint and typography', async ({ page }) => {
  await page.goto(url + '?theme=midnight-gold');
  const preview = await ready(page);
  const selectors = ['h1', '[data-action="new-project"]', '.usk-card', '.usk-badge', '.usk-input'];
  const sample = async () =>
    preview.locator('body').evaluate((body, selectors) => {
      const properties = [
        'color',
        'backgroundColor',
        'backgroundImage',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'borderRadius',
        'boxShadow',
        'paddingTop',
        'paddingLeft',
      ];
      return selectors.map((selector) => {
        const style = getComputedStyle(body.querySelector(selector));
        return Object.fromEntries(properties.map((property) => [property, style[property]]));
      });
    }, selectors);
  const actual = await sample();
  await preview.locator('body').evaluate(() => {
    for (const sheet of document.styleSheets)
      if (/\/(?:demo|preview)\.css(?:\?|$)/.test(sheet.href ?? '')) sheet.disabled = true;
  });
  await page.waitForTimeout(300);
  expect(actual).toEqual(await sample());
  await expect(preview.locator('[data-action="new-project"]')).toHaveAttribute(
    'data-ui-variant',
    'primary',
  );
});
/** Intrinsic Layout primitives must contain both real examples and authored style details. */
test('studio contains every preset preview at phone width without local component overrides', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  const preview = await ready(page);
  await page.locator('#appearance-controls > summary').click();
  for (const view of ['examples', 'details']) {
    await page.locator('[data-view="' + view + '"]').click();
    for (const { id } of presets) {
      await page.selectOption('#uiSelect', id);
      await expect(preview.locator('body')).toHaveAttribute('data-ui', id);
      await ready(page);
      const geometry = await preview
        .locator('html')
        .evaluate((node) => ({ width: innerWidth, scroll: node.scrollWidth }));
      expect(geometry.scroll, view + '/' + id).toBeLessThanOrEqual(geometry.width + 1);
    }
  }
});
/** Every palette field remains reachable through ordinary wheel scrolling inside the drawer. */
test('studio color editor scrolls to the final role using the library drawer geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + '?theme=midnight-gold');
  await ready(page);
  await page.locator('#customize').click();
  await expect(page.getByLabel('focus RGB', { exact: true })).toBeAttached();
  await page.locator('#inspector').hover();
  await page.mouse.wheel(0, 6000);
  await expect(page.getByLabel('focus RGB', { exact: true })).toBeInViewport();
});
/** Shared palette and mode attributes let the library theme the studio controls as well as the preview. */
test('studio controls reflect the selected library palette and mode without changing shell structure', async ({
  page,
}) => {
  await page.goto(url + '?theme=midnight-gold&mode=dark');
  await ready(page);
  await expect(page.locator('body')).toHaveAttribute('data-ui', 'minimal-saas');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'midnight-gold');
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'dark');
  const gold = await page
    .locator('#customize')
    .evaluate((node) => getComputedStyle(node).backgroundImage);
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'arctic-indigo');
  const indigo = await page
    .locator('#customize')
    .evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(indigo).not.toBe(gold);
  await page.selectOption('#themeSelect', '');
  await expect(page.locator('body')).not.toHaveAttribute('data-theme');
});
/** Save outcomes choose semantic variants; the selected library theme owns their colors. */
test('studio save feedback uses canonical danger and success variants', async ({ page }) => {
  await page.goto(url + '?example=form&theme=midnight-gold');
  const preview = await ready(page);
  await preview.getByLabel('Full name', { exact: true }).fill('Alex Morgan');
  await preview.getByLabel('Email address', { exact: true }).fill('fail@example.com');
  await preview.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(preview.locator('[data-form-message]')).toContainText('Sample save failed.');
  await expect(preview.locator('[data-form-message]')).toHaveClass(/\busk-alert\b/);
  await expect(preview.locator('[data-form-message]')).toHaveAttribute('data-ui-variant', 'danger');
  await preview.getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await preview.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(preview.locator('[data-form-message]')).toContainText('Your changes were saved');
  await expect(preview.locator('[data-form-message]')).toHaveAttribute(
    'data-ui-variant',
    'success',
  );
});
/** Each dense catalog tile exposes clean canonical markup through an accessible copy action. */
test('studio component catalog shows dense options and copies the selected canonical block', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Clipboard denied')) },
      configurable: true,
    }),
  );
  await page.goto(url + '?view=components');
  const preview = await ready(page);
  expect(await preview.locator('[data-component-option]').count()).toBeGreaterThan(40);
  const primary = preview.locator('[data-component-option="button-primary"]');
  await expect(
    primary.getByRole('button', { name: 'Copy Primary button', exact: true }),
  ).toBeVisible();
  await primary.getByRole('button', { name: 'Copy Primary button', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Copy this text', exact: true })).toBeVisible();
  await expect(page.getByLabel('Text to copy', { exact: true })).toHaveValue(
    /class="usk-button" data-ui-variant="primary"/,
  );
  await expect(page.getByLabel('Text to copy', { exact: true })).not.toHaveValue(
    /data-action|data-studio|data-copy-option/,
  );
});

/** Defaults stay explicit because the companion package's own default family differs from this demo. */
test('studio icon options default to Minimal SaaS monochrome and can follow the selected style', async ({
  page,
}) => {
  await page.goto(url + '?view=components&ui=clay');
  const preview = await ready(page);
  const copyIcon = preview.locator('[data-copy-option="button-primary"] svg');
  await expect(copyIcon).toHaveAttribute('data-icon-pack', 'minimal-saas');
  await expect(copyIcon).toHaveAttribute('data-icon-variant', 'monochrome');
  await page.locator('#style-icons').focus();
  await page.keyboard.press('Space');
  await expect(copyIcon).toHaveAttribute('data-icon-pack', 'clay');
  await page.locator('#themed-icons').focus();
  await page.keyboard.press('Space');
  await expect(copyIcon).toHaveAttribute('data-icon-variant', 'themed');
  expect(new URL(page.url()).searchParams.get('icons')).toBe('style');
  expect(new URL(page.url()).searchParams.get('iconColor')).toBe('themed');
});

/** Optional installation guidance gives both a pinned CDN path and a complete NPM asset setup. */
test('studio offers optional NPM and CDN icon installation without changing CSS-only setup', async ({
  page,
}) => {
  await page.goto(url);
  await ready(page);
  await page.locator('#customize').click();
  await page.getByRole('tab', { name: 'Code & export', exact: true }).click();
  await page.getByText('Optional icon library', { exact: true }).click();
  await expect(page.locator('#icon-install-code')).toContainText(
    'npm install ui-style-kit-icons@2.0.0',
  );
  await expect(page.locator('#icon-install-code')).toContainText('monochrome');
  await page.selectOption('#icon-install-method', 'cdn');
  await expect(page.locator('#icon-install-code')).toContainText(
    'https://cdn.jsdelivr.net/npm/ui-style-kit-icons@2.0.0/',
  );
  await expect(page.locator('#setup-code')).not.toContainText('ui-style-kit-icons');
});

/** Exports must remain usable without a studio runtime or icon hydration markers. */
test('studio exports hydrated companion artwork and filters component names and classes', async ({
  page,
}) => {
  await page.goto(url);
  await ready(page);
  await page.locator('#customize').click();
  await page.getByRole('tab', { name: 'Code & export', exact: true }).click();
  await expect(page.locator('#markup-code')).toContainText('<svg');
  await expect(page.locator('#markup-code')).not.toContainText('data-studio-icon');
  await page.locator('#close-inspector').click();
  await page.getByRole('link', { name: 'Components', exact: true }).click();
  await page.locator('#component-search').fill('indeterminate');
  const preview = await ready(page);
  await expect(preview.locator('[data-component-option]:visible')).toHaveCount(1);
  await expect(preview.locator('[data-component-option="progress-indeterminate"]')).toBeVisible();
});

/** Phone navigation must not place nine full-size family cards ahead of the actual tool. */
test('studio phone catalog keeps navigation compact and all component groups reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + '?view=components');
  const preview = await ready(page);
  await expect(page.locator('#component-list')).toBeHidden();
  await page
    .getByRole('combobox', { name: 'Component group', exact: true })
    .selectOption('feedback');
  await expect(preview.locator('[data-component-option="alert-success"]')).toBeVisible();
  await expect(preview.locator('[data-component-option="button-primary"]')).toBeHidden();
  expect(
    await page.locator('#preview-b').evaluate((n) => n.getBoundingClientRect().top),
  ).toBeLessThan(1000);
});
