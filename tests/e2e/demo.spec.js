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

test('demo loads with default theme settings', async ({ page }) => {
  await page.goto(demoUrl);

  await expect(page).toHaveTitle(/UI Style Kit CSS Demo/i);

  await expect(page.locator('#uiSelect')).toHaveValue(defaultDemoState.ui);
  await expect(page.locator('#themeSelect')).toHaveValue(defaultDemoState.theme);
  await expect(page.locator('#modeSelect')).toHaveValue(defaultDemoState.mode);

  await expect(page.locator('body')).toHaveAttribute('data-ui', defaultDemoState.ui);
  await expect(page.locator('body')).toHaveAttribute('data-theme', defaultDemoState.theme);
  await expect(page.locator('body')).toHaveAttribute('data-mode', defaultDemoState.mode);

  await expect(page.getByRole('heading', { level: 1, name: 'UI Style Kit CSS' })).toBeVisible();
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
  const bridgeToggle = page.locator('#bridgeToggle');

  await expect(bridgeToggle).not.toBeChecked();
  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'detached');
  await expect(stylesheet).toHaveAttribute('href', 'dist/ui-style-kit.css');
  await expect(page.getByTestId('bridge-status')).toContainText('Detached');
  await expect(page.locator('.interactive-surface').first()).not.toHaveCSS('--interactive-surface-bg', /.+/);

  await bridgeToggle.check();

  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'attached');
  await expect(stylesheet).toHaveAttribute('href', 'dist/ui-style-kit.with-bridge.css');
  await expect(page.getByTestId('bridge-status')).toContainText('Attached');
  await expect(page.locator('.interactive-surface').first()).toHaveCSS('--interactive-surface-bg', /.+/);
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
    const missingBridgeTokens = elements
      .filter((element) => !getComputedStyle(element).getPropertyValue('--interactive-surface-bg').trim())
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);

    return {
      total: elements.length,
      missingHooks,
      missingVariants,
      missingBridgeTokens
    };
  }, interactableSelector);

  expect(bridgeCoverage.total).toBeGreaterThan(40);
  expect(bridgeCoverage.missingHooks).toEqual([]);
  expect(bridgeCoverage.missingVariants).toEqual([]);
  expect(bridgeCoverage.missingBridgeTokens).toEqual([]);
});

test('demo exposes the styled element and state showcase', async ({ page }) => {
  await page.goto(demoUrl);

  const showcaseItems = [
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
    'component-fields',
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
