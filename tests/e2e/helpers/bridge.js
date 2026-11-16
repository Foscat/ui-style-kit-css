import { expect } from '@playwright/test';

/** Sets the native checkbox through its keyboard contract, including styled hidden-input switches.
 * @param {import('@playwright/test').Locator} control Bridge checkbox.
 * @param {boolean} checked Desired state.
 * @returns {Promise<void>} Resolves after the requested state is observable.
 */
export async function setBridgeChecked(control, checked) {
  if ((await control.isChecked()) !== checked) await control.press('Space');
  await expect(control).toBeChecked({ checked });
}
