import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'index.html')).href;

// Keep the smoke-test expectations aligned with the demo's checked-in default controls.
const defaultDemoState = {
  ui: 'minimal-saas',
  theme: 'arctic-indigo',
  mode: 'light'
};

const stylePresets = [
  ['minimal-saas', 'saas'],
  ['bento', 'bento'],
  ['maximalist', 'max'],
  ['bauhaus', 'bau'],
  ['tactile', 'tactile'],
  ['neumorphism', 'neo'],
  ['retrofuturism', 'retro'],
  ['brutalism', 'brutal'],
  ['cyberpunk', 'cyber'],
  ['y2k', 'y2k'],
  ['retro-glass', 'rg']
];

const displayModes = ['light', 'dark', 'contrast'];
const interactableSelector = [
  'a[href]',
  'button:not(:disabled)',
  'input:not([type="hidden"]):not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'summary',
  'audio[controls]',
  'video[controls]'
].join(',');

async function installClipboardStub(page) {
  await page.addInitScript(() => {
    window.__copiedText = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedText.push(text);
        }
      }
    });
  });
}

async function waitForStyleKitBundle(page, expectedHref) {
  await page.waitForFunction((href) => {
    const stylesheet = document.getElementById('styleKitStylesheet');
    if (!stylesheet || stylesheet.getAttribute('href') !== href) return false;
    if (!stylesheet.sheet) return false;

    try {
      return stylesheet.sheet.cssRules.length > 0;
    } catch {
      // Cross-origin stylesheets still expose a sheet object after load.
      return true;
    }
  }, expectedHref);
}

async function setBridgeForLayoutProbe(page, attached) {
  const expectedHref = attached ? 'dist/ui-style-kit.with-bridge.css' : 'dist/ui-style-kit.css';
  const bridgeToggle = page.locator('#bridgeToggle');

  await bridgeToggle.setChecked(attached, { force: true });
  await expect(page.locator('body')).toHaveAttribute('data-bridge', attached ? 'attached' : 'detached');
  await expect(page.locator('#styleKitStylesheet')).toHaveAttribute('href', expectedHref);
  await waitForStyleKitBundle(page, expectedHref);
}

test('demo loads with default theme settings', async ({ page }) => {
  await page.goto(demoUrl);

  await expect(page).toHaveTitle(/UI Style Kit CSS \| CSS Theme and Component Preset Library/i);

  await expect(page.locator('#uiSelect')).toHaveValue(defaultDemoState.ui);
  await expect(page.locator('#themeSelect')).toHaveValue(defaultDemoState.theme);
  await expect(page.locator('#modeSelect')).toHaveValue(defaultDemoState.mode);

  await expect(page.locator('body')).toHaveAttribute('data-ui', defaultDemoState.ui);
  await expect(page.locator('body')).toHaveAttribute('data-theme', defaultDemoState.theme);
  await expect(page.locator('body')).toHaveAttribute('data-mode', defaultDemoState.mode);

  await expect(page.getByRole('heading', { level: 1, name: 'UI Style Kit CSS' })).toBeVisible();
});

test('demo control options are populated from the manifest snapshot', async ({ page }) => {
  await page.goto(demoUrl);

  const manifestState = await page.evaluate(() => ({
    presets: window.UI_STYLE_KIT_MANIFEST.presets.map(({ id, prefix, label }) => ({ id, prefix, label })),
    themes: window.UI_STYLE_KIT_MANIFEST.themes,
    modes: window.UI_STYLE_KIT_MANIFEST.modes,
    uiOptions: [...document.querySelectorAll('#uiSelect option')].map((option) => ({
      id: option.value,
      prefix: option.dataset.prefix,
      label: option.textContent.trim()
    })),
    themeOptions: [...document.querySelectorAll('#themeSelect option')].map((option) => option.value),
    modeOptions: [...document.querySelectorAll('#modeSelect option')].map((option) => option.value)
  }));

  expect(manifestState.presets.map(({ id, prefix }) => [id, prefix])).toEqual(stylePresets);
  expect(manifestState.uiOptions).toEqual(manifestState.presets);
  expect(manifestState.themeOptions).toEqual(manifestState.themes);
  expect(manifestState.modeOptions).toEqual(displayModes);
  expect(manifestState.themeOptions).toContain('royal-plum');
});

