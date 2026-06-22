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

  const attachedThumbX = await switchThumb.evaluate((thumb) => thumb.getBoundingClientRect().left);
  expect(attachedThumbX).toBeGreaterThan(detachedThumbX + 8);
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

  const sectionOrder = await page.evaluate(() => ['overview', 'components', 'native', 'bridge', 'usage']
    .map((id) => ({
      id,
      top: Math.round(document.getElementById(id).getBoundingClientRect().top + window.scrollY)
    })));
  const sortedOrder = [...sectionOrder].sort((first, second) => first.top - second.top).map(({ id }) => id);

  expect(sortedOrder).toEqual(['overview', 'components', 'native', 'bridge', 'usage']);

  const primaryNav = page.locator('nav[aria-label="Primary"]').first();
  await primaryNav.getByRole('link', { name: 'Components' }).click();

  await expect(primaryNav.getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
  await expect(primaryNav.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current', 'page');
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
