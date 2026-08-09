import { expect, test } from '@playwright/test';

import { semanticComponentMarkup } from '../fixtures/semantic-component-cases.js';

// This browser contract keeps Task 11's shared fixture aligned with proven preset markup.
test('semantic runtime fixture preserves proven component structures and states', async ({ page }) => {
  await page.setContent(semanticComponentMarkup);

  const switchControl = page.locator(
    'label.ui-switch > input[type="checkbox"]:checked + .ui-switch-track > .ui-switch-thumb'
  );
  await expect(switchControl).toHaveCount(1);
  await expect(page.locator('button.ui-switch')).toHaveCount(0);

  const progress = page.locator(
    '.ui-progress[role="progressbar"][aria-valuemin="0"][aria-valuemax="100"][aria-valuenow="50"]'
  );
  await expect(progress.locator(':scope > .ui-progress-bar')).toHaveCount(1);

  await expect(page.locator('.ui-tooltip:not([role="tooltip"])')).toHaveCount(1);
  await expect(page.locator('dialog[open]')).toBeVisible();
  await expect(page.locator('.ui-modal, .ui-dialog')).toHaveCount(0);
});