test('demo exposes project resource links', async ({ page }) => {
  await page.goto(demoUrl);

  const resources = page.getByTestId('resource-links');
  await expect(resources.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/Foscat/ui-style-kit-css');
  await expect(resources.getByRole('link', { name: 'Wiki' })).toHaveAttribute('href', 'https://github.com/Foscat/ui-style-kit-css/wiki');
  await expect(resources.getByRole('link', { name: 'npm' })).toHaveAttribute('href', 'https://www.npmjs.com/package/ui-style-kit-css');
  await expect(resources.getByRole('link', { name: 'Interactive Surface demo' })).toHaveAttribute('href', 'https://foscat.github.io/interactive-surface-css/');
  await expect(resources.getByRole('link', { name: 'Layout Style demo' })).toHaveAttribute('href', 'https://foscat.github.io/layout-style-css/');
});

test('rendered demo links resolve to page sections or external destinations', async ({ page }) => {
  await page.goto(demoUrl);

  const linkIssues = await page.evaluate(() => [...document.querySelectorAll('a[href]')]
    .map((link) => {
      const url = new URL(link.getAttribute('href'), window.location.href);
      const label = link.textContent.trim() || link.getAttribute('aria-label') || link.getAttribute('href');

      if (url.protocol === 'file:' && url.pathname === window.location.pathname && url.hash) {
        return document.getElementById(decodeURIComponent(url.hash.slice(1)))
          ? null
          : `${label}: missing ${url.hash}`;
      }

      if (url.protocol === 'http:' || url.protocol === 'https:') return null;
      if (url.protocol === 'file:' && url.pathname !== window.location.pathname) return null;

      return `${label}: unsupported ${url.href}`;
    })
    .filter(Boolean));

  expect(linkIssues).toEqual([]);
});

test('theme token workbench edits active RGB tokens and copies overrides', async ({ page }) => {
  await installClipboardStub(page);
  await page.goto(demoUrl);

  const workbench = page.getByTestId('theme-token-workbench');
  await expect(workbench).toBeVisible();
  await expect(workbench.locator('[data-token-role]')).toHaveCount(23);

  const primaryRow = workbench.locator('[data-token-role="primary"]');
  const textInput = primaryRow.locator('.demo-token-input');
  const colorInput = primaryRow.locator('.demo-token-color');

  await expect(textInput).toHaveValue('64 94 184');
  await expect(colorInput).toHaveValue('#405eb8');

  await textInput.fill('72 91 255');
  await expect(colorInput).toHaveValue('#485bff');
  await expect(page.getByTestId('theme-override-preview')).toContainText('--usk-primary-rgb: 72 91 255;');

  await colorInput.fill('#123456');
  await expect(textInput).toHaveValue('18 52 86');
  await expect(page.locator('body')).toHaveCSS('--usk-primary-rgb', '18 52 86');

  await page.getByTestId('copy-theme-override').click();
  const copiedOverride = await page.evaluate(() => window.__copiedText.at(-1));
  expect(copiedOverride).toContain(':where([data-ui][data-theme="arctic-indigo"][data-mode="light"])');
  expect(copiedOverride).toContain('--usk-primary-rgb: 18 52 86;');
});

test('demo code blocks expose copy buttons with clipboard tooltips', async ({ page }) => {
  await installClipboardStub(page);
  await page.goto(demoUrl);

  const firstCodeBlock = page.locator('#native [data-testid="code-block"]').first();
  const copyButton = firstCodeBlock.locator('[data-copy-code]');
  const tooltip = firstCodeBlock.locator('.demo-copy-tooltip');

  await expect(copyButton).toBeVisible();
  await expect(copyButton).toHaveAttribute('aria-label', /Copy code/);
  await expect(copyButton).toHaveAttribute('data-copy-tooltip-id', /^demo-copy-tooltip-/);
  await expect(tooltip).toHaveAttribute('aria-hidden', 'true');
  await expect(tooltip).toContainText(/Copy/);
  await expect(tooltip).toHaveCSS('opacity', '0');

  await copyButton.hover();
  await expect(tooltip).toHaveCSS('opacity', '1');

  await copyButton.click();
  await expect(tooltip).toContainText('Copied');
  const copiedCode = await page.evaluate(() => window.__copiedText.at(-1));
  expect(copiedCode).toContain('button:not([class])');
});

test('switching demo controls updates body attributes and rendered classes', async ({ page }) => {
  await page.goto(demoUrl);

  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.selectOption('#themeSelect', 'midnight-gold');
  await page.selectOption('#modeSelect', 'contrast');

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'cyberpunk');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'midnight-gold');
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'contrast');

  await expect(page.locator('#main .cyber-title')).toBeVisible();
  await expect(page.locator('#main .cyber-button.cyber-button-primary').first()).toBeVisible();
});

test('demo starts with the interactive surface bridge detached and can attach it', async ({ page }) => {
  await page.goto(demoUrl);

  const stylesheet = page.locator('#styleKitStylesheet');
  const bridgePreview = page.getByTestId('bridge-preview');
  const bridgeToggle = bridgePreview.locator('#bridgeToggle');
  const switchTrack = bridgePreview.getByTestId('bridge-switch-track');
  const switchThumb = bridgePreview.getByTestId('bridge-switch-thumb');

  await expect(bridgeToggle).not.toBeChecked();
  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'detached');
  await expect(stylesheet).toHaveAttribute('href', 'dist/ui-style-kit.css');
  await expect(page.getByTestId('bridge-status')).toContainText('Detached');
  await expect(page.locator('.interactive-surface').first()).not.toHaveCSS('--interactive-surface-bg', /.+/);
  await expect(bridgePreview.getByTestId('bridge-switch')).toBeVisible();
  await expect(page.locator('.demo-controls').getByTestId('bridge-switch')).toHaveCount(0);
  await expect(switchTrack).toBeVisible();
  await expect(switchTrack).toHaveCSS('border-radius', /px|%/);

  const detachedThumbX = await switchThumb.evaluate((thumb) => thumb.getBoundingClientRect().left);

  await bridgeToggle.check();

  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'attached');
  await expect(stylesheet).toHaveAttribute('href', 'dist/ui-style-kit.with-bridge.css');
  await expect(page.getByTestId('bridge-status')).toContainText('Attached');
  await expect(page.locator('.interactive-surface').first()).toHaveCSS('--interactive-surface-bg', /.+/);

  // Wait for the CSS thumb transition to settle before comparing geometry across engines.
  await expect.poll(() => switchThumb.evaluate((thumb) => thumb.getBoundingClientRect().left))
    .toBeGreaterThan(detachedThumbX + 8);
});

test('attached bridge wires every enabled interactable element to interactive surface hooks', async ({ page }) => {
  await page.goto(demoUrl);

  const detachedHookCount = await page.evaluate((selector) => [...document.querySelectorAll(selector)]
    .filter((element) => element.classList.contains('interactive-surface')).length, interactableSelector);
  expect(detachedHookCount).toBe(0);

  await page.locator('#bridgeToggle').check();
  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'attached');

  const bridgeCoverage = await page.evaluate((selector) => {
    const elements = [...document.querySelectorAll(selector)].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const missingHooks = elements
      .filter((element) => !element.classList.contains('interactive-surface'))
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);
    const missingVariants = elements
      .filter((element) => !element.dataset.surfaceVariant)
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);
    const missingLevels = elements
      .filter((element) => !element.dataset.surfaceLevel)
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);
    const missingBridgeTokens = elements
      .filter((element) => !getComputedStyle(element).getPropertyValue('--interactive-surface-bg').trim())
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);

    return {
      total: elements.length,
      missingHooks,
      missingVariants,
      missingLevels,
      missingBridgeTokens
    };
  }, interactableSelector);

  expect(bridgeCoverage.total).toBeGreaterThan(40);
  expect(bridgeCoverage.missingHooks).toEqual([]);
  expect(bridgeCoverage.missingVariants).toEqual([]);
  expect(bridgeCoverage.missingLevels).toEqual([]);
  expect(bridgeCoverage.missingBridgeTokens).toEqual([]);
});

test('attached bridge shows three distinct interactive surface state levels', async ({ page }) => {
  await page.goto(demoUrl);

  const bridgePreview = page.getByTestId('bridge-preview');
  await expect(bridgePreview.getByTestId('bridge-level-1')).toBeVisible();
  await expect(bridgePreview.getByTestId('bridge-level-2')).toBeVisible();
  await expect(bridgePreview.getByTestId('bridge-level-3')).toBeVisible();

  await bridgePreview.locator('#bridgeToggle').check();
  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'attached');
  await page.waitForFunction(() => {
    const surfaces = [1, 2, 3].map((level) => document.querySelector(`[data-testid="bridge-level-${level}"]`));
    if (surfaces.some((surface) => !surface)) return false;

    const signatures = surfaces.map((surface) => {
      const styles = getComputedStyle(surface);
      return `${styles.backgroundColor}|${styles.borderColor}|${styles.boxShadow}`;
    });

    return new Set(signatures).size === 3
      && signatures.every((signature) => !signature.startsWith('rgba(0, 0, 0, 0)|'));
  });

  const levelSignatures = await page.evaluate(() => [1, 2, 3].map((level) => {
    const surface = document.querySelector(`[data-testid="bridge-level-${level}"]`);
    const styles = getComputedStyle(surface);

    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
      levelBg: styles.getPropertyValue('--interactive-surface-level-bg').trim(),
      hoverOpacity: styles.getPropertyValue('--interactive-surface-state-layer-opacity-hover').trim()
    };
  }));

  const visualSignatures = new Set(levelSignatures
    .map(({ backgroundColor, borderColor, boxShadow }) => `${backgroundColor}|${borderColor}|${boxShadow}`));

  expect(visualSignatures.size, JSON.stringify(levelSignatures, null, 2)).toBe(3);
  expect(levelSignatures.every(({ levelBg, hoverOpacity }) => levelBg && hoverOpacity)).toBe(true);
});

test('demo exposes the styled element and state showcase', async ({ page }) => {
  await page.goto(demoUrl);

  const showcaseItems = [
    'component-controls',
    'component-buttons',
    'component-button-hover',
    'component-button-active',
    'component-button-disabled',
    'component-button-busy',
    'component-badges',
    'component-alerts',
    'component-progress',
    'component-table',
    'component-spinner',
    'component-tooltips',
    'component-fields',
    'theme-token-workbench',
    'native-text',
    'native-lists',
    'native-media',
    'native-forms',
    'native-buttons',
    'native-table',
    'native-disclosure-dialog',
    'native-meter-progress',
    'native-semantics',
    'utility-classes',
    'usage-imports',
    'bridge-preview'
  ];

  for (const item of showcaseItems) {
    await expect(page.getByTestId(item), `${item} should be visible`).toBeVisible();
  }

  await expect(page.getByTestId('component-button-hover')).toHaveText(/Hover target/i);
  await page.getByTestId('component-button-hover').hover();
  await expect(page.getByTestId('component-button-focus')).toBeVisible();
  await page.getByTestId('component-button-focus').focus();
});

test('buttons progress loading and tooltip examples share a polished controls card', async ({ page }) => {
  await page.goto(demoUrl);

  const controlsCard = page.getByTestId('component-controls');
  await expect(controlsCard).toBeVisible();
  await expect(controlsCard.getByTestId('component-buttons')).toBeVisible();
  await expect(controlsCard.getByTestId('component-progress')).toBeVisible();
  await expect(controlsCard.getByTestId('component-spinner')).toBeVisible();
  await expect(controlsCard.getByTestId('component-tooltips')).toBeVisible();

  const containerIds = await page.evaluate(() => ['component-buttons', 'component-progress', 'component-spinner']
    .map((testId) => document.querySelector(`[data-testid="${testId}"]`)?.closest('article')?.dataset.testid));
  expect(containerIds).toEqual(['component-controls', 'component-controls', 'component-controls']);

  const controlsBox = await controlsCard.boundingBox();
  const tooltipBox = await controlsCard.getByTestId('component-tooltips').boundingBox();
  expect(tooltipBox.width).toBeLessThanOrEqual(controlsBox.width);
});

test('component showcase avoids overlap and oversized empty card areas', async ({ page }) => {
  await page.setViewportSize({ width: 1696, height: 1155 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retrofuturism');
  await page.selectOption('#modeSelect', 'dark');

  const controlOverlaps = await page.getByTestId('component-controls').evaluate((card) => {
    const targets = [...card.querySelectorAll('section[data-testid]')]
      .map((section) => ({
        id: section.dataset.testid,
        rect: section.getBoundingClientRect()
      }));
    const overlaps = [];

    for (let firstIndex = 0; firstIndex < targets.length; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < targets.length; secondIndex++) {
        const first = targets[firstIndex];
        const second = targets[secondIndex];
        const width = Math.min(first.rect.right, second.rect.right) - Math.max(first.rect.left, second.rect.left);
        const height = Math.min(first.rect.bottom, second.rect.bottom) - Math.max(first.rect.top, second.rect.top);

        if (width > 2 && height > 2) overlaps.push(`${first.id}/${second.id}`);
      }
    }

    return overlaps;
  });

  const deadSpace = await page.locator('#components .demo-showcase-grid > article').evaluateAll((cards) => cards.map((card) => {
    const cardRect = card.getBoundingClientRect();
    const visibleChildren = [...card.children].filter((child) => {
      const rect = child.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const contentBottom = Math.max(...visibleChildren.map((child) => child.getBoundingClientRect().bottom));

    return {
      id: card.dataset.testid,
      emptyBlockEnd: Math.round(cardRect.bottom - contentBottom)
    };
  }));

  expect(controlOverlaps).toEqual([]);
  expect(Math.max(...deadSpace.map(({ emptyBlockEnd }) => emptyBlockEnd)), JSON.stringify(deadSpace, null, 2)).toBeLessThanOrEqual(128);
});

test('native form samples provide padded block layout for unclassed controls', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retrofuturism');
  await page.selectOption('#modeSelect', 'dark');

  const nativeLabelMetrics = await page.getByTestId('native-forms').locator('label').evaluateAll((labels) => labels
    .filter((label) => label.querySelector('input, select, textarea'))
    .map((label) => {
      const control = label.querySelector('input, select, textarea');
      const labelStyles = getComputedStyle(label);
      const labelRect = label.getBoundingClientRect();
      const controlRect = control.getBoundingClientRect();

      return {
        display: labelStyles.display,
        rowGap: labelStyles.rowGap,
        inlinePadding: Math.round(controlRect.left - labelRect.left)
      };
    }));

  expect(nativeLabelMetrics.length).toBeGreaterThan(6);
  expect(nativeLabelMetrics.every(({ display }) => display !== 'inline'), JSON.stringify(nativeLabelMetrics, null, 2)).toBe(true);
  expect(nativeLabelMetrics.every(({ rowGap }) => parseFloat(rowGap) >= 6), JSON.stringify(nativeLabelMetrics, null, 2)).toBe(true);
  expect(nativeLabelMetrics.every(({ inlinePadding }) => inlinePadding >= 0), JSON.stringify(nativeLabelMetrics, null, 2)).toBe(true);
});

test('native dialog demo opens a real modal with a themed backdrop', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.selectOption('#modeSelect', 'dark');

  await page.getByTestId('native-modal-open').click();

  const modal = page.getByTestId('native-modal-dialog');
  await expect(modal).toBeVisible();

  const modalState = await modal.evaluate((dialog) => ({
    isOpen: dialog.open,
    isModal: dialog.matches(':modal'),
    backdropBackground: getComputedStyle(dialog, '::backdrop').backgroundColor
  }));

  expect(modalState.isOpen).toBe(true);
  expect(modalState.isModal).toBe(true);
  expect(modalState.backdropBackground).not.toBe('rgba(0, 0, 0, 0)');

  await page.getByTestId('native-modal-close').click();
  await expect(modal).not.toBeVisible();
});

test('tooltip treatments are visible and structurally distinct across UI styles', async ({ page }) => {
  await page.goto(demoUrl);

  const tooltipSignatures = [];

  for (const [ui, prefix] of stylePresets) {
    await page.selectOption('#uiSelect', ui);

    await expect(page.getByTestId('component-tooltips')).toBeVisible();
    await expect(page.locator(`.${prefix}-tooltip`).first()).toBeVisible();

    const signature = await page.locator(`.${prefix}-tooltip`).first().evaluate((tooltip) => {
      const styles = getComputedStyle(tooltip);

      return [
        styles.borderRadius,
        styles.borderStyle,
        styles.borderWidth,
        styles.backgroundImage === 'none' ? 'none' : 'image',
        styles.boxShadow === 'none' ? 'none' : 'shadow',
        styles.clipPath === 'none' ? 'none' : 'clip',
        styles.textTransform,
        styles.letterSpacing
      ].join('|');
    });

    tooltipSignatures.push([ui, signature]);
  }

  const uniqueSignatures = new Set(tooltipSignatures.map(([, signature]) => signature));
  expect(uniqueSignatures.size, JSON.stringify(tooltipSignatures, null, 2)).toBeGreaterThanOrEqual(8);
});

test('spinner treatments are structurally distinct across UI styles', async ({ page }) => {
  await page.goto(demoUrl);

  const spinnerSignatures = [];

  for (const [ui, prefix] of stylePresets) {
    await page.selectOption('#uiSelect', ui);

    const signature = await page.locator(`.${prefix}-spinner:not(.${prefix}-spinner-sm):not(.${prefix}-spinner-lg)`).first()
      .evaluate((spinner) => {
        const styles = getComputedStyle(spinner);

        return [
          styles.borderRadius,
          styles.borderStyle,
          styles.borderWidth,
          styles.backgroundImage === 'none' ? 'none' : 'image',
          styles.boxShadow === 'none' ? 'none' : 'shadow',
          styles.clipPath === 'none' ? 'none' : 'clip',
          styles.outlineStyle,
          styles.outlineWidth
        ].join('|');
      });

    spinnerSignatures.push([ui, signature]);
  }

  const uniqueSignatures = new Set(spinnerSignatures.map(([, signature]) => signature));
  expect(uniqueSignatures.size, JSON.stringify(spinnerSignatures, null, 2)).toBeGreaterThanOrEqual(9);
});

test('demo component cards keep balanced rows at square and tablet widths', async ({ page }) => {
  for (const viewport of [
    { width: 900, height: 900 },
    { width: 768, height: 1024 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(demoUrl);

    const rowSpreads = await page.locator('#components .demo-showcase-grid > article').evaluateAll((cards) => {
      const rows = new Map();

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const rowKey = Math.round(rect.top);
        const row = rows.get(rowKey) || [];
        row.push(Math.round(rect.height));
        rows.set(rowKey, row);
      }

      return [...rows.values()]
        .filter((row) => row.length > 1)
        .map((row) => Math.max(...row) - Math.min(...row));
    });

    expect(rowSpreads.length, `${viewport.width}x${viewport.height} should render multi-card rows`).toBeGreaterThan(0);
    expect(Math.max(...rowSpreads), `${viewport.width}x${viewport.height} row height spreads`).toBeLessThanOrEqual(72);
  }
});

test('demo primary navigation follows page order and updates the current link', async ({ page }) => {
  await page.goto(demoUrl);

  const sectionOrder = await page.evaluate(() => ['overview', 'tokens', 'components', 'native', 'bridge', 'usage']
    .map((id) => ({
      id,
      top: Math.round(document.getElementById(id).getBoundingClientRect().top + window.scrollY)
    })));
  const sortedOrder = [...sectionOrder].sort((first, second) => first.top - second.top).map(({ id }) => id);

  expect(sortedOrder).toEqual(['overview', 'tokens', 'components', 'native', 'bridge', 'usage']);

  const primaryNav = page.locator('nav[aria-label="Primary"]').first();
  await expect(primaryNav.getByRole('link')).toHaveText([
    'Overview',
    'Tokens',
    'Components',
    'Native HTML',
    'Bridge',
    'Usage'
  ]);
  await primaryNav.getByRole('link', { name: 'Components' }).click();

  await expect(primaryNav.getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
  await expect(primaryNav.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current', 'page');
});

test('layout wrappers contain long text without page-level overflow', async ({ page }) => {
  const longText = 'UnbrokenLayoutWrapperContentToken'.repeat(10);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1024, height: 768 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(demoUrl);

    for (const [ui, prefix] of stylePresets) {
      await page.selectOption('#uiSelect', ui);
      await page.evaluate(({ longText: injectedText, prefix: classPrefix }) => {
        document.querySelector('main').innerHTML = `
          <section class="${classPrefix}-page">
            <div class="${classPrefix}-container ${classPrefix}-stack" data-testid="overflow-wrapper">
              <article class="${classPrefix}-card ${classPrefix}-stack">
                <p class="${classPrefix}-kicker">${injectedText}</p>
                <h1 class="${classPrefix}-title">${injectedText}</h1>
                <p class="${classPrefix}-copy">${injectedText}</p>
                <nav class="${classPrefix}-nav" aria-label="Overflow probe navigation">
                  <a class="${classPrefix}-nav-link" href="#main">${injectedText}</a>
                </nav>
              </article>
            </div>
          </section>`;
      }, { longText, prefix });

      const overflowReport = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const candidates = [...document.querySelectorAll('[data-testid="overflow-wrapper"], [data-testid="overflow-wrapper"] *')];
        const overflowers = candidates
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: element.className,
              left: Math.floor(rect.left),
              right: Math.ceil(rect.right),
              width: Math.ceil(rect.width)
            };
          })
          .filter(({ left, right }) => left < -1 || right > viewportWidth + 1);

        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth,
          overflowers
        };
      });

      expect(
        overflowReport.documentWidth,
        `${ui} should not force page overflow at ${viewport.width}px: ${JSON.stringify(overflowReport, null, 2)}`
      ).toBeLessThanOrEqual(overflowReport.viewportWidth + 1);
      expect(overflowReport.overflowers, `${ui} overflowers at ${viewport.width}px`).toEqual([]);
    }
  }
});

test('demo avoids page-level overflow across the responsive orientation matrix', async ({ page }) => {
  test.setTimeout(90_000);

  const viewports = [
    { width: 320, height: 568 },
    { width: 568, height: 320 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ];
  const representativeStates = [
    { ui: 'minimal-saas', mode: 'light', bridge: false },
    { ui: 'cyberpunk', mode: 'dark', bridge: true },
    { ui: 'retro-glass', mode: 'contrast', bridge: true }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(demoUrl);

    for (const state of representativeStates) {
      await page.selectOption('#uiSelect', state.ui);
      await page.selectOption('#modeSelect', state.mode);
      await setBridgeForLayoutProbe(page, state.bridge);

      const overflowReport = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const pageOverflow = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - viewportWidth;
        const incoherentOverflow = [...document.body.querySelectorAll('*')]
          .filter((element) => {
            const styles = getComputedStyle(element);
            if (styles.position === 'fixed') return false;
            if (styles.overflowX === 'auto' || styles.overflowX === 'scroll') return false;

            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
          })
          .slice(0, 8)
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            testId: element.getAttribute('data-testid') || '',
            className: element.className,
            rect: element.getBoundingClientRect().toJSON()
          }));

        return { pageOverflow, incoherentOverflow };
      });

      expect(
        overflowReport.pageOverflow,
        `${state.ui}/${state.mode}/bridge-${state.bridge} overflow at ${viewport.width}x${viewport.height}: ${JSON.stringify(overflowReport, null, 2)}`
      ).toBeLessThanOrEqual(1);
      expect(overflowReport.incoherentOverflow).toEqual([]);
      await expect(page.locator('main')).toBeVisible();
    }
  }
});

test('token workbench uses a responsive single-column layout on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl);
  await page.locator('nav[aria-label="Primary"]').first().getByRole('link', { name: 'Tokens' }).click();

  const gridColumns = await page.getByTestId('theme-token-workbench').locator('.demo-token-workbench-grid')
    .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);

  expect(gridColumns).toBe(1);
});

test('mobile controls showcase stacks panels without cramped columns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.selectOption('#modeSelect', 'dark');
  await page.locator('nav[aria-label="Primary"]').first().getByRole('link', { name: 'Components' }).click();

  const panelMetrics = await page.getByTestId('component-controls').locator('section[data-testid]').evaluateAll((panels) => panels
    .map((panel) => {
      const rect = panel.getBoundingClientRect();

      return {
        id: panel.dataset.testid,
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width)
      };
    }));
  const leftSpread = Math.max(...panelMetrics.map(({ left }) => left)) - Math.min(...panelMetrics.map(({ left }) => left));

  expect(panelMetrics.map(({ id }) => id)).toEqual([
    'component-buttons',
    'component-progress',
    'component-spinner',
    'component-tooltips'
  ]);
  expect(leftSpread, JSON.stringify(panelMetrics, null, 2)).toBeLessThanOrEqual(2);
  expect(panelMetrics.every(({ width }) => width >= 240), JSON.stringify(panelMetrics, null, 2)).toBe(true);
  expect(panelMetrics.map(({ top }) => top)).toEqual([...panelMetrics.map(({ top }) => top)].sort((first, second) => first - second));
});

test('table showcase has readable inset spacing inside its card', async ({ page }) => {
  await page.goto(demoUrl);

  await expect(page.getByTestId('component-table')).toHaveClass(/demo-table-card/);

  const spacing = await page.getByTestId('component-table').evaluate((card) => {
    const table = card.querySelector('table');
    const cardRect = card.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const styles = getComputedStyle(card);

    return {
      left: Math.round(tableRect.left - cardRect.left),
      right: Math.round(cardRect.right - tableRect.right),
      paddingInlineStart: Math.round(parseFloat(styles.paddingInlineStart)),
      paddingInlineEnd: Math.round(parseFloat(styles.paddingInlineEnd))
    };
  });

  expect(spacing.left).toBeGreaterThanOrEqual(12);
  expect(spacing.right).toBeGreaterThanOrEqual(12);
  expect(spacing.paddingInlineStart).toBeGreaterThanOrEqual(16);
  expect(spacing.paddingInlineEnd).toBeGreaterThanOrEqual(16);
});

test('utility showcase demonstrates distinct utility jobs', async ({ page }) => {
  await page.goto(demoUrl);

  await expect(page.getByTestId('utility-classes')).toBeVisible();
  await expect(page.getByTestId('utility-color-grid')).toBeVisible();
  await expect(page.getByTestId('utility-surface-grid')).toBeVisible();
  await expect(page.getByTestId('utility-layout-sample')).toBeVisible();
  await expect(page.getByTestId('utility-color-chip')).toHaveCount(6);

  const utilityText = await page.getByTestId('utility-classes').innerText();
  expect(utilityText).not.toContain('Primary text utility');
  expect(utilityText).toContain('Action emphasis');
  expect(utilityText).toContain('Inset content');
  expect(utilityText).toContain('Pill shape');
});

test('neutral demo buttons keep theme text color across styles and modes', async ({ page }) => {
  await page.goto(demoUrl);

  for (const [ui, prefix] of stylePresets) {
    await page.selectOption('#uiSelect', ui);

    for (const mode of displayModes) {
      await page.selectOption('#modeSelect', mode);

      const colors = await page.evaluate((tokenPrefix) => {
        const neutralButton = [...document.querySelectorAll('button')]
          .find((button) => button.textContent.trim() === 'Neutral');
        const probe = document.createElement('span');

        // Resolve the CSS custom property through computed styles, matching browser cascade behavior.
        probe.style.color = `var(--${tokenPrefix}-text)`;
        document.body.append(probe);

        const buttonColor = getComputedStyle(neutralButton).color;
        const themeTextColor = getComputedStyle(probe).color;
        probe.remove();

        return { buttonColor, themeTextColor };
      }, prefix);

      expect(colors.buttonColor, `${ui}/${mode} neutral button text`).toBe(colors.themeTextColor);
    }
  }
});
